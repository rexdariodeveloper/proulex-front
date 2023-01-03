import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { JsonResponse } from '@models/json-response';
import { PuntoVentaGeneralService } from '@app/main/services/punto-venta.service';

@Injectable()
export class PuntoVentaInicioService extends FichaDataService implements Resolve<any>{

    private urlApi = '/api/v1/punto-venta';
    
    onAbrirTurnoChanged: BehaviorSubject<boolean> = new BehaviorSubject(null);
    onPlantelesChanged: BehaviorSubject<any> = new BehaviorSubject(null);

	constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
        hashid: HashidsService,
		private _puntoVentaGeneralService: PuntoVentaGeneralService
    ) {
        super(_httpClient, snackBar, hashid);
    }

	getSucursalPuntoVentaId(): number{
		return this._puntoVentaGeneralService.getSucursalId();
	}

	setSucursalPuntoVentaId(sucursalId: number){
		this._puntoVentaGeneralService.setSucursalId(sucursalId);
	}

    getPlantelPuntoVentaId(): number{
		return this._puntoVentaGeneralService.getPlantelId();
	}

	setPlantelPuntoVentaId(plantelId: number){
		this._puntoVentaGeneralService.setPlantelId(plantelId);
	}

    getPlanteles(sucursalId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/listados/planteles/${sucursalId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onPlantelesChanged.next(response.data);
					} else {
						this.onPlantelesChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onPlantelesChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}
    
}