import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { JsonResponse } from '@models/json-response';
import { ArticuloService } from '@app/main/services/articulo.service';
import { ArticuloUltimasComprasProjection } from '@app/main/modelos/articulo';
import { BehaviorSubject } from 'rxjs';
import { RequisicionPartidaConvertirListadoProjection } from '@app/main/modelos/requisicion-partida';
import { ImpuestosArticuloService } from '@app/main/services/impuestos-articulos.service';
import { ArchivoProjection } from '@models/archivo';
import { ArchivoService } from '@app/main/services/archivo.service';

@Injectable()
export class ConvertirRequisicionService extends FichaDataService implements Resolve<any>{

	onUltimasComprasChanged: BehaviorSubject<ArticuloUltimasComprasProjection[]> = new BehaviorSubject(null);
	onUltimasComprasEditarChanged: BehaviorSubject<ArticuloUltimasComprasProjection[]> = new BehaviorSubject(null);
	onRechazarChanged: BehaviorSubject<boolean> = new BehaviorSubject(null);
	
	constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private articuloService: ArticuloService,
		public _impuestosArticuloService: ImpuestosArticuloService,
		private archivoService: ArchivoService
    ) {
		super(_httpClient, snackBar, hashid);
	}

	getPartidas(requisicionId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`/api/v1/convertir-requisicion/partidas/${requisicionId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onDatosChanged.next(response.data);
					} else {
						this.onDatosChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onDatosChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getUltimasCompras(articuloId: number, abrirModal: boolean = true): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.articuloService.getUltimasCompras(articuloId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						if(abrirModal){
							this.onUltimasComprasChanged.next(response.data);
						}else{
							this.onUltimasComprasEditarChanged.next(response.data);
						}
					} else {
						if(abrirModal){
							this.onUltimasComprasChanged.next(null);
						}else{
							this.onUltimasComprasEditarChanged.next(null);
						}
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					if(abrirModal){
						this.onUltimasComprasChanged.next(null);
					}else{
						this.onUltimasComprasEditarChanged.next(null);
					}
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	rechazar(partidaId: number, comentario: string): Promise < any > {
		let body: any = {
			partidaId,
			comentario
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(body),`/api/v1/convertir-requisicion/rechazar/partida`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onRechazarChanged.next(true);
					} else {
						this.onRechazarChanged.next(false);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onRechazarChanged.next(false);
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
    
}
