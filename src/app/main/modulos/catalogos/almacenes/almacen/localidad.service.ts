import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { JsonResponse } from '@models/json-response';
import { FormGroup } from '@angular/forms';
import { HashidsService } from '@services/hashids.service';

@Injectable()
export class LocalidadService implements Resolve < any > {
	datos: any;
	listados: any;
	datosMap: any;
	onDatosChanged: BehaviorSubject < any > ;
	onGuardarChanged: BehaviorSubject < boolean > ;
	cargando: boolean = false;
	id: any = null;
	url: string = '/api/v1/localidades';
	filtros: any;

	/**
	 * Constructor
	 *
	 * @param {HttpService} _httpClient
	 */
	constructor(
		public _httpClient: HttpService,
		public snackBar: MatSnackBar,
		private hashid: HashidsService
	) {
		// Set the defaults
		this.onDatosChanged = new BehaviorSubject(null);
		this.onGuardarChanged = new BehaviorSubject(false);
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


	/**
	 * Get datos
	 *
	 * @returns {Promise<any>}
	 */
	getDatos(): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(this.url + (this.id ? `/${this.id}` : '/all'), true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.setDatos(response.data);
					} else {
						this.setDatos([]);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					this.onDatosChanged.next(this.datos);
					resolve(response);
				}, err => {
					this.setDatos([]);
					this.cargando = false;
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					this.onDatosChanged.next(this.datos);
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	/**
	 * Guardar
	 *
	 * @returns {Promise<any>}
	 */
	guardar(data: any): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(data,this.url + '/save', true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onGuardarChanged.next(true);
					} else {
						if(response.status== 1557){
                            this.snackBar.open(this.getError(response), 'OK', {
                                duration: 5000,
                            });
                        }else{
							this.snackBar.open(response.message, 'OK', {
								duration: 5000,
							});
						}
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

	getError(error: HttpErrorResponse) {
		return this._httpClient.getError(error);
	}

	setDatos(datos){
		this.datos = datos.datos || datos;
		this.datosMap = {};
		for(let dato of this.datos){
			this.datosMap[dato.id] = dato;
		}
		this.listados = datos.listados || [];
	}
}
