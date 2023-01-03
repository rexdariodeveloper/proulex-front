import { Injectable } from '@angular/core';
import { HttpService } from '@services/http.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LocalidadService {

	private urlApi = '/api/v1/localidades';

	constructor(
		public _httpClient: HttpService
	){}

	getLocalidadesByAlmacen(almacenId: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/getCombosByAlmecen/${almacenId}`,true);
	}

}