import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
//import { CursosService } from '@app/main/services/cursos-service';
import { ProgramasGruposService } from '@app/main/services/grupos.services';
import { JsonResponse } from '@models/json-response';
import { FichasDataService } from '@services/fichas-data.service';

@Injectable()
export class ProyeccionGrupoService extends FichasDataService implements Resolve<any>
{
	programaciones: any;
	modalidades: any;
	fechas: any;
    grupos: any;

	onProgramacionesChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onModalidadesChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onFechasChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onGruposChanged: BehaviorSubject<any> = new BehaviorSubject(null);

    constructor(
		_httpClient: HttpService,
		//public _cursosService: CursosService,
		public _gruposService: ProgramasGruposService,
        snackBar: MatSnackBar,
		hashid: HashidsService
    ) {
		super(_httpClient, snackBar, hashid);
		this.onProgramacionesChanged = new BehaviorSubject(null);
		this.onModalidadesChanged = new BehaviorSubject(null);
		this.onFechasChanged = new BehaviorSubject(null);
        this.onGruposChanged = new BehaviorSubject(null);
		
	}
	
	getProgramacionBySede(sedeId: number): Promise <any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			let url: string = `/api/v1/reporte-grupos/listados/programaciones/${sedeId}`;
			this._httpClient.get(url, true)
                .subscribe((response: any) => {
                    this.cargando = false;

                    if (response.status == 200) {
                        this.programaciones = response.data;
                    } else {
                        if (response.status == 1557) {
                            this.snackBar.open(this.getError(response), 'OK', { duration: 5000, });
                        } else {
                            this.programaciones = [];
                            this.snackBar.open(response.message, 'OK', { duration: 5000, });
                        }
                    }
					this.onProgramacionesChanged.next(this.programaciones);
                    resolve(response);
                }, err => {
                    this.programaciones = [];
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
					this.onProgramacionesChanged.next(this.programaciones);

                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
		});
	}

	getModalidadBySedeAndCiclo(sedeId: number, paId: number, cicloId: number): Promise <any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			let url: string = `/api/v1/reporte-grupos/listados/modalidades/${sedeId}/${paId}/${cicloId}`;
			this._httpClient.get(url, true)
                .subscribe((response: any) => {
                    this.cargando = false;

                    if (response.status == 200) {
                        this.modalidades = response.data;
                    } else {
                        if (response.status == 1557) {
                            this.snackBar.open(this.getError(response), 'OK', { duration: 5000, });
                        } else {
                            this.modalidades = [];
                            this.snackBar.open(response.message, 'OK', { duration: 5000, });
                        }
                    }
					this.onModalidadesChanged.next(this.modalidades);
                    resolve(response);
                }, err => {
                    this.modalidades = [];
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
					this.onModalidadesChanged.next(this.modalidades);

                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
		});
	}

	getFechasBySedeAndCicloAndModalidad(sedeId: number, paId: number, cicloId: number, modalidadId: number): Promise <any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			let url: string = `/api/v1/reporte-grupos/listados/fechasFin/${sedeId}/${paId}/${cicloId}/${modalidadId}`;
			this._httpClient.get(url, true)
                .subscribe((response: any) => {
                    this.cargando = false;

                    if (response.status == 200) {
                        this.fechas = response.data;
                    } else {
                        if (response.status == 1557) {
                            this.snackBar.open(this.getError(response), 'OK', { duration: 5000, });
                        } else {
                            this.fechas = [];
                            this.snackBar.open(response.message, 'OK', { duration: 5000, });
                        }
                    }
					this.onFechasChanged.next(this.fechas);
                    resolve(response);
                }, err => {
                    this.fechas = [];
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
					this.onFechasChanged.next(this.fechas);

                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
		});
	}

    getProyecciones(grupos: number[]): Promise <any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			let url: string = `/api/v1/proyeccion-grupos/nuevos`;
			this._httpClient.post({grupos : grupos.join(',')}, url,true)
                .subscribe((response: any) => {
                    this.cargando = false;
                    switch(response.status){
                        case 200:
                            this.grupos = response.data;
                            break;
                        case 1557:
                            this.snackBar.open(this.getError(response), 'OK', { duration: 5000, });
                            break;
                        default:
                            this.grupos = [];
                            this.snackBar.open(response.message, 'OK', { duration: 5000, });
                            break;
                    };
					this.onGruposChanged.next(this.grupos);
                    resolve(response);
                }, err => {
                    this.grupos = [];
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
					this.onGruposChanged.next(this.grupos);
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
		});
	}

    proyectar(grupos: number[]): Promise <any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			let url: string = `/api/v1/proyeccion-grupos/proyeccionGrupos`;
			this._httpClient.post({grupos : grupos.join(',')}, url,true)
                .subscribe((response: any) => {
                    this.cargando = false;
                    switch(response.status){
                        case 200:
                            break;
                        case 1557:
                            this.snackBar.open(this.getError(response), 'OK', { duration: 5000, });
                            break;
                        default:
                            this.snackBar.open(response.message, 'OK', { duration: 5000, });
                            break;
                    };
                    resolve(response);
                }, err => {
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
		});
	}
    
}