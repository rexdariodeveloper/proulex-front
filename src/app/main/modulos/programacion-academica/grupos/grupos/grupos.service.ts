import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { CursosService } from '@app/main/services/cursos-service';
import { ProgramasGruposService } from '@app/main/services/grupos.services';
import { PAModalidadComboProjection, PAModalidadComboSimpleProjection } from '@app/main/modelos/pamodalidad';
import { ProgramacionAcademicaComercialEditarProjection } from '@app/main/modelos/programacion-academica-comercial';
import { JsonResponse } from '@models/json-response';
import { FichasDataService } from '@services/fichas-data.service';
import { ArchivoProjection } from '@models/archivo';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { ProgramaComboProjection } from '@app/main/modelos/programa';
import { ProgramaIdiomaComboProjection, ProgramaIdiomaComboSimpleProjection } from '@app/main/modelos/programa-idioma';
import { ArchivoService } from '@app/main/services/archivo.service';
import { ArchivosEstructurasCarpetas } from '@app/main/modelos/mapeos/archivos-estructuras-carpetas';

@Injectable()
export class GruposService extends FichasDataService implements Resolve<any>
{

	urlApi: string = '/api/v1/grupos';

	onComboModalidadChanged: BehaviorSubject <PAModalidadComboProjection[]> = new BehaviorSubject(null);
	onComboProgramacionChanged: BehaviorSubject <ProgramacionAcademicaComercialEditarProjection[]> = new BehaviorSubject(null);
	onComboTestChanged: BehaviorSubject <any[]> = new BehaviorSubject(null);
	onComboSucursalChanged: BehaviorSubject <any[]> = new BehaviorSubject(null);
	onComboPlantelChanged: BehaviorSubject <any[]> = new BehaviorSubject(null);
	onEnviarChanged: BehaviorSubject <boolean> ;
	onInscripcionesChanged: BehaviorSubject <any[]> = new BehaviorSubject(null);
	onSueldoChanged: BehaviorSubject <any[]> = new BehaviorSubject(null);
	onUltimoGrupoChanged: BehaviorSubject <any> = new BehaviorSubject(null);
	
	onFiltrosCursosChanged: BehaviorSubject <any> = new BehaviorSubject(null);
	onFiltrosModalidadesNivelesChanged: BehaviorSubject <any> = new BehaviorSubject(null);
	onFiltrosHorariosChanged: BehaviorSubject <any> = new BehaviorSubject(null);

	onAlumnoExamenChanged: BehaviorSubject <any[]> = new BehaviorSubject(null);
	onSucursalesChanged: BehaviorSubject <any[]> = new BehaviorSubject(null);

	onFechasChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onEvidenciaUploadChanged: BehaviorSubject<number> = new BehaviorSubject(null);
	onEvidenciaChanged: BehaviorSubject<ArchivoProjection> = new BehaviorSubject(null);

    constructor(
		_httpClient: HttpService,
		public _cursosService: CursosService,
		public _gruposService: ProgramasGruposService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private router: Router,
		private _archivoService: ArchivoService
    ) {
		super(_httpClient, snackBar, hashid);
		this.onEnviarChanged = new BehaviorSubject(null);
		this.onFechasChanged = new BehaviorSubject(null);
	}

	/**
	 * Get combo estados
	 *
	 * @returns {Promise<any>}
	 */
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

	getComboProgramacion(programaId: number, modalidadId: number, idiomaId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._cursosService.getProgramacion(programaId,modalidadId,idiomaId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onComboProgramacionChanged.next(response.data);
					} else {
						this.onComboProgramacionChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onComboProgramacionChanged.next(null);
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

	/*getComboTest(programaId: number, modalidadId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._cursosService.getTest(programaId,modalidadId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onComboTestChanged.next(response.data);
					} else {
						this.onComboTestChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onComboTestChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}*/

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

	getPlanteles(idSucursal: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._cursosService.getPlantelesBySucursal(idSucursal)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onComboPlantelChanged.next(response.data);
					} else {
						this.onComboPlantelChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onComboPlantelChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getInscripciones(idGrupo: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._gruposService.getInscripciones(idGrupo)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onInscripcionesChanged.next(response.data);
					} else {
						this.onInscripcionesChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onInscripcionesChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	bajaGrupo(idInscripcion: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._gruposService.bajaGrupo(idInscripcion)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
					} else {
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
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

	posponerGrupo(idInscripcion: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._gruposService.posponerGrupo(idInscripcion)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
					} else {
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
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

	cambioGrupo(json: any): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._gruposService.cambioGrupo(json)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
					} else {
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
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
	
	getConsecutivoUltimoGrupo(json: any): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._gruposService.getConsecutivoUltimoGrupo(json)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onUltimoGrupoChanged.next(response.data);
					} else {
						this.onUltimoGrupoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onUltimoGrupoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getFiltrosCursos(sucursales: SucursalComboProjection[]): Promise < any > {
		let body = {
			sucursalesIds: sucursales.map(sucursal => sucursal.id)
		};

		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(body),`${this.urlApi}/filtros/cursos`,true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200) {
					this.onFiltrosCursosChanged.next(response.data);
				} else {
					this.onFiltrosCursosChanged.next(null);
					this.snackBar.open(response.message, 'OK', {
						duration: 5000,
					});
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onFiltrosCursosChanged.next(null);
				this.snackBar.open(this.getError(err), 'OK', {
					duration: 5000,
				});
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}

	getFiltrosModalidadesNiveles(cursos: ProgramaIdiomaComboSimpleProjection[]): Promise < any > {
		let body = {
			cursosIds: cursos.map(curso => curso.id)
		};

		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(body),`${this.urlApi}/filtros/modalidades/niveles`,true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200) {
					this.onFiltrosModalidadesNivelesChanged.next(response.data);
				} else {
					this.onFiltrosModalidadesNivelesChanged.next(null);
					this.snackBar.open(response.message, 'OK', {
						duration: 5000,
					});
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onFiltrosModalidadesNivelesChanged.next(null);
				this.snackBar.open(this.getError(err), 'OK', {
					duration: 5000,
				});
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}

	getFiltrosHorarios(modalidad: PAModalidadComboSimpleProjection): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/filtros/horarios/${modalidad.id}`,true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200) {
					this.onFiltrosHorariosChanged.next(response.data);
				} else {
					this.onFiltrosHorariosChanged.next(null);
					this.snackBar.open(response.message, 'OK', {
						duration: 5000,
					});
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onFiltrosHorariosChanged.next(null);
				this.snackBar.open(this.getError(err), 'OK', {
					duration: 5000,
				});
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}

	cancelarGrupo(grupoId: number, fechaCancelacion: string): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.put(JSON.stringify({fechaCancelacion}),`${this.urlApi}/delete/${this.hashid.encode(grupoId)}`,true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200) {
					this.snackBar.open('Registro eliminado', 'OK', {
						duration: 5000,
					});
					this.router.navigate(['/app/programacion-academica/grupos'])
				} else {
					this.snackBar.open(response.message, 'OK', {
						duration: 5000,
					});
				}
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

	alumnoExamenCertificacion(alumnoId: number, grupoId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/getDatosAlumnoExamenUbicacion/${alumnoId}/${grupoId}`,true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200) {
					this.onAlumnoExamenChanged.next(response.data);
				} else {
					this.onAlumnoExamenChanged.next(null);
					this.snackBar.open(response.message, 'OK', {
						duration: 5000,
					});
				}
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

	getExcel(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cargando = true;
            this._httpClient.get_file(url, true)
                .subscribe((response: any) => {
                    this.cargando = false;
					if(response.body.type === 'application/json'){
						const fr = new FileReader();
						fr.onload = (e) => {
							this.snackBar.open((e.target.result as string), 'OK', {
								duration: 5000,
							});
						};
						fr.readAsText(response.body);
					} else
                    	this._httpClient.downloadExcel(response);
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

    getSucursalesTotales(): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/getSucursales`,true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200) {
					this.onSucursalesChanged.next(response.data);
				} else {
					this.onSucursalesChanged.next(null);
					this.snackBar.open(response.message, 'OK', {
						duration: 5000,
					});
				}
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
	
	getFechas(filtros: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(filtros, `${this.urlApi}/getFechas`, true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onFechasChanged.next(response.data);
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

	subirEvidencia(archivo: File, grupo: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._archivoService.fileUpload(archivo, ArchivosEstructurasCarpetas.GRUPOS.EVIDENCIAS, null, false, true, grupo)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onEvidenciaUploadChanged.next(response.data);
					} else {
						this.onEvidenciaUploadChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onEvidenciaUploadChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getEvidencia(archivoId: number): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._archivoService.getProjection(archivoId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onEvidenciaChanged.next(response.data);
					} else {
						this.onEvidenciaChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onEvidenciaChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	cancelarProfesorSustituto(programaGrupoListadoClaseId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._gruposService.cancelarProfesorSustituto(programaGrupoListadoClaseId)
				.subscribe((response: any) => {
					this.cargando = false;
					this.snackBar.open(response.message, 'OK', {
						duration: 5000,
					});
					if (response.status == 200) {
					} else {
					}
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
}