import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Resolve } from '@angular/router';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { EstadoService } from '@app/main/services/estado.service';
import { MunicipioService } from '@app/main/services/municipio.service';
import { JsonResponse } from '@models/json-response';
import { MunicipioComboProjection } from '@models/municipio';
import { HttpService } from '@pixvs/services/http.service';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ClienteService extends FichaDataService implements Resolve<any>{

	onComboEstadosChanged: BehaviorSubject<EstadoComboProjection[]> = new BehaviorSubject(null);
	onEstadosFacturacionChanged: BehaviorSubject<EstadoComboProjection[]> = new BehaviorSubject(null);
    onMunicipiosFacturacionChanged: BehaviorSubject<MunicipioComboProjection[]> = new BehaviorSubject(null);

	constructor(
		_httpClient: HttpService,
		snackBar: MatSnackBar,
		hashid: HashidsService,
		private estadoService: EstadoService,
        private municipioService: MunicipioService
	) {
		super(_httpClient, snackBar, hashid);
	}

	/**
	 * Get combo estados
	 *
	 * @returns {Promise<any>}
	 */
	getComboEstados(paisId: number): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.estadoService.getCombo(paisId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onComboEstadosChanged.next(response.data);
					} else {
						this.onComboEstadosChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onComboEstadosChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getEstadosFacturacion(paisId: number): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.estadoService.getCombo(paisId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onEstadosFacturacionChanged.next(response.data);
					} else {
						this.onEstadosFacturacionChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onEstadosFacturacionChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getMunicipiosFacturacion(estadoId: number): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.municipioService.getCombo(estadoId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onMunicipiosFacturacionChanged.next(response.data);
					} else {
						this.onMunicipiosFacturacionChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onMunicipiosFacturacionChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}
}