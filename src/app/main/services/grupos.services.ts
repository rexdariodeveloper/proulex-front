import { Injectable } from '@angular/core';
import { HttpService } from '@services/http.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProgramasGruposService {

	private urlApi = '/api/v1/grupos';

	constructor(
		public _httpClient: HttpService
	){}

	getInscripciones(idGrupo: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/getInscripciones/${idGrupo}`,true);
	}

	bajaGrupo(idInscripcion: number): Observable<Object>{
		return this._httpClient.put(null,`${this.urlApi}/bajaGrupo/${idInscripcion}`,true);
	}

	posponerGrupo(idInscripcion: number): Observable<Object>{
		return this._httpClient.put(null,`${this.urlApi}/posponerGrupo/${idInscripcion}`,true);
	}

	cambioGrupo(json: any): Observable<Object>{
		return this._httpClient.post(json,`${this.urlApi}/cambiarGrupo`,true);
	}

	datosSueldoEmpleado(idCurso: number, idEmpleado: number, idGrupo: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/getDatosSueldoEmpleado/${idCurso}/${idEmpleado}/${idGrupo}`,true);
	}

	datosSueldoEmpleadoIncompany(idCurso: number, idEmpleado: number, idHorario: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/getDatosSueldoEmpleadoIncompany/${idCurso}/${idEmpleado}/${idHorario}`,true);
	}

	getDatosSueldoEmpleadoDeduccionPercepcion(idEmpleado: number, idDeduccionPercepcion: number): Observable<Object>{
		return this._httpClient.get(`${this.urlApi}/getDatosSueldoEmpleadoDeduccionPercepcion/${idEmpleado}/${idDeduccionPercepcion}`,true);
	}

	getConsecutivoUltimoGrupo(json: any){
		return this._httpClient.post(json,`${this.urlApi}/getGrupoConsecutivo`,true);
	}

	getSucursalEsJobs(idSucursal: number){
		return this._httpClient.get(`${this.urlApi}/getProgramacionCiclo/${idSucursal}`,true);
	}

	getFechasInicioByCiclo(idCiclo: number){
		return this._httpClient.get(`${this.urlApi}/getFechasInicioByCiclo/${idCiclo}`,true);
	}

    getFechasInicioByAnioAndSucursalAndModalidad(anio: number, sucursalId: number, idModalidad: number){
		return this._httpClient.get(`${this.urlApi}/getFechasInicioByAnioAndSucursalAndModalidad/${anio}/${sucursalId}/${idModalidad}`,true);
	}

	cancelarProfesorSustituto(programaGrupoListadoClaseId: number): Observable<Object>{
		let body = {
			programaGrupoListadoClaseId
		};
		return this._httpClient.put(JSON.stringify(body),`${this.urlApi}/cancelar-profesor-sustituto`,true);
	}

}