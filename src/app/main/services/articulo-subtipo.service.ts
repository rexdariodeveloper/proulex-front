import { Injectable } from '@angular/core';
import { HttpService } from '@services/http.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ArticuloSubtipoService {

	private urlApi = '/api/v1/articulos-subtipos';

	constructor(
		public _httpClient: HttpService
	){}

	getCombo(articuloTipoId: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/listado/combo/${articuloTipoId}`,true);
	}

}