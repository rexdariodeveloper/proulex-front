import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { JsonResponse } from '@models/json-response';

@Injectable()
export class PagoClientesService extends FichaDataService implements Resolve<any>
{
	private urlApi = '/api/v1/cxcpago-clientes';

	constructor(
		_httpClient: HttpService,
		snackBar: MatSnackBar,
		hashid: HashidsService
	) {
		super(_httpClient, snackBar, hashid);
	}

	descargarArchivo(facturaId: number, extension: string): Promise<any> {
		this.cargando = true;

		return new Promise((resolve, reject) => {
			this._httpClient.get_file(this.urlApi + "/archivos/" + this.hashid.encode(facturaId) + "/" + extension, true)
				.subscribe((response: any) => {
					this._httpClient.downloadArchivo(response, extension);
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