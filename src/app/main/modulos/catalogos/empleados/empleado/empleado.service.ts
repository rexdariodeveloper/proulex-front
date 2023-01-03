import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { EstadoService } from '@app/main/services/estado.service';
import { ProgramaService } from '@app/main/services/programa.service';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { JsonResponse } from '@models/json-response';
import { ArchivoService } from '@app/main/services/archivo.service';
import { ArchivosEstructurasCarpetas } from '@app/main/modelos/mapeos/archivos-estructuras-carpetas';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { ArchivoProjection } from '@models/archivo';

@Injectable()
export class EmpleadoService extends FichaDataService implements Resolve<any>{

	onListaEstadoNacimientoChanged: BehaviorSubject <EstadoComboProjection[]> = new BehaviorSubject(null);
	onListaEstadoChanged: BehaviorSubject <EstadoComboProjection[]> = new BehaviorSubject(null);
	onProgramasChanged: BehaviorSubject <EstadoComboProjection[]> = new BehaviorSubject(null);
	onDocumentoUploadChanged: BehaviorSubject <number> = new BehaviorSubject(null);
	onArchivoChanged: BehaviorSubject <ArchivoProjection> = new BehaviorSubject(null);

    constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private estadoService: EstadoService,
		private programaService: ProgramaService,
		private _archivoService: ArchivoService
    ) {
        super(_httpClient, snackBar, hashid);
	}
	
	/**
	 * Get combo estados
	 *
	 * @returns {Promise<any>}
	 */
	 getListaEstadoNacimiento(paisId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.estadoService.getCombo(paisId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onListaEstadoNacimientoChanged.next(response.data);
					} else {
						this.onListaEstadoNacimientoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onListaEstadoNacimientoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	/**
	 * Get combo estados
	 *
	 * @returns {Promise<any>}
	 */
	 getListaEstado(paisId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.estadoService.getCombo(paisId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onListaEstadoChanged.next(response.data);
					} else {
						this.onListaEstadoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onListaEstadoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getProgramasPorIdioma(idiomaId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.programaService.getProgramasByIdioma(idiomaId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onProgramasChanged.next(response.data);
					} else {
						this.onProgramasChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onProgramasChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	subirDocumento(archivo: File): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._archivoService.fileUpload(archivo,ArchivosEstructurasCarpetas.DOCUMENTOS.documentos,ControlesMaestrosMultiples.CMM_EMP_TipoArchivo.DOCUMENTO,false,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onDocumentoUploadChanged.next(response.data);
					} else {
						this.onDocumentoUploadChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onDocumentoUploadChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getDocumento(archivoId: number): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._archivoService.getProjection(archivoId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onArchivoChanged.next(response.data);
					} else {
						this.onArchivoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onArchivoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getArchivoURL(url: string, filtros: any, esVerContrato: boolean): Promise<any> {
        this.cargando = true;
        return new Promise((resolve, reject) => {
            this._httpClient.post_get_file(filtros, url, true)
                .subscribe((response: any) => {
                    // const blob = new Blob([response.body], { type: response.body.type });
                    // let data = URL.createObjectURL(blob);
					if(esVerContrato)
						this._httpClient.printPDF(response);
					else
						this._httpClient.downloadPDF(response);
                    resolve(response);
                    //this.onDatosChanged.next({ url: data, detalles: detalles });
                    this.cargando = false;
                }, err => {
                    //this.onDatosChanged.next({ url: null, detalles: detalles });
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }
    
}