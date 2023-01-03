import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProgramasGruposService } from '@app/main/services/grupos.services';
import { JsonResponse } from '@models/json-response';
import { FichasDataService } from '@services/fichas-data.service';

@Injectable()
export class PagosAlumnosService extends FichasDataService implements Resolve<any>
{
	onComboSedeChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onComboPAChanged: BehaviorSubject <any> = new BehaviorSubject(null);

    constructor(
		_httpClient: HttpService,
		public _gruposService: ProgramasGruposService,
        snackBar: MatSnackBar,
		hashid: HashidsService
    ) {
		super(_httpClient, snackBar, hashid);
		this.onComboSedeChanged = new BehaviorSubject(null);
		this.onComboPAChanged = new BehaviorSubject(null);
		
	}

	getCiclos(sedes: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post({sedes: sedes}, '/api/v1/pagos-alumnos/getCiclos', true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onComboSedeChanged.next(response.data);
				else {
					this.onComboSedeChanged.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onComboSedeChanged.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}
	
	getFechas(filtros: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(filtros, '/api/v1/pagos-alumnos/getFechas', true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onComboPAChanged.next(response.data);
				else {
					this.onComboPAChanged.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onComboPAChanged.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}
    
}