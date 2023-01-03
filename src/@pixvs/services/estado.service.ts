import { Injectable } from '@angular/core';
import { HttpService } from '@services/http.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EstadoService {

	private urlApi = '/api/v1/estados';

	constructor(
		public _httpClient: HttpService
	){}

	getCombo(paisId: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/listado/combo/${paisId}`,true);
	}

}