import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject } from 'rxjs';
import { FichasDataService } from '@services/fichas-data.service';
import { JsonResponse } from '@models/json-response';

@Injectable()
export class ExamenesCertificacionesService extends FichasDataService implements Resolve<any>
{

	onListadosChanged: BehaviorSubject <any> = new BehaviorSubject(null);

    constructor(
		_httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService
    ) {
		super(_httpClient, snackBar, hashid);
		this.onListadosChanged = new BehaviorSubject(null);
		
	}

	getListados(): Promise <any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get('/api/v1/examenes-certificaciones/listados',true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onListadosChanged.next(response.data);
					} else {
						this.onListadosChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onListadosChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getDetalle(id: number){
		return this._httpClient.get('/api/v1/examenes-certificaciones/detalles/'+id, true);
	}
	
    
}