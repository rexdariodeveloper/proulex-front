import { Injectable } from '@angular/core';
import { HttpService } from '@services/http.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProgramaService {

	private urlApi = '/api/v1/programas';

	constructor(
		public _httpClient: HttpService
	){}

	getProgramasCalcularDias(idiomaId: number, modalidadId: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/calculos/idioma/${idiomaId}/modalidad/${modalidadId}`,true);
	}

	getCursos(programaId: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/cursos/${programaId}`,true);
	}

	getProgramasByIdioma(idiomaId: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/buscarPrograma/${idiomaId}`,true);
	}

}