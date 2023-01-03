import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Resolve } from '@angular/router';
import { PAModalidadComboSimpleProjection } from '@app/main/modelos/pamodalidad';
import { ProgramaIdiomaComboProjection } from '@app/main/modelos/programa-idioma';
import { ProgramaIdiomaCertificacionValeListadoProjection } from '@app/main/modelos/programa-idioma-certificacion-vale';
import { SucursalPlantelComboProjection } from '@app/main/modelos/sucursal-plantel';
import { JsonResponse } from '@models/json-response';
import { FichasDataService } from '@services/fichas-data.service';
import { HashidsService } from '@services/hashids.service';
import { HttpService } from '@services/http.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ListadoValeCertificacionService extends FichasDataService implements Resolve<any> {

  private urlApi: string = '/api/v1/vales-certificaciones';

  onListaCursoChanged: BehaviorSubject<ProgramaIdiomaComboProjection[]> = new BehaviorSubject(null);
	onListaModalidadChanged: BehaviorSubject<PAModalidadComboSimpleProjection[]> = new BehaviorSubject(null);
	onFechasChanged: BehaviorSubject<string[]> = new BehaviorSubject(null);
  onActualizarAlumno: BehaviorSubject<ProgramaIdiomaCertificacionValeListadoProjection> = new BehaviorSubject(null);
  onActualizarAlumnos: BehaviorSubject<ProgramaIdiomaCertificacionValeListadoProjection[]> = new BehaviorSubject(null);
  onCorreoAlumno: BehaviorSubject<string> = new BehaviorSubject(null);

  constructor(
    _httpClient: HttpService,
		_matSnackBar: MatSnackBar,
		_hashid: HashidsService,
	) { 
		super(_httpClient, _matSnackBar, _hashid);
	}

  getListaCurso(sedeId: number): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get('/api/v1/cursos/getSucursales/' + sedeId, true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onListaCursoChanged.next(response.data);
				else {
					this.onListaCursoChanged.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onListaCursoChanged.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}

  getListaModalidad(filtros: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(filtros, this.urlApi + '/getListaModalidad', true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onListaModalidadChanged.next(response.data.listaModalidad);
				else {
					this.onListaModalidadChanged.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onListaModalidadChanged.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}

  getListaFecha(filtros: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(filtros, this.urlApi + '/getListaFecha', true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onFechasChanged.next(response.data.listaFecha);
				else {
					this.onFechasChanged.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onFechasChanged.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}

  getValeCertificacionGenerarTodos(listaAlumnoGrupoId : number[]): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(listaAlumnoGrupoId, this.urlApi + '/getValeCertificacionGenerarTodos', true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onActualizarAlumnos.next(response.data);
				else {
					this.onFechasChanged.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onActualizarAlumnos.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}

  getValeCertificacionGenerar(alumnoGrupoId: number): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(alumnoGrupoId, this.urlApi + '/getValeCertificacionGenerar', true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onActualizarAlumno.next(response.data);
				else {
					this.onFechasChanged.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onActualizarAlumno.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}

  getValeCertificacionEnviar(alumnoGrupoId: number): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(alumnoGrupoId, this.urlApi + '/getValeCertificacionEnviar', true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onActualizarAlumno.next(response.data);
				else {
					this.onFechasChanged.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onActualizarAlumno.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}

  getValeCertificacionImprimir(alumnoGrupoId: number): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post_get_file(alumnoGrupoId, this.urlApi + '/getValeCertificacionImprimir', true)
				.subscribe((response: any) => {
					this.cargando = false;
					this._httpClient.printPDF(response);
					resolve(response);
				}, err => {
					this.cargando = false;
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

  getValeCertificacionBorrar(alumnoGrupoId: number): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(alumnoGrupoId, this.urlApi + '/getValeCertificacionBorrar', true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onActualizarAlumno.next(response.data);
				else {
					this.onFechasChanged.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onActualizarAlumno.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}

  getValeCertificacionCancelar(alumnoGrupoId: number): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(alumnoGrupoId, this.urlApi + '/getValeCertificacionCancelar', true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onActualizarAlumno.next(response.data);
				else {
					this.onFechasChanged.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onActualizarAlumno.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}

  getCorreoAlumno(alumnoGrupoId: number): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(this.urlApi + '/getCorreoAlumno/' + alumnoGrupoId, true).subscribe((response: any) => {
        		this.cargando = false;
				if (response.status == 200)
					this.onCorreoAlumno.next(response.data);
				else {
					this.onFechasChanged.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
      		}, err => {
        		this.cargando = false;
				this.onCorreoAlumno.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
      		});
		});
	}
}
