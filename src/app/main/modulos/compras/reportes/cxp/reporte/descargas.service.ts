import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { JsonResponse } from '@models/json-response';
import { HashidsService } from '@services/hashids.service';
import { ArchivoService } from '@app/main/services/archivo.service';
import { ArchivoProjection } from '@models/archivo';

@Injectable()
export class ReporteCXPDescargasService implements Resolve < any > {
	
	onFacturaChanged: BehaviorSubject < any > ;
	onEvidenciaChanged: BehaviorSubject < any > ;
	cargando: boolean = false;
	id: any = null;
	url: string = '/api/v1/archivo';
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
		return new Promise<void>((resolve, reject) => {
			Promise.all([]).then(
				() => {
					resolve();
				},
				reject
			);
		});
	}

	getError(error: HttpErrorResponse) {
		return this._httpClient.getError(error);
	}

	getArchivo(id: number, extension: string): Promise<any> {
		let encoded = this.hashid.encode(id);
        this.cargando = true;
        return new Promise((resolve, reject) => {
            this._httpClient.get_file(this.url+"/"+encoded, true)
                .subscribe((response: any) => {

                    this._httpClient.downloadArchivo(response,extension);
                    resolve(response);
                    this.cargando = false;

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
