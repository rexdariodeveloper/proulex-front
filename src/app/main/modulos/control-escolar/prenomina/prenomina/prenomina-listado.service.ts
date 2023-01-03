import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
//import { CursosService } from '@app/main/services/cursos-service';
//import { ProgramasGruposService } from '@app/main/services/grupos.services';
import { JsonResponse } from '@models/json-response';
import { FichasDataService } from '@services/fichas-data.service';

@Injectable()
export class PrenominaService extends FichasDataService implements Resolve<any>{

	private urlApi = '/api/v1/prenomina';

	onComboModalidadChanged: BehaviorSubject <any[]> = new BehaviorSubject(null);
	onQuincenasChanged: BehaviorSubject <any[]> = new BehaviorSubject(null);

    constructor(
		_httpClient: HttpService,
		//public _cursosService: CursosService,
		//public _gruposService: ProgramasGruposService,
        snackBar: MatSnackBar,
		hashid: HashidsService
    ) {
		super(_httpClient, snackBar, hashid);
		this.onComboModalidadChanged = new BehaviorSubject(null);
	}

	getQuincenas(sucursalId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/quincenas/${sucursalId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onQuincenasChanged.next(response.data);
					} else {
						this.onQuincenasChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onQuincenasChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}
	
    
}