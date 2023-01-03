import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { JsonResponse } from '@models/json-response';
import { FichasDataService } from '@services/fichas-data.service';
import { SucursalPlantelComboProjection } from '@app/main/modelos/sucursal-plantel';
import { PAComercialComboFiltroProjection } from '@app/main/modelos/programacion-academica-comercial';
import { PAModalidadComboSimpleProjection } from '@app/main/modelos/pamodalidad';
import { PACicloComboProjection } from '@app/main/modelos/paciclo';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';

@Injectable()
export class ReporteAsistenciasService extends FichasDataService implements Resolve<any>
{
    private rutaBuscadorLocalStorage: string = 'ficha-listado-buscador';
    private buscadorMap: {[ruta:string]: string} = {};
    url: string = '/api/v1/captura_asistencia/';
    planteles: SucursalPlantelComboProjection[];
    plantelesAlumnos: ControlMaestroMultipleComboProjection[];
	programaciones: PAComercialComboFiltroProjection[];
    ciclos: PACicloComboProjection[];
	modalidades: PAModalidadComboSimpleProjection[];
	fechas: string[];

    onPlantelesChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onPlantelesAlumnoChanged: BehaviorSubject<any> = new BehaviorSubject(null); 
	onProgramacionesChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onModalidadesChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onFechasChanged: BehaviorSubject<any> = new BehaviorSubject(null);

    constructor(
		_httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService
    ) {
		super(_httpClient, snackBar, hashid);
        this.onPlantelesChanged = new BehaviorSubject(null);
        this.onPlantelesAlumnoChanged = new BehaviorSubject(null);
		this.onProgramacionesChanged = new BehaviorSubject(null);
		this.onModalidadesChanged = new BehaviorSubject(null);
		this.onFechasChanged = new BehaviorSubject(null);
        let buscadorMap = localStorage.getItem(this.rutaBuscadorLocalStorage);
        if(!!buscadorMap)
            this.buscadorMap = JSON.parse(buscadorMap);
	}

    getPlantelesByFiltros(data: any): Promise <any> {
        return new Promise((resolve, reject) => {
            this.cargando = true;
            this._httpClient.post(data, this.url + 'listados/planteles', true)
                .subscribe((response: any) => {
                    this.cargando = false;
                    if(response.status == 200)
                        this.planteles = response.data;
                    else {
                        if (response.status == 1557) {
                            this.snackBar.open(this.getError(response), 'OK', { duration: 5000, });
                        } else {
                            this.planteles = [];
                            this.snackBar.open(response.message, 'OK', { duration: 5000, });
                        }
                    }
                    this.onPlantelesChanged.next(this.planteles);
                    resolve(response);
                }, err => {
                    this.planteles = [];
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
					this.onPlantelesChanged.next(this.planteles);

                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    getPlantelesAlumnosByFiltros(data: any): Promise <any> {
        return new Promise((resolve, reject) => {
            this.cargando = true;
            this._httpClient.post(data, this.url + 'listados/planteles_alumno', true)
                .subscribe((response: any) => {
                    this.cargando = false;
                    if(response.status == 200)
                        this.plantelesAlumnos = response.data;
                    else {
                        if (response.status == 1557) {
                            this.snackBar.open(this.getError(response), 'OK', { duration: 5000, });
                        } else {
                            this.plantelesAlumnos = [];
                            this.snackBar.open(response.message, 'OK', { duration: 5000, });
                        }
                    }
                    this.onPlantelesAlumnoChanged.next(this.plantelesAlumnos);
                    resolve(response);
                }, err => {
                    this.plantelesAlumnos = [];
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
					this.onPlantelesAlumnoChanged.next(this.plantelesAlumnos);

                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }
	
	getProgramacionesByFiltros(data: any): Promise <any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(data, this.url+ 'listados/programaciones', true)
                .subscribe((response: any) => {
                    this.cargando = false;
                    if (response.status == 200)
                        this.programaciones = response.data;
                    else {
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

	getModalidadesByFiltros(data: any): Promise <any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(data,this.url + 'listados/modalidades', true)
                .subscribe((response: any) => {
                    this.cargando = false;
                    if (response.status == 200)
                        this.modalidades = response.data;
                    else {
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

	getFechasByFiltros(data: any): Promise <any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(data, this.url + 'listados/fechas', true)
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

    getTextoBuscador(ruta: string){
        return this.buscadorMap[ruta] || '';
    }

    setTextoBuscador(ruta: string, textoBuscador: string){
        this.buscadorMap[ruta] = textoBuscador;
        localStorage.setItem(this.rutaBuscadorLocalStorage,JSON.stringify(this.buscadorMap));
    }
    
}