import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { JsonResponse } from '@models/json-response';
import { AlmacenComboProjection } from '@app/main/modelos/almacen';
import { ImpuestosArticuloService } from '@app/main/services/impuestos-articulos.service';

@Injectable()
export class RemisionService extends FichaDataService implements Resolve<any>{

    private urlApi = '/api/v1/remisiones';
    
    onDatosClienteChanged: BehaviorSubject<AlmacenComboProjection[]> = new BehaviorSubject(null);
    onExistenciaChanged: BehaviorSubject<number> = new BehaviorSubject(null);

	constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
        hashid: HashidsService,
		private _impuestosArticuloService: ImpuestosArticuloService
    ) {
        super(_httpClient, snackBar, hashid);
    }

    getDatosCliente(clienteId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/datos/cliente/${clienteId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onDatosClienteChanged.next(response.data);
					} else {
						this.onDatosClienteChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onDatosClienteChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

    getExistenciasArticulo(articuloId: number, almacenId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/existencia/articulo/${articuloId}/almacen/${almacenId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onExistenciaChanged.next(response.data);
					} else {
						this.onExistenciaChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onExistenciaChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getMontos(cantidad: number, precioUnitario: number, descuento: number, iva: number, ieps: number, cuotaFija: number, decimales: number = 6): any{
		return this._impuestosArticuloService.getMontos(cantidad,precioUnitario,descuento,iva,ieps,cuotaFija,decimales)
	}
    
}