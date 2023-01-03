import { Injectable } from '@angular/core';
import { HttpService } from '@services/http.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CursosService {

	private urlApi = '/api/v1/cursos';

	constructor(
		public _httpClient: HttpService
	){}

	getCombo(cursoId: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/getModalidades/${cursoId}`,true);
	}

	getProgramacion(programaId: number, modalidadId: number, idiomaId: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/getProgramacionAcademica/${programaId}/${modalidadId}/${idiomaId}`,true);
	}

	getTest(programaId: number,modalidadId: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/getTest/${programaId}/${modalidadId}`,true);
	}

	getArticulos(programaId: number, nivel: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/getMateriales/${programaId}/${nivel}`,true);
	}

	getSucursales(idSucursal: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/getSucursales/${idSucursal}`,true);
	}

	getPlantelesBySucursal(sucursalId: number): Observable<Object>{
		return this._httpClient.get(`/api/v1/sucursales/getPlanteles/${sucursalId}`,true);
	}

}