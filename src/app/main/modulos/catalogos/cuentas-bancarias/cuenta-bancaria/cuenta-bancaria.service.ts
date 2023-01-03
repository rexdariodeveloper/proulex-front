import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { EstadoService } from '@app/main/services/estado.service';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { JsonResponse } from '@models/json-response';

@Injectable()
export class CuentaBancariaService extends FichaDataService implements Resolve<any>{

	onComboEstadosChanged: BehaviorSubject <EstadoComboProjection[]> = new BehaviorSubject(null);

    constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private estadoService: EstadoService
    ) {
        super(_httpClient, snackBar, hashid);
	}
	
	/**
	 * Get combo estados
	 *
	 * @returns {Promise<any>}
	 */
	getComboEstados(paisId: number): Promise < any > {
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
    
}