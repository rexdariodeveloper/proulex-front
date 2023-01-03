import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { JsonResponse } from '@models/json-response';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class FacturaNotaVentaService extends FichaDataService implements Resolve<any>
{
	private urlApi = '/api/v1/cxcfacturas-nota-venta';

	onRFCChanged: BehaviorSubject<boolean> = new BehaviorSubject(null);
	onNotaVentaChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onFacturaRelacionChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onCancelarFactura: BehaviorSubject<any> = new BehaviorSubject(null);

	constructor(
		_httpClient: HttpService,
		snackBar: MatSnackBar,
		hashid: HashidsService,
	) {
		super(_httpClient, snackBar, hashid);
	}

	validarRFC(rfc: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/validarRFC/${rfc}`, true)
				.subscribe((response: any) => {
					this.cargando = false;
					this.onRFCChanged.next(response.data);

					if (response.status != 200) {
						this.snackBar.open(response.message, 'OK', { duration: 5000, });
					}

					resolve(response);
				}, err => {
					this.cargando = false;
					this.onRFCChanged.next(false);
					this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getDatosNotaVenta(sedeId: number, notaVenta: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/datos/notaVenta/${sedeId}/${notaVenta}`, true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onNotaVentaChanged.next(response.data);
					} else {
						this.onNotaVentaChanged.next(null);

						this.snackBar.open(response.message, 'OK', { duration: 5000, });
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onNotaVentaChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getDatosFacturaRelacion(sedeId: number, factura: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/datos/factura-relacion/${sedeId}/${factura}`, true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onFacturaRelacionChanged.next(response.data);
					} else {
						this.onFacturaRelacionChanged.next(null);

						this.snackBar.open(response.message, 'OK', { duration: 5000, });
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onFacturaRelacionChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
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

	previsualizarFactura(xmlString: string): Promise<any> {
		let body = {
			xmlString: xmlString
		};

		this.cargando = true;

		return new Promise((resolve, reject) => {
			this._httpClient.post_get_file(JSON.stringify(body), `${this.urlApi}/previsualizar`, true)
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

	cancelarFactura(facturaId: number, motivoCancelacionId: number): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/cancelar/${this.hashid.encode(facturaId)}/${motivoCancelacionId}`, true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onCancelarFactura.next(response.data);
					} else {
						this.onCancelarFactura.next(null);

						this.snackBar.open(response.message, 'OK', { duration: 5000, });
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onCancelarFactura.next(null);
					this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}
}