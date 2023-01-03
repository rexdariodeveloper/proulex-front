import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { HashidsService } from './hashids.service';
import { JsonResponse } from '@models/json-response';
import { FormArray, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';


export abstract class FichaDataService implements Resolve<any>
{
    datos: any;
    onDatosChanged: BehaviorSubject<any>;
    cargando: boolean = false;
    id: number = null;
    alias: string = null;
    idExtra: number = null;
    idNodo: number = null;
    usarNodo: boolean = false;
    url: string = null;
    filtros: any;
    afectar: boolean = false;

    consultasIniciales: string[] = [
        'getDatos'
    ];

    onErrorGuardarChanged: BehaviorSubject<boolean> = new BehaviorSubject(null);

    /**
     * Constructor
     *
     * @param {HttpService} _httpClient
     */
    constructor(
        public _httpClient: HttpService,
        public snackBar: MatSnackBar,
        public hashid: HashidsService,
        public translate?: TranslateService,
    ) {
        // Set the defaults
        this.onDatosChanged = new BehaviorSubject(null);
    }

    setUrl(url: string) {
        this.url = url;
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        return new Promise((resolve, reject) => {
            this.url = route.data['url'];
            this.usarNodo = route.data['usarNodo'];
            this.id = this.hashid.decode(route.params?.id);
            this.alias = route.params?.alias;
            this.idNodo = route.params?.idNodo ? this.hashid.decode(route.params?.idNodo) : null;
            this.idExtra = route.params?.idExtra ? this.hashid.decode(route.params?.idExtra) : null;

            let initResolve: Promise<any>[] = this.consultasIniciales.map(consultaStr => {
                return this[consultaStr]();
            });

            Promise.all(initResolve).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }


    setDatos(datos: any) {
        this.datos = datos;
        this.onDatosChanged.next(this.datos);
    }

    /**
     * Get datos
     *
     * @returns {Promise<any>}
     */
    /**
 * Get datos
 *
 * @returns {Promise<any>}
 */
    getDatos(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cargando = true;
            let url = '';

            if (this.id && this.idExtra) {
                url = this.url + this.id + `/${this.idExtra}`;
            } else if (this.alias) {
                url = this.url + this.alias;
            } else if (this.id) {
                url = this.url + (this.id ? this.id : '');
            } else if (this.usarNodo && this.idNodo) {
                url = this.url + (this.idNodo ? '/' + this.idNodo : '');
            } else {
                url = this.url + (this.idExtra ? `extra/${this.idExtra}` : '');
            }


            this._httpClient.get(url, true)
                .subscribe((response: any) => {
                    this.cargando = false;
                    if (response.status == 200) {
                        this.datos = response.data;
                    } else {
                        this.datos = [];
                        this.snackBar.open(response.message, 'OK', {
                            duration: 5000,
                        });
                    }
                    this.onDatosChanged.next(this.datos);
                    resolve(response);
                }, err => {
                    this.datos = [];
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    this.onDatosChanged.next(this.datos);
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });

        });

    }


    getDatosFiltros(filtros: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cargando = true;
            this._httpClient.post(filtros, this.url + '/filtros', true)
                .subscribe((response: any) => {
                    this.cargando = false;
                    if (response.status == 200) {
                        this.datos = response.data;

                        if (this.datos.length == 0) {
                            this.snackBar.open(this.translate.instant('MENSAJE.SIN_REGISTROS'), 'OK', { duration: 5000 });
                        }
                    } else {
                        this.datos = [];
                        this.snackBar.open(response.message, 'OK', {
                            duration: 5000,
                        });
                    }
                    this.onDatosChanged.next(this.datos);
                    resolve(response);
                }, err => {
                    this.datos = [];
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    this.onDatosChanged.next(this.datos);
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });

    }

    validateAllFormFields(formGroup: FormGroup | FormGroup[] | FormArray) {
        if (formGroup instanceof FormGroup) {
            Object.keys(formGroup.controls).forEach(field => {
                const control = formGroup.get(field);
                control.markAsTouched({ onlySelf: true });
            });
        } else if (formGroup instanceof FormArray) {
            Object.keys(formGroup.controls).forEach(field => {
                const control = formGroup.get(field);
                if(control instanceof FormGroup || control instanceof FormArray)
                    this.validateAllFormFields(control);
                else
                    control.markAsTouched({ onlySelf: true });
            });
        } else {
            formGroup.forEach((f) => {
                Object.keys(f.controls).forEach(field => {
                    const control = f.get(field);
                    control.markAsTouched({ onlySelf: true });
                });
            });
        }
    }


    guardar(data: any, url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cargando = true;

            this._httpClient.post(data, url, true)
                .subscribe((response: any) => {
                    this.cargando = false;
                    if (response.status == 200) {
                        this.datos = response.data;
                    } else {
                        let snackbarError;
                        switch (response.status) {
                            case 1557:
                                snackbarError = this.snackBar.open(this.getError(response), 'OK', {
                                    duration: 5000,
                                });
                                break;
                            case 1558:
                                snackbarError = this.snackBar.open(this.translate.instant('MENSAJE.CORREO_EN_USO').replace("#", this.getError(response)), 'OK', {
                                    duration: 5000,
                                });
                                break;
                            default:
                                this.datos = [];
                                snackbarError = this.snackBar.open(response.message, 'OK', {
                                    duration: 5000,
                                });
                        }
                        snackbarError.afterDismissed().subscribe(o => {
                            this.onErrorGuardarChanged.next(true);
                        });
                    }

                    resolve(response);
                }, err => {
                    this.datos = [];
                    this.cargando = false;

                    if (err.error?.status != 900) {
                        let snackbarError = this.snackBar.open(this.getError(err), 'OK', {
                            duration: 5000,
                        });
                        snackbarError.afterDismissed().subscribe(o => {
                            this.onErrorGuardarChanged.next(true);
                        });
                    }

                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    eliminar(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.put(null, url, true)
                .subscribe((response: any) => {
                    if (response.status == 200) {
                        this.datos = response.data;
                    } else {
                        this.datos = [];
                        this.snackBar.open(response.message, 'OK', {
                            duration: 5000,
                        });
                    }
                    resolve(response);

                }, err => {
                    this.datos = [];
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });

                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    get(url: string, auth: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(url, true)
                .subscribe((response: any) => {
                    if (response.status == 200) {
                        this.datos = response.data;
                    } else {
                        this.datos = [];
                        this.snackBar.open(response.message, 'OK', {
                            duration: 5000,
                        });
                    }
                    resolve(response);

                }, err => {
                    this.datos = [];
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });

                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    post(data: any, url: string, auth: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(data, url, true)
                .subscribe((response: any) => {
                    if (response.status == 200) {
                        this.datos = response.data;
                    } else {
                        this.datos = [];
                        this.snackBar.open(response.message, 'OK', {
                            duration: 5000,
                        });
                    }
                    resolve(response);

                }, err => {
                    this.datos = [];
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });

                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }


    eliminarFisico(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.delete(url, true)
                .subscribe((response: any) => {
                    if (response.status == 200) {
                        this.datos = response.data;
                    } else {
                        this.datos = [];
                        this.snackBar.open(response.message, 'OK', {
                            duration: 5000,
                        });
                    }
                    resolve(response);

                }, err => {
                    this.datos = [];
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });

                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }


    rechazar(data: any, url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cargando = true;

            this._httpClient.post(data, url, true)
                .subscribe((response: any) => {
                    this.cargando = false;

                    if (response.status == 200) {
                        this.datos = response.data;
                    } else {
                        if (response.status == 1557) {
                            this.snackBar.open(this.getError(response), 'OK', { duration: 5000, });
                        } else {
                            this.datos = [];
                            this.snackBar.open(response.message, 'OK', { duration: 5000, });
                        }
                    }

                    resolve(response);
                }, err => {
                    this.datos = [];
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });

                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    cancelar(data: any, url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cargando = true;

            this._httpClient.post(data, url, true)
                .subscribe((response: any) => {
                    this.cargando = false;

                    if (response.status == 200) {
                        this.datos = response.data;
                    } else {
                        if (response.status == 1557) {
                            this.snackBar.open(this.getError(response), 'OK', { duration: 5000, });
                        } else {
                            this.datos = [];
                            this.snackBar.open(response.message, 'OK', { duration: 5000, });
                        }
                    }

                    resolve(response);
                }, err => {
                    this.datos = [];
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });

                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    aprobar(data: any, url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cargando = true;
            this._httpClient.post(data, url, true)
                .subscribe((response: any) => {
                    this.cargando = false;
                    if (response.status == 200) {
                        this.datos = response.data;
                    } else {
                        if (response.status == 1557) {
                            this.snackBar.open(this.getError(response), 'OK', { duration: 5000, });
                        } else {
                            this.datos = [];
                            this.snackBar.open(response.message, 'OK', { duration: 5000, });
                        }
                    }
                    resolve(response);
                }, err => {
                    this.datos = [];
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    getExcel(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cargando = true;
            this._httpClient.get_file(url, true)
                .subscribe((response: any) => {
                    this.cargando = false;
                    this._httpClient.downloadExcel(response);
                    resolve(response);

                }, err => {
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    getArchivo(url: string): Promise<any> {
        this.cargando = true;
        return new Promise((resolve, reject) => {
            this._httpClient.get_file(url, true)
                .subscribe((response: any) => {

                    this._httpClient.downloadArchivo(response);
                    resolve(response);
                    this.cargando = false;

                }, err => {
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    getArchivoURL(url: string, filtros: any, detalles: any = {}): Promise<any> {
        this.cargando = true;
        return new Promise((resolve, reject) => {
            this._httpClient.post_get_file(filtros, url, true)
                .subscribe((response: any) => {
                    const blob = new Blob([response.body], { type: response.body.type });
                    let data = URL.createObjectURL(blob);
                    resolve(data);
                    this.onDatosChanged.next({ url: data, detalles: detalles });
                    this.cargando = false;

                }, err => {
                    this.onDatosChanged.next({ url: null, detalles: detalles });
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    getPDF(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get_file(url, true)
                .subscribe((response: any) => {

                    this._httpClient.downloadPDF(response);
                    resolve(response);

                }, err => {
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    getExcelConFiltros(url: string, filtros: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post_get_file(filtros, url, true)
                .subscribe((response: any) => {

                    this._httpClient.downloadExcel(response);
                    resolve(response);

                }, err => {
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    getPDFConFiltros(url: string, filtros: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post_get_file(filtros, url, true)
                .subscribe((response: any) => {

                    this._httpClient.downloadPDF(response);
                    resolve(response);

                }, err => {
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    getZipConFiltros(url: string, filtros: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post_get_file(filtros, url, true)
                .subscribe((response: any) => {

                    this._httpClient.downloadArchivo(response);
                    resolve(response);

                }, err => {
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    imprimirPDFConFiltros(url: string, filtros: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post_get_file(filtros, url, true)
                .subscribe((response: any) => {

                    this._httpClient.printPDF(response);
                    resolve(response);

                }, err => {
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    getError(error: HttpErrorResponse) {
        return this._httpClient.getError(error);
    }

    cambiarOrden(previousIndex: number, currentIndex: number, url: string) {
        return new Promise((resolve, reject) => {
            this._httpClient.put(null, url + (previousIndex) + '/' + (currentIndex), true)
                .subscribe((response: any) => {
                    if (response.status == 200) {
                        this.datos = response.data;
                    } else {
                        this.datos = [];
                        this.snackBar.open(response.message, 'OK', {
                            duration: 5000,
                        });
                    }
                    resolve(response);

                }, err => {
                    this.datos = [];
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });

                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    enviar(data: any, url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cargando = true;

            this._httpClient.post(data, url, true)
                .subscribe((response: any) => {
                    this.cargando = false;

                    if (response.status == 200) {
                        this.datos = response.data;
                    } else {
                        if (response.status == 1557) {
                            this.snackBar.open(this.getError(response), 'OK', { duration: 5000, });
                        } else {
                            this.datos = [];
                            this.snackBar.open(response.message, 'OK', { duration: 5000, });
                        }
                    }

                    resolve(response);
                }, err => {
                    this.datos = [];
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });

                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    downloadFile(url: string, extension?: string): Promise<any> {
		this.cargando = true;

		return new Promise((resolve, reject) => {
			this._httpClient.get_file(url, true)
				.subscribe((response: any) => {
					this._httpClient.downloadArchivo(response, extension);
					resolve(response);
					this.cargando = false;
				}, err => {
					this.cargando = false;
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}
}
