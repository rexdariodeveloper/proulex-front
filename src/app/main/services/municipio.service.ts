import { Injectable } from '@angular/core';
import { HttpService } from '@services/http.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MunicipioService {

	private urlApi = '/api/v1/municipios';

	constructor(
		public _httpClient: HttpService
	){}

	getCombo(estadoId: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/listado/combo/${estadoId}`,true);
	}

}