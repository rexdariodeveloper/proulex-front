import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject } from 'rxjs';
import { JsonResponse } from '@models/json-response';
import { ArchivosEstructurasCarpetas } from '@app/main/modelos/mapeos/archivos-estructuras-carpetas';
import { ArchivoService } from '@app/main/services/archivo.service';

@Injectable()
export class CancelacionNotaVentaService extends FichaDataService implements Resolve<any>{

	urlApi = '/api/v1/orden-venta-cancelacion';

	onNotaVentaChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onDocumentoSubidoChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onFormatoImpresoChanged: BehaviorSubject<boolean> = new BehaviorSubject(null);

	constructor(
		_httpClient: HttpService,
		snackBar: MatSnackBar,
		hashid: HashidsService,
		private archivoService: ArchivoService
	) {
		super(_httpClient, snackBar, hashid);
	}

	getNotaVenta(sucursalId: number, codigoOV: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/buscar/nota-venta/${sucursalId}/${codigoOV}`, true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onNotaVentaChanged.next(response.data);
					} else {
						this.onNotaVentaChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onNotaVentaChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	subirDocumento(archivo: File): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.archivoService.fileUpload(archivo, ArchivosEstructurasCarpetas.ORDENES_VENTA.CANCELACIONES, null, false, true, '')
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onDocumentoSubidoChanged.next(response.data);
					} else {
						this.onDocumentoSubidoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onDocumentoSubidoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	imprimirFormato(ordenVentaCancelacionId: number): Promise<any> {
		let body = {
			ordenVentaCancelacionId
		};
		this.cargando = true;
		return new Promise((resolve, reject) => {
			this._httpClient.post_get_file(body, `${this.urlApi}/imprimir/formato`, true)
				.subscribe((response: any) => {

					this._httpClient.printPDF(response);
					this.onFormatoImpresoChanged.next(true);
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