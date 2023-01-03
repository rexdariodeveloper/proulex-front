import { Injectable } from '@angular/core';
import { HttpService } from '@services/http.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IncompanyService {

	private urlApi = '/api/v1/incompany/grupos';

	constructor(
		public _httpClient: HttpService
	){}

	getCriteriosEvaluacionIncompany(json: any){
		return this._httpClient.put(json,`${this.urlApi}/getCriteriosEvaluacion`,true);
	}

	getCriteriosEvaluacionIncompanyPersonalizado(json: any){
		return this._httpClient.put(json,`${this.urlApi}/getCriteriosEvaluacionPersonalizada`,true);
	}

	getAsistenciasCalificaciones(id: number){
		return this._httpClient.get(`${this.urlApi}/asistenciasCalificaciones/${id}`,true);
	}

}