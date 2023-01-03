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
import { ArchivoProjection } from '@models/archivo';
import { CXPSolicitudPagoServicioDetalle } from '@app/main/modelos/cxpsolicitud-pago-servicio-detalle';
import { CXPFactura } from '@app/main/modelos/cxpfactura';

@Injectable()
export class ProgramacionPagosService extends FichaDataService implements Resolve<any>
{

	onProgramarChanged: BehaviorSubject <boolean> ;
	onCancelarChanged: BehaviorSubject <boolean> ;

    constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private archivoService: ArchivoService
    ) {
		super(_httpClient, snackBar, hashid);
		
		this.onProgramarChanged = new BehaviorSubject(null);
		this.onCancelarChanged = new BehaviorSubject(null);
	}
	
	programar(facturasProgramar: CXPFactura[]): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(facturasProgramar),`/api/v1/programacion-pagos/programar`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onProgramarChanged.next(true);
						console.log(response.data);
						this.descargarPdf(response.data);
					} else {
						this.onProgramarChanged.next(false);
						this.snackBar.open(this.getError(response), 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onProgramarChanged.next(false);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	cancelarFactura(facturaId: number, fechaCancelacion: string, solicitudesPagoServicios: CXPSolicitudPagoServicioDetalle[], motivoCancelacion: string): Promise < any >{
		let body = {
			facturaId,
			fechaCancelacion,
			solicitudesPagoServicios,
			motivoCancelacion
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(body),`/api/v1/programacion-pagos/cancelar`,true)
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

	descargarPdf(id: number){
		this.getArchivo('/api/v1/programacion-pagos/pdf/' + id);
		this.snackBar.open('Descargando...', 'OK', {
			duration: 5000,
		});
	}
    
}