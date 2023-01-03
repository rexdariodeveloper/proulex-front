import { Injectable } from '@angular/core';
import { HttpService } from '@services/http.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ArticuloCategoriaService {

	private urlApi = '/api/v1/articulos-categorias';

	constructor(
		public _httpClient: HttpService
	){}

	getCombo(familiaId: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/listado/combo/${familiaId}`,true);
	}

}