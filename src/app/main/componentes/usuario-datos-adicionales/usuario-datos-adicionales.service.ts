import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { JsonResponse } from '@models/json-response';
import { HashidsService } from '@services/hashids.service';

@Injectable()
export class UsuarioDatosAdicionalesService implements Resolve < any > {
	datos: any;
	cargando: boolean = false;
	url: string = '/api/v1/usuario-datos-adicionales';

	onDatosChanged: BehaviorSubject < any > ;

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
	getDatos(usuarioId: number): Promise < any > {
		let body = {
			usuarioId
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(body),`${this.url}/datos`, true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.datos = response.data;
					} else {
						this.datos = null;
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					this.onDatosChanged.next(this.datos);
					resolve(response);
				}, err => {
					this.datos = null;
					this.cargando = false;
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					this.onDatosChanged.next(this.datos);
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getError(error: HttpErrorResponse) {
		return this._httpClient.getError(error);
	}
}
