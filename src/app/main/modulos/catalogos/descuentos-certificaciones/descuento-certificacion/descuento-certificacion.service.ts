import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Resolve } from '@angular/router';
import { ProgramaIdiomaCertificacionComboProjection } from '@app/main/modelos/programa-idioma-certificacion';
import { JsonResponse } from '@models/json-response';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { HttpService } from '@services/http.service';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class DescuentoCertificacionService extends FichaDataService implements Resolve<any> {
  private urlApi: string = '/api/v1/descuentos-certificaciones';

  onListaCertificacionChanged: Subject<ProgramaIdiomaCertificacionComboProjection[]> = new Subject();

  constructor(
    _httpClient: HttpService,
    _snackBar: MatSnackBar,
    _hashid: HashidsService,
  ) { 
    super(_httpClient, _snackBar, _hashid);
  }

  getListaCertificacion(programaIdiomaId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(this.urlApi + '/certificacion/' + programaIdiomaId, true).subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onListaCertificacionChanged.next(response.data);
					} else {
						this.onListaCertificacionChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onListaCertificacionChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}
}
