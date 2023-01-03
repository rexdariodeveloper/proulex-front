import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HashidsService } from '@services/hashids.service';
import { JsonResponse } from '@models/json-response';
import { FichasDataService } from '@services/fichas-data.service';

@Injectable()
export class VentasService extends FichasDataService implements Resolve<any>
{
	private urlApi = '/api/v1/reporte-ventas';

	constructor(
		_httpClient: HttpService,
		snackBar: MatSnackBar,
		hashid: HashidsService
	) {
		super(_httpClient, snackBar, hashid);
	}

	imprimirArchivo(inscripcionId: number, archivoId: number): Promise<any> {
		let body = {
			detalleId: this.hashid.encode(inscripcionId),
			archivoId: archivoId
		};

		this.cargando = true;

		return new Promise((resolve, reject) => {
			this._httpClient.post_get_file(JSON.stringify(body), `${this.urlApi}/imprimir/archivos`, true)
				.subscribe((response: any) => {
					this.cargando = false;
					this._httpClient.downloadPDF(response);
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