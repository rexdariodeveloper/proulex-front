import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { JsonResponse } from '@models/json-response';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { EstadoService } from '@app/main/services/estado.service';
import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Alumno, AlumnoEditarProjection } from '@app/main/modelos/alumno';
import { Moment } from 'moment';
import { MunicipioService } from '@app/main/services/municipio.service';
import { MunicipioComboProjection } from '@app/main/modelos/municipio';

@Injectable()
export class AlumnoService extends FichaDataService implements Resolve<any>{

    private urlApi = '/api/v1/alumnos';
    private urlCMMApi = '/api/v1/cmm';
    
    onEstadosNacimientoChanged: BehaviorSubject<EstadoComboProjection[]> = new BehaviorSubject(null);
    onEstadosChanged: BehaviorSubject<EstadoComboProjection[]> = new BehaviorSubject(null);
    onEstadosFacturacionChanged: BehaviorSubject<EstadoComboProjection[]> = new BehaviorSubject(null);
    onMunicipiosNacimientoChanged: BehaviorSubject<MunicipioComboProjection[]> = new BehaviorSubject(null);
    onMunicipiosChanged: BehaviorSubject<MunicipioComboProjection[]> = new BehaviorSubject(null);
    onMunicipiosFacturacionChanged: BehaviorSubject<MunicipioComboProjection[]> = new BehaviorSubject(null);
    onCarrerasChanged: BehaviorSubject<ControlMaestroMultipleComboProjection[]> = new BehaviorSubject(null);
    onDatosBecaChanged: BehaviorSubject<AlumnoEditarProjection> = new BehaviorSubject(null);
    onAlumnosRepetidosChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onMediosEnteradoChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onRazonesEleccionChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onKardexUrlChanged: BehaviorSubject<any> = new BehaviorSubject(null);

	constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
        hashid: HashidsService,
        private estadoService: EstadoService,
        private municipioService: MunicipioService
    ) {
        super(_httpClient, snackBar, hashid);
    }

    getEstadosNacimiento(paisId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.estadoService.getCombo(paisId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onEstadosNacimientoChanged.next(response.data);
					} else {
						this.onEstadosNacimientoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onEstadosNacimientoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getEstados(paisId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.estadoService.getCombo(paisId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onEstadosChanged.next(response.data);
					} else {
						this.onEstadosChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onEstadosChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getMunicipiosNacimiento(estadoId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.municipioService.getCombo(estadoId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onMunicipiosNacimientoChanged.next(response.data);
					} else {
						this.onMunicipiosNacimientoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onMunicipiosNacimientoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getMunicipios(estadoId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.municipioService.getCombo(estadoId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onMunicipiosChanged.next(response.data);
					} else {
						this.onMunicipiosChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onMunicipiosChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getMunicipiosFacturacion(estadoId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.municipioService.getCombo(estadoId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onMunicipiosFacturacionChanged.next(response.data);
					} else {
						this.onMunicipiosFacturacionChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onMunicipiosFacturacionChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getEstadosFacturacion(paisId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.estadoService.getCombo(paisId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onEstadosFacturacionChanged.next(response.data);
					} else {
						this.onEstadosFacturacionChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onEstadosFacturacionChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getCarreras(centroUniversitarioId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/listados/carreras/${centroUniversitarioId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onCarrerasChanged.next(response.data);
					} else {
						this.onCarrerasChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onCarrerasChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getDatosBeca(becaId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/datos/beca/${this.hashid.encode(becaId)}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onDatosBecaChanged.next(response.data);
					} else {
						this.onDatosBecaChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onDatosBecaChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getAlumnosRepetidos(nombre: string, primerApellido: string, segundoApellido: string, fechaNacimiento: Moment): Promise < any > {
		let requestBody = {
			nombre,
			primerApellido,
			segundoApellido: segundoApellido || '',
			fechaNacimiento: fechaNacimiento.format('YYYY-MM-DD') + ' 00:00:00.0000000'
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/listados/repetidos`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onAlumnosRepetidosChanged.next(response.data);
					} else {
						this.onAlumnosRepetidosChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onAlumnosRepetidosChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	nuevoRegistroMedioEnterado(valor: string, control: string): Promise < any > {
		let requestBody: any = {
			control,
			valor
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlCMMApi}/save`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						let id = response.data;
						this._httpClient.get(`${this.urlApi}/listados/medios-enterado`,true)
							.subscribe((response: any) => {
								this.cargando = false;
								if (response.status == 200) {
									response.data.id = id;
									this.onMediosEnteradoChanged.next(response.data);
								} else {
									this.onMediosEnteradoChanged.next(null);
									this.snackBar.open(response.message, 'OK', {
										duration: 5000,
									});
								}
								resolve(response);
							});
					} else {
						this.onMediosEnteradoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
						resolve(response);
					}
				}, err => {
					this.cargando = false;
					this.onMediosEnteradoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	nuevoRegistroRazonEleccion(valor: string, control: string): Promise < any > {
		let requestBody: any = {
			control,
			valor
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlCMMApi}/save`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						let id = response.data;
						this._httpClient.get(`${this.urlApi}/listados/razon-eleccion`,true)
							.subscribe((response: any) => {
								this.cargando = false;
								if (response.status == 200) {
									response.data.id = id;
									this.onRazonesEleccionChanged.next(response.data);
								} else {
									this.onRazonesEleccionChanged.next(null);
									this.snackBar.open(response.message, 'OK', {
										duration: 5000,
									});
								}
								resolve(response);
							});
					} else {
						this.onRazonesEleccionChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
						resolve(response);
					}
				}, err => {
					this.cargando = false;
					this.onRazonesEleccionChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getKardex(codigoAlumno: string): Promise<any> {
        this.cargando = true;
		let body = {
			codigoAlumno
		};
        return new Promise((resolve, reject) => {
            this._httpClient.post_get_file(body, '/api/v1/kardex-alumno/pdf/', true)
                .subscribe((response: any) => {
                    const blob = new Blob([response.body], { type: response.body.type });
                    let data = URL.createObjectURL(blob);
                    resolve(data);
                    this.onKardexUrlChanged.next(data);
                    this.cargando = false;

                }, err => {
                    this.onKardexUrlChanged.next(null);
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }
    
}