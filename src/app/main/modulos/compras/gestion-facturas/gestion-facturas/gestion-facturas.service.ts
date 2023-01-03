import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ArchivoService } from '@app/main/services/archivo.service';
import { ArchivosEstructurasCarpetas } from '@app/main/modelos/mapeos/archivos-estructuras-carpetas';
import { JsonResponse } from '@models/json-response';
import { FichasDataService } from '@services/fichas-data.service';
import { ArchivoProjection } from '@models/archivo';

@Injectable()
export class GestionFacturasService extends FichasDataService implements Resolve<any>
{

	onEnviarChanged: BehaviorSubject <boolean> ;

    constructor(
		_httpClient: HttpService,
		public _archivoService: ArchivoService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private archivoService: ArchivoService
    ) {
		super(_httpClient, snackBar, hashid);
		
		this.onEnviarChanged = new BehaviorSubject(null);
	}
	
	enviar(facturasProgramarIds: number[]): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(facturasProgramarIds),`/api/v1/gestion-facturas/enviar`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onEnviarChanged.next(true);
					} else {
						this.onEnviarChanged.next(false);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onEnviarChanged.next(false);
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
            this._httpClient.post_get_file(JSON.stringify(body),`/api/v1/gestion-facturas/descargar/evidencia`, true)
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

	getArchivos(archivosIds: number[], nombreArchivo: string): Promise<any> {
		let body = {
			idsArchivos: archivosIds.map(archivoId => {
				return this.hashid.encode(archivoId);
			}),
			nombreZip: nombreArchivo
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
    
}