import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Resolve } from '@angular/router';
import { ArchivoService } from '@app/main/services/archivo.service';
import { JsonResponse } from '@models/json-response';
import { FichasDataService } from '@services/fichas-data.service';
import { HashidsService } from '@services/hashids.service';
import { HttpService } from '@services/http.service';

@Injectable()
export class ReporteFacturasService extends FichasDataService implements Resolve<any> {

	private urlApi = '/api/v1/reporte-cxpfacturas';

	constructor(
		_httpClient: HttpService,
		_snackBar: MatSnackBar,
		_hashid: HashidsService,
		private _archivoService: ArchivoService
	) {
		super(_httpClient, _snackBar, _hashid);
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
