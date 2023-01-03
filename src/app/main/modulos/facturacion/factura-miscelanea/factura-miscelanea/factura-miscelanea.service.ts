import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { JsonResponse } from '@models/json-response';
import { BehaviorSubject } from 'rxjs';
import { FacturaNotaVentaService } from '../../factura-nota-venta/factura-nota-venta/factura-nota-venta.service';

@Injectable()
export class FacturaMiscelaneaService extends FichaDataService implements Resolve<any>
{
	private urlApi = '/api/v1/cxcfacturas-miscelanea';

	onRFCChanged: BehaviorSubject<boolean> = new BehaviorSubject(null);
	onNotaVentaChanged: BehaviorSubject<any> = new BehaviorSubject(null);

	constructor(
		_httpClient: HttpService,
		snackBar: MatSnackBar,
		hashid: HashidsService,
		public _facturaNotaVentaService: FacturaNotaVentaService,
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

	getDatosNotaVenta(sedeId: number, Miscelanea: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/datos/miscelanea/${sedeId}/${Miscelanea}`, true)
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

	descargarArchivo(facturaId: number, extension: string): Promise<any> {
		return this._facturaNotaVentaService.descargarArchivo(facturaId, extension);
	}

	cancelarFactura(facturaId: number, motivoCancelacionId: number): Promise<any> {
		return this._facturaNotaVentaService.cancelarFactura(facturaId, motivoCancelacionId);
	}
}