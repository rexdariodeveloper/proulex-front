import { Injectable } from '@angular/core';
import { HttpService } from '@services/http.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ArticuloService {

	private urlApi = '/api/v1/articulos';

	constructor(
		public _httpClient: HttpService
	){}

	getUltimasCompras(articuloId: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/ultimas-compras/${articuloId}`,true);
	}

	getByCategoria(categoriaId: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/articulosByCategoria/${categoriaId}`,true);
	}

}