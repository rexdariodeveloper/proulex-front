import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { EstadoService } from '@app/main/services/estado.service';
import { ArchivoService } from '@app/main/services/archivo.service';
import { ProgramasGruposService } from '@app/main/services/grupos.services';
import { CursosService } from '@app/main/services/cursos-service';
import { IncompanyService } from '@app/main/services/incompany.service';
import { ArchivosEstructurasCarpetas } from '@app/main/modelos/mapeos/archivos-estructuras-carpetas';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { ArticuloComboProjection } from '@app/main/modelos/articulo';
import { PAModalidadComboProjection } from '@app/main/modelos/pamodalidad';
import { ProgramaGrupoIncompanyCriterioEvaluacion } from '@app/main/modelos/programa-grupo-incompany-criterio-evaluacion';
import { JsonResponse } from '@models/json-response';
import { ArchivoProjection } from '@models/archivo';

@Injectable()
export class GrupoService extends FichaDataService implements Resolve<any>{

	onComboEstadosChanged: BehaviorSubject <EstadoComboProjection[]> = new BehaviorSubject(null);
	onPDFChanged: BehaviorSubject <number> ;
	onComboModalidadChanged: BehaviorSubject <PAModalidadComboProjection[]> = new BehaviorSubject(null);
	onCriteriosChanged: BehaviorSubject <ProgramaGrupoIncompanyCriterioEvaluacion[]> = new BehaviorSubject(null);
	onCriteriosPersonalizadoChanged: BehaviorSubject <ProgramaGrupoIncompanyCriterioEvaluacion[]> = new BehaviorSubject(null);
	onMaterialesChanged: BehaviorSubject <ArticuloComboProjection[]> = new BehaviorSubject(null);
	onComboSucursalChanged: BehaviorSubject <any[]> = new BehaviorSubject(null);
	onAsistenciaCalificacionChanged: BehaviorSubject <any[]> = new BehaviorSubject(null);
	onSueldoChanged: BehaviorSubject <any[]> = new BehaviorSubject(null);
	onVentaChanged: BehaviorSubject <any[]> = new BehaviorSubject(null);
	onComboZonaChanged: BehaviorSubject<any[]> = new BehaviorSubject(null);

    constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private estadoService: EstadoService,
		private archivoService: ArchivoService,
		public _cursosService: CursosService,
		public _incompanyService: IncompanyService,
		public _gruposService: ProgramasGruposService
    ) {
        super(_httpClient, snackBar, hashid);
        this.onPDFChanged = new BehaviorSubject(null);
	}
	
	/**
	 * Get combo estados
	 *
	 * @returns {Promise<any>}
	 */
	
	subirArchivo(archivo: File, empleadoNombre: string): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.archivoService.fileUpload(archivo,ArchivosEstructurasCarpetas.PAGOS_CXP.id,null,false,true,empleadoNombre)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onPDFChanged.next(response.data);
					} else {
						this.onPDFChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onPDFChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
			
		});
	}

	verArchivo(evidencia: ArchivoProjection){
		return new Promise((resolve, reject) => {
            this.archivoService.descargarArchivo(evidencia.id)
                .subscribe((response: any) => {
					//this.archivoService.verArchivo(evidencia,response.body);
					this.archivoService.descargarArchivoResponse(response.body,evidencia.nombreOriginal.split('.').pop(),evidencia.nombreOriginal);
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

	getComboModalidades(cursoId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._cursosService.getCombo(cursoId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onComboModalidadChanged.next(response.data);
					} else {
						this.onComboModalidadChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onComboModalidadChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getCriteriosEvaluacion(json: any): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._incompanyService.getCriteriosEvaluacionIncompany(json)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onCriteriosChanged.next(response.data);
					} else {
						this.onCriteriosChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onCriteriosChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getCriteriosEvaluacionPersonalizado(json: any): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._incompanyService.getCriteriosEvaluacionIncompanyPersonalizado(json)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onCriteriosPersonalizadoChanged.next(response.data);
					} else {
						this.onCriteriosPersonalizadoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onCriteriosPersonalizadoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getArticulos(programaIdiomaId: number, nivel: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._cursosService.getArticulos(programaIdiomaId,nivel)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onMaterialesChanged.next(response.data);
					} else {
						this.onMaterialesChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onMaterialesChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getSucursales(idSucursal: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._cursosService.getSucursales(idSucursal)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onComboSucursalChanged.next(response.data);
					} else {
						this.onComboSucursalChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onComboSucursalChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getAsistenciasCalificaciones(idGrupo: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._incompanyService.getAsistenciasCalificaciones(idGrupo)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onAsistenciaCalificacionChanged.next(response.data);
					} else {
						this.onAsistenciaCalificacionChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onAsistenciaCalificacionChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getDatosSueldo(idCurso: number, idEmpleado: number, idGrupo: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._gruposService.datosSueldoEmpleado(idCurso,idEmpleado,idGrupo)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onSueldoChanged.next(response.data);
					} else {
						this.onSueldoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onSueldoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getDatosSueldoIncompany(idCurso: number, idEmpleado: number, idHorario: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._gruposService.datosSueldoEmpleadoIncompany(idCurso,idEmpleado,idHorario)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onSueldoChanged.next(response.data);
					} else {
						this.onSueldoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onSueldoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getDatosVenta(filtros: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(filtros, `/api/v1/precios-incompany/getDatosVenta`, true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onVentaChanged.next(response.data);
				else {
					this.onVentaChanged.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onVentaChanged.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}

	getComboZona(json: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(json, '/api/v1/precios-incompany/getComboZona', true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onComboZonaChanged.next(response.data);
				else {
					this.onComboZonaChanged.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onComboZonaChanged.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}
    
}