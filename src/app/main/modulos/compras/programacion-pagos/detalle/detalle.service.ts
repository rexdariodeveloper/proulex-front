import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { Observable } from 'rxjs';
import { ArchivoService } from '@app/main/services/archivo.service';
import { JsonResponse } from '@models/json-response';
import { ArchivoProjection } from '@models/archivo';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

@Injectable()
export class CXPSolicitudPagoService extends FichaDataService implements Resolve<any>
{
    constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private _archivoService: ArchivoService,
		private router: Router,
		private _fuseSidebarService: FuseSidebarService
    ) {
        super(_httpClient, snackBar, hashid);
	}

	/**
	 * Consulta tipo post que aprueba una solicitud, cancelando los detalles de las facturas no seleccionadas para aprobar
	 * @param cxpSolicitudPagoId Id de la solicitud a aprobar
	 * @param facturasAprobarIdsMap Diccionario de facturas a aprobar (ejemplo: {1: true, 2: false, 3: true, ...})
	 * @returns Promesa de consulta al back
	 */
	aprobarPersonalizado(cxpSolicitudPagoId: number, facturasAprobarIdsMap: any, fechaModificacion: any): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			let body = {
				cxpSolicitudPagoId,
				facturasAprobarIdsMap,
				fechaModificacion
			};
			this._httpClient.post(JSON.stringify(body),`/api/v1/programacion-pagos/alerta/aprobar`,true)
				.subscribe((response: any) => {
					if (response.status == 200) {
						this._fuseSidebarService.getAutorizaciones();
						this.router.navigate(['/app/compras/listado-alertas']);
					} else {
						this.cargando = false;
						this.snackBar.open(this.getError(response), 'OK', {
							duration: 5000,
						});
					}
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

	verArchivo(evidencia: ArchivoProjection){
		return new Promise((resolve, reject) => {
            this._archivoService.descargarArchivo(evidencia.id)
                .subscribe((response: any) => {
					this._archivoService.verArchivo(evidencia,response.body);
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
    
}