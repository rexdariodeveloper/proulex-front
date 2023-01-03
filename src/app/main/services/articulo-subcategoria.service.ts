import { Injectable } from '@angular/core';
import { HttpService } from '@services/http.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ArticuloSubcategoriaService {

	private urlApi = '/api/v1/articulos-subcategorias';

	constructor(
		public _httpClient: HttpService
	){}

	getCombo(categoriaId: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/listado/combo/${categoriaId}`,true);
	}

}