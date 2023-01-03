import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { JsonResponse } from '@models/json-response';
import { ArchivoService } from '@app/main/services/archivo.service';
import { OrdenCompraEditarProjection } from '@app/main/modelos/orden-compra';
import { ArchivoProjection } from '@models/archivo';
import { ImpuestosArticuloService } from '@app/main/services/impuestos-articulos.service';

@Injectable()
export class OrdenCompraService extends FichaDataService implements Resolve<any>
{

	constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private _archivoService: ArchivoService,
		public _impuestosArticuloService: ImpuestosArticuloService
    ) {
		super(_httpClient, snackBar, hashid);
	}

	/*descargarPDF(oc: OrdenCompraEditarProjection): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get_file(`/api/v1/ordenes-compra/pdf/${this.hashid.encode(oc.id)}`,true)
			.subscribe((response: any) => {
					this.cargando = false;
					this._archivoService.descargarArchivoResponse(response.body, '.pdf', oc.codigo + '.pdf')
				}, err => {
					this.cargando = false;
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}*/

    descargarPdf(id: number){
		this.getArchivo('/api/v1/ordenes-compra/pdf/' + this.hashid.encode(id) );
		this.snackBar.open('Descargando...', 'OK', {
			duration: 5000,
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
            this._httpClient.post_get_file(JSON.stringify(body),'/api/v1/archivos', true)
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

	getFactura(facturasIds: number[]): Promise<any> {
		let body = {
			idsArchivos: facturasIds.map(facturaId => {
				return this.hashid.encode(facturaId);
			}),
			nombreZip: 'factura.zip'
		}
        return new Promise((resolve, reject) => {
            this._httpClient.post_get_file(JSON.stringify(body),'/api/v1/archivos', true)
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
    
}