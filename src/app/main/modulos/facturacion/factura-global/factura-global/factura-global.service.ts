import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { JsonResponse } from '@models/json-response';
import { BehaviorSubject } from 'rxjs';
import { FacturaNotaVentaService } from '../../factura-nota-venta/factura-nota-venta/factura-nota-venta.service';
import { FichasDataService } from '@services/fichas-data.service';

@Injectable()
export class FacturaGlobalService extends FichaDataService implements Resolve<any>
{
	private urlApi = '/api/v1/cxcfacturas-global';

	onNotaVentaChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onUsuariosChanged: BehaviorSubject<any> = new BehaviorSubject(null);

	constructor(
		_httpClient: HttpService,
		snackBar: MatSnackBar,
		hashid: HashidsService,
		public _fichasDataService: FichasDataService,
		public _facturaNotaVentaService: FacturaNotaVentaService,
	) {
		super(_httpClient, snackBar, hashid);
	}

	getDatosNotaVenta(sedeId: number, plantelId: any[], fechaInicio: string, fechaFin: string, usuarios: any[]): Promise<any> {
		let body = {
			sedeId: sedeId,
			planteles: plantelId,
			fechaInicio: fechaInicio,
			fechaFin: fechaFin,
			usuarios: usuarios
		};

		this.cargando = true;

		return new Promise((resolve, reject) => {
			this._httpClient.post(JSON.stringify(body), `${this.urlApi}/datos/notaVenta`, true)
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

	getUsuarios(filtros: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(filtros, `${this.urlApi}/getUsuarios`, true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onUsuariosChanged.next(response.data);
				else {
					this.onUsuariosChanged.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onUsuariosChanged.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}

	descargarArchivo(facturaId: number, extension: string): Promise<any> {
		return this._facturaNotaVentaService.descargarArchivo(facturaId, extension);
	}

	previsualizarFactura(xmlString: string): Promise<any> {
		return this._facturaNotaVentaService.previsualizarFactura(xmlString);
	}

	cancelarFactura(facturaId: number, motivoCancelacionId: number): Promise<any> {
		return this._facturaNotaVentaService.cancelarFactura(facturaId, motivoCancelacionId);
	}

	exportarNotasVenta(filtros: any): Promise<any> {
		return this._fichasDataService.getExcelConFiltros(`${this.urlApi}/xlsx/notasVenta`, filtros);
	}
}