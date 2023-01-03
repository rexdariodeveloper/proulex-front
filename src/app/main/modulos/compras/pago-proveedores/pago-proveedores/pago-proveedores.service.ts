import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ArchivoService } from '@app/main/services/archivo.service';
import { JsonResponse } from '@models/json-response';
import { CXPPago } from '@app/main/modelos/cxppago';
import { ArchivoProjection } from '@models/archivo';
import { ArchivosEstructurasCarpetas } from '@app/main/modelos/mapeos/archivos-estructuras-carpetas';

@Injectable()
export class PagoProveedoresService extends FichaDataService implements Resolve<any>
{

	onPagarChanged: BehaviorSubject <boolean> ;
	onCancelarChanged: BehaviorSubject <boolean> ;
	onComprobanteChanged: BehaviorSubject <number> ;
	onHistorialChanged: BehaviorSubject <any> ;

    constructor(
		_httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private archivoService: ArchivoService
    ) {
		super(_httpClient, snackBar, hashid);
		
		this.onPagarChanged = new BehaviorSubject(null);
		this.onCancelarChanged = new BehaviorSubject(null);
		this.onComprobanteChanged = new BehaviorSubject(null);
		this.onHistorialChanged = new BehaviorSubject(null);
	}
	
	pagar(cxpPago: CXPPago): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(cxpPago),`/api/v1/pago-proveedores/pagar`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onPagarChanged.next(true);
					} else {
						this.onPagarChanged.next(false);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onPagarChanged.next(false);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	cancelar(solicitudId: number): Promise < any >{
		let body = {
			solicitudId
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(body),`/api/v1/pago-proveedores/cancelar`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onCancelarChanged.next(true);
					} else {
						this.onCancelarChanged.next(false);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onCancelarChanged.next(false);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	descargarEvidencia(facturaId: number): Promise<any> {
		let body = {
			facturaId: this.hashid.encode(facturaId)
		}
        return new Promise((resolve, reject) => {
            this._httpClient.post_get_file(JSON.stringify(body),`/api/v1/gestion-facturas/descargar/evidencia`, true)
                .subscribe((response: any) => {
                    this._httpClient.downloadZip(response);
                    resolve(response);

                }, err => {
					this.cargando = false;
                    this.snackBar.open('No se encontró evidencia', 'OK', {
                        duration: 5000,
                    });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
	}

	descargarFactura(facturaId: number): Promise<any> {
		let body = {
			facturaId: this.hashid.encode(facturaId)
		}
        return new Promise((resolve, reject) => {
            this._httpClient.post_get_file(JSON.stringify(body),`/api/v1/gestion-facturas/descargar/factura`, true)
                .subscribe((response: any) => {
                    this._httpClient.downloadZip(response);
                    resolve(response);

                }, err => {
					this.cargando = false;
					this.snackBar.open('No se encontró factura', 'OK', {
                        duration: 5000,
                    });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
	}

	getEvidencia(evidenciaIds: number[]): Promise<any> {
		let body = {
			idsArchivos: evidenciaIds.map(evidenciaId => {
				return this.hashid.encode(evidenciaId);
			}),
			nombreZip: 'evidencia.zip'
		};
        return new Promise((resolve, reject) => {
            this._httpClient.post_get_file(JSON.stringify(body),this.url, true)
                .subscribe((response: any) => {
                    this._httpClient.downloadZip(response);
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
	
	verArchivo(evidencia: ArchivoProjection){
		return new Promise((resolve, reject) => {
            this.archivoService.descargarArchivo(evidencia.id)
                .subscribe((response: any) => {
					this.archivoService.verArchivo(evidencia,response.body);
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

	subirArchivo(archivo: File): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.archivoService.fileUpload(archivo,ArchivosEstructurasCarpetas.PAGOS_CXP.id,null,false,true,null)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onComprobanteChanged.next(response.data);
					} else {
						this.onComprobanteChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onComprobanteChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getHistorial(solicitudId: number): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`/api/v1/pago-proveedores/historial/${solicitudId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onHistorialChanged.next(response.data);
					} else {
						this.onHistorialChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onHistorialChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	descargarArchivo(id: number, extension: string){
		return new Promise((resolve, reject) => {
            this.archivoService.descargarArchivo(id)
                .subscribe((response: any) => {
					this._httpClient.downloadArchivo(response, extension);
					this.snackBar.dismiss();
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
    
}