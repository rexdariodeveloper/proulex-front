import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { EstadoService } from '@app/main/services/estado.service';
import { ArchivoService } from '@app/main/services/archivo.service';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { JsonResponse } from '@models/json-response';

@Injectable()
export class ListaPrecioService extends FichaDataService implements Resolve<any>{

	private urlApi = '/api/v1/listado-precio';

	onComboEstadosChanged: BehaviorSubject <EstadoComboProjection[]> = new BehaviorSubject(null);
	onXLSXChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onMaterialesChanged: BehaviorSubject<any> = new BehaviorSubject(null);

    constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private estadoService: EstadoService,
		private archivoService: ArchivoService
    ) {
        super(_httpClient, snackBar, hashid);
	}
	
	/**
	 * Get combo estados
	 *
	 * @returns {Promise<any>}
	 */

	 getPlantilla(): Promise<any> {
		return new Promise((resolve, reject) => {
            this._httpClient.get_file(`/api/v1/listado-precio/download/plantilla`, true)
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

    subirArchivo(archivo: File): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.archivoService.fileUploadXML(archivo,null,null,false,true,null,`/api/v1/listado-precio/upload/xml`)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onXLSXChanged.next(response.data);
					} else {
						this.onXLSXChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onXLSXChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	exportar(listadoId: number): Promise<any> {
		return new Promise((resolve, reject) => {
            this._httpClient.get_file(`/api/v1/listado-precio/download/excel/${listadoId}`, true)
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

	getMateriales(articuloId: number, listadoPreciosId: number): Promise < any > {
		let requestBody = {
			articuloId,
			listadoPreciosId
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/listados/materiales`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onMaterialesChanged.next(response.data);
					} else {
						this.onMaterialesChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onMaterialesChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}
    
}