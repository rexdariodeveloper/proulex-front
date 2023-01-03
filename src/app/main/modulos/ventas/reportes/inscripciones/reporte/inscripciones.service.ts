import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject } from 'rxjs';
import { ProgramasGruposService } from '@app/main/services/grupos.services';
import { JsonResponse } from '@models/json-response';
import { FichasDataService } from '@services/fichas-data.service';

@Injectable()
export class InscripcionesService extends FichasDataService implements Resolve<any>
{
	private urlApi = '/api/v1/inscripciones';

	onFechaChange: BehaviorSubject<any> = new BehaviorSubject(null);

	constructor(
		_httpClient: HttpService,
		public _gruposService: ProgramasGruposService,
		snackBar: MatSnackBar,
		hashid: HashidsService
	) {
		super(_httpClient, snackBar, hashid);

		this.onFechaChange = new BehaviorSubject(null);
	}

	getFechas(filtros: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(filtros, `${this.urlApi}/getFechas`, true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onFechaChange.next(response.data);
				else {
					this.onFechaChange.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onFechaChange.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}

	imprimirArchivo(inscripcionId: number, archivoId: number): Promise<any> {
		let body = {
			inscripcionId: this.hashid.encode(inscripcionId),
			archivoId: archivoId
		};

		this.cargando = true;

		return new Promise((resolve, reject) => {
			this._httpClient.post_get_file(JSON.stringify(body), `${this.urlApi}/imprimir/archivos`, true)
				.subscribe((response: any) => {
					this.cargando = false;
					this._httpClient.printPDF(response);
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