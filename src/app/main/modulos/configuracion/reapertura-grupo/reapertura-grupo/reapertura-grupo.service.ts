import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Resolve } from '@angular/router';
import { JsonResponse } from '@models/json-response';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { HttpService } from '@services/http.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ReaperturaGrupoService extends FichaDataService implements Resolve<any>{

  private urlApi: string = '/api/v1/reapertura-grupo';

  onListaGrupoChanged: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(
    _httpClient: HttpService,
    _snackBar: MatSnackBar,
    _hashid: HashidsService
  ) { 
    super(_httpClient, _snackBar, _hashid);
  }

  getListaGrupo(codigo: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(this.urlApi + '/getListaGrupo/' + codigo, true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onListaGrupoChanged.next(response.data);
				else {
					this.onListaGrupoChanged.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onDatosChanged.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}
}
