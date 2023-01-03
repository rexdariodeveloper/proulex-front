import { Injectable } from '@angular/core';
import { HttpService } from '@services/http.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BecaSolicitudService {

	private urlApi = '/api/v1/becas-solicitudes';

	constructor(
		public _httpClient: HttpService
	){}

	getSolicitudById(idiomaId: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/getById/${idiomaId}`,true);
	}

}