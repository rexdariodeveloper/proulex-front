import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { JsonResponse } from '@models/json-response';
import { FormGroup } from '@angular/forms';
import { HashidsService } from '@services/hashids.service';
import { UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { OrdenCompraListadoProjection } from '@app/main/modelos/orden-compra';
import { ArchivoService } from '@app/main/services/archivo.service';
import { ArchivoProjection } from '@models/archivo';

@Injectable()
export class SolicitudesPagoRHDescargasService implements Resolve < any > {
	
	onFacturaChanged: BehaviorSubject < any > ;
	onEvidenciaChanged: BehaviorSubject < any > ;
	cargando: boolean = false;
	id: any = null;
	url: string = '/api/v1/archivos';
	filtros: any;

	/**
	 * Constructor
	 *
	 * @param {HttpService} _httpClient
	 */
	constructor(
		public _httpClient: HttpService,
		public _archivoService: ArchivoService,
		public snackBar: MatSnackBar,
		private hashid: HashidsService
	) {
		// Set the defaults
		this.onFacturaChanged = new BehaviorSubject(null);
		this.onEvidenciaChanged = new BehaviorSubject(null);
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
	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable < any > | Promise < any > | any {
		return new Promise((resolve, reject) => {
			Promise.all([]).then(
				() => {
					resolve();
				},
				reject
			);
		});
	}


	getFactura(facturasIds: number[]): Promise<any> {
		let body = {
			idsArchivos: facturasIds.map(facturaId => {
				return this.hashid.encode(facturaId);
			}),
			nombreZip: 'factura.zip'
		}
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

	getError(error: HttpErrorResponse) {
		return this._httpClient.getError(error);
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
}
