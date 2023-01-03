import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { JsonResponse } from '@models/json-response';
import { PuntoVentaGeneralService } from '@app/main/services/punto-venta.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { OrdenVenta } from '@app/main/modelos/orden-venta';
import { OrdenVentaDetalle } from '@app/main/modelos/orden-venta-detalle';
import { AlumnoEntregarLibrosProjection, AlumnoInscripcionesPendientesJOBSProjection, AlumnoInscripcionesPendientesJOBSSEMSProjection, AlumnoInscripcionPendientePCPProjection } from '@app/main/modelos/alumno';
import { Moment } from 'moment';
import { ImpuestosArticuloService } from '@app/main/services/impuestos-articulos.service';

@Injectable()
export class PuntoVentaAbiertoService extends FichaDataService implements Resolve<any>{

    private urlApi = '/api/v1/punto-venta';
    private urlPuntoVentaInicio = '/app/ventas/punto-venta';
    
    onAbrirTurnoChanged: BehaviorSubject<boolean> = new BehaviorSubject(null);
    onProgramasChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onModalidadesChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onTiposGruposChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onNivelesChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onGruposChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onCategoriasChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onSubcategoriasChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onArticulosChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onListaPreciosClienteChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onDatosAlumnoChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onDatosReinscripcionesChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onOVDChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onLigaCentroPagosChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onCobrarChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onReinscripcionesModalidadesChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onReinscripcionesHorariosChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onAlumnosSinGrupoChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onDatosTiposGrupoAlumnoSinGrupoChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onDatosGruposAlumnoSinGrupoChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onRelacionarAlumnoSinGrupoChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onAlumnosEntregaLibrosChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onEntregarLibrosChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onAlumnosJOBSChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onAgregarAlumnosJOBSChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onAlumnosJOBSSEMSChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onAgregarAlumnosJOBSSEMSChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onBecasSindicatoChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onDatosBecaSindicatoChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onAplicarBecaSindicatoChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onBecaAlumnoChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onHistorialChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onHistorialResumenChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onDescuentoUsuarioChanged: BehaviorSubject<boolean> = new BehaviorSubject(null);
	onAlumnosPCPChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    onAgregarAlumnosPCPChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onBecasProulexChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onDatosBecaProulexChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onCobrarEntregaPendienteChanged: BehaviorSubject<boolean> = new BehaviorSubject(false);
	onGruposReinscripcionReprobadoChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onClientesInCompanyChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onGruposInCompanyChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onValesCertificacionesChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onAplicarValeCertificacionChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onValeCertificacionAlumnoChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onDiplomadosAcademyChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onModalidadesAcademyChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onTiposWorkshopChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	onWorkshopsChanged: BehaviorSubject<any> = new BehaviorSubject(null);
	
	constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
        hashid: HashidsService,
		private _puntoVentaGeneralService: PuntoVentaGeneralService,
        private router: Router,
        private _fuseSidebarService: FuseSidebarService,
		private _impuestosArticuloService: ImpuestosArticuloService
    ) {
        super(_httpClient, snackBar, hashid);
		
		this._httpClient.cargandoArchivoImprimir.subscribe(cargando => {
			this.cargando = cargando;
		});
    }

    getDatos(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cargando = true;
            let url = this.url + this.getSucursalPuntoVentaId();


            this._httpClient.get(url, true)
                .subscribe((response: any) => {
                    this.cargando = false;
                    if (response.status == 200) {
                        this.datos = response.data;
                        this.onDatosChanged.next(response.data);
                    } else if (response.status == 2000) {
                        this.snackBar.open(response.message, 'OK', {
                            duration: 5000,
                        });
                        this.cerrarTurno();
                    } else {
                        this.datos = null;
                        this.snackBar.open(response.message, 'OK', {
                            duration: 5000,
                        });
                        this.onDatosChanged.next(null);
                    }
                    resolve(response);
                }, err => {
                    this.datos = null;
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    this.onDatosChanged.next(null);
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });

        });

    }

	getSucursalPuntoVentaId(): number{
		return this._puntoVentaGeneralService.getSucursalId();
	}

	setSucursalPuntoVentaId(sucursalId: number){
		this._puntoVentaGeneralService.setSucursalId(sucursalId);
	}

	getPlantelPuntoVentaId(): number{
		return this._puntoVentaGeneralService.getPlantelId();
	}

	setPlantelPuntoVentaId(plantelId: number){
		this._puntoVentaGeneralService.setPlantelId(plantelId);
	}

    toggleSidebarFold(){
        if(!this._fuseSidebarService.getSidebar('navbar').folded){
            this._fuseSidebarService.getSidebar('navbar').toggleFold();
        }
    }

    getProgramas(idiomaId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/listados/programas/${this.getSucursalPuntoVentaId()}/${idiomaId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onProgramasChanged.next(response.data);
					} else {
						this.onProgramasChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onProgramasChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

    getModalidades(idiomaId: number, programaId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/listados/modalidades/${idiomaId}/${programaId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onModalidadesChanged.next(response.data);
					} else {
						this.onModalidadesChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onModalidadesChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

    getTiposGrupos(idiomaId: number, programaId: number, modalidadId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/listados/tipos-grupos/${idiomaId}/${programaId}/${modalidadId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onTiposGruposChanged.next(response.data);
					} else {
						this.onTiposGruposChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onTiposGruposChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

    getNiveles(idiomaId: number, programaId: number, modalidadId: number, tipoGrupoId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/listados/niveles/${idiomaId}/${programaId}/${modalidadId}/${tipoGrupoId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onNivelesChanged.next(response.data);
					} else {
						this.onNivelesChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onNivelesChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

    getGrupos(idiomaId: number, programaId: number, modalidadId: number, tipoGrupoId: number, nivel: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/listados/grupos/${this.getSucursalPuntoVentaId()}/${idiomaId}/${programaId}/${modalidadId}/${tipoGrupoId}/${nivel}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onGruposChanged.next(response.data);
					} else {
						this.onGruposChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onGruposChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getCategorias(familiaId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/listados/categorias/${familiaId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onCategoriasChanged.next(response.data);
					} else {
						this.onCategoriasChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onCategoriasChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getSubcategorias(categoriaId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/listados/subcategoriass/${categoriaId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onSubcategoriasChanged.next(response.data);
					} else {
						this.onSubcategoriasChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onSubcategoriasChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getArticulos(subcategoriaId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/listados/articulos/${subcategoriaId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onArticulosChanged.next(response.data);
					} else {
						this.onArticulosChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onArticulosChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

    getListaPreciosCliente(clienteId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/listados/precios/${clienteId}/${this.getSucursalPuntoVentaId()}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onListaPreciosClienteChanged.next(response.data);
					} else {
						this.onListaPreciosClienteChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onListaPreciosClienteChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

    getDatosAlumno(idiomaId: number, programaId: number, modalidadId: number, tipoGrupoId: number, alumnoId: number, grupoId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/datos/alumno/${idiomaId}/${programaId}/${modalidadId}/${tipoGrupoId}/${alumnoId}/${grupoId || 0}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onDatosAlumnoChanged.next(response.data);
					} else {
						this.onDatosAlumnoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onDatosAlumnoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getDatosAlumnoCertificacion(certificacionId: number, alumnoId: number, cantidad: number, listaPreciosId: number, localidadId: number, idTmp: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/datos/alumno/certificacion/${certificacionId}/${listaPreciosId}/${localidadId}/${idTmp}/${this.getSucursalPuntoVentaId()}/${alumnoId}/${cantidad}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onOVDChanged.next(response.data);
					} else {
						this.onOVDChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onOVDChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getDatosReinscripciones(filtro: string, offset: number, top: number): Promise < any > {
		let requestBody = {
			filtro,
			offset,
			top
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/datos/reinscripciones/${this.getSucursalPuntoVentaId()}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onDatosReinscripcionesChanged.next(response.data);
					} else {
						this.onDatosReinscripcionesChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onDatosReinscripcionesChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	// getDatosReinscripcionesReprobados(filtro: string, offset: number, top: number): Promise < any > {
	// 	let requestBody = {
	// 		filtro,
	// 		offset,
	// 		top
	// 	};
	// 	return new Promise((resolve, reject) => {
	// 		this.cargando = true;
	// 		this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/datos/reinscripciones/reprobados/${this.getSucursalPuntoVentaId()}`,true)
	// 			.subscribe((response: any) => {
	// 				this.cargando = false;
	// 				if (response.status == 200) {
	// 					this.onDatosReinscripcionesChanged.next(response.data);
	// 				} else {
	// 					this.onDatosReinscripcionesChanged.next(null);
	// 					this.snackBar.open(response.message, 'OK', {
	// 						duration: 5000,
	// 					});
	// 				}
	// 				resolve(response);
	// 			}, err => {
	// 				this.cargando = false;
	// 				this.onDatosReinscripcionesChanged.next(null);
	// 				this.snackBar.open(this.getError(err), 'OK', {
	// 					duration: 5000,
	// 				});
	// 				resolve(new JsonResponse(500, this.getError(err), null, null));
	// 			});
	// 	});

	// }

	crearOrdenVentaDetalle(
		articuloId: number,
		articuloSubtipoId: number,
        cantidad: number,
        listaPreciosId: number,
        descuento: number,
		idTmp: number,
        programaId?: number,
        idiomaId?: number,
        modalidadId?: number,
        tipoGrupoId?: number,
        grupoId?: number,
        numeroGrupo?: number,
        alumnoId?: number,
        becaUDGId?: number,
        programaIdiomaCertificacionValeId?: number,
        localidadId?: number,
        id?: number,
		nivel?: number
	): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;

			let requestBody = [{
				articuloId: !!articuloId ? String(articuloId) : null,
				articuloSubtipoId: !!articuloSubtipoId ? String(articuloSubtipoId) : null,
				cantidad: String(cantidad),
				listaPreciosId: String(listaPreciosId),
				descuento: String(descuento),
				programaId: !!programaId ? String(programaId) : null,
				idiomaId: !!idiomaId ? String(idiomaId) : null,
				modalidadId: !!modalidadId ? String(modalidadId) : null,
				grupoId: !!grupoId ? String(grupoId) : null,
				numeroGrupo: !!numeroGrupo ? String(numeroGrupo) : null,
				alumnoId: !!alumnoId ? String(alumnoId) : null,
				becaUDGId: !!becaUDGId ? String(becaUDGId) : null,
				localidadId: !!localidadId ? String(localidadId) : null,
				idTmp: String(idTmp),
				id: !!id ? String(id) : null,
				sucursalId: this.getSucursalPuntoVentaId(),
				nivel,
				tipoGrupoId,
				programaIdiomaCertificacionValeId
			}];
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/crear/detalle-ov`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onOVDChanged.next(response.data);
					} else {
						this.onOVDChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onOVDChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	crearLigaCentroPagos(
		alumnoId: number,
		sucursalId: number,
        idiomaId: number,
        programaId: number,
        modalidadId: number,
        modalidadHorarioId: number,
        grupoId: number,
        montoPago: number
	): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;

			let requestBody = {
				alumnoId: String(alumnoId),
				sucursalId: String(sucursalId),
				idiomaId: String(idiomaId),
				programaId: String(programaId),
				modalidadId: String(modalidadId),
				modalidadHorarioId: String(modalidadHorarioId),
				grupoId: String(grupoId),
				montoPago: String(montoPago)
			};
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/crear/liga-centro-pagos`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onLigaCentroPagosChanged.next(response.data);
					} else {
						this.onLigaCentroPagosChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onLigaCentroPagosChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	cobrar(
		clienteId: number,
		medioPagoId: number,
		tipoCambio: number,
		referenciaPago: string,
		detalles: OrdenVentaDetalle[],
		listaPreciosId: number,
		correoElectronico: string,
    	monto: number,
		fechaPago: Moment,
		marcarEntregaPendienteInscripciones: boolean
	): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;

			this.convertirMontosDetallesOV(detalles,tipoCambio);

			let ordenVenta: OrdenVenta = {
				sucursalId: this.getSucursalPuntoVentaId(),
				clienteId,
				medioPagoPVId: medioPagoId,
				tipoCambio,
				referenciaPago,
				detalles,
				plantelId: this.getPlantelPuntoVentaId(),
				listaPreciosId,
				correoElectronico,
    			monto,
				fechaPago: !!fechaPago ? fechaPago.format('YYYY-MM-DD') : null,
				marcarEntregaPendienteInscripciones
			};
			this._httpClient.post(JSON.stringify(ordenVenta),`${this.urlApi}/cobrar`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onCobrarChanged.next(response.data);
					} else if(response.status == 2000) {
						this.onCobrarChanged.next(null);
                        this.snackBar.open(response.message, 'OK', {
                            duration: 5000,
                        });
                        this.cerrarTurno();
                    } else if(response.status == 2001) {
						this.onCobrarEntregaPendienteChanged.next(true);
                    } else{
						this.onCobrarChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onCobrarChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	private convertirMontosDetallesOV(detalles: OrdenVentaDetalle[], tipoCambio: number): void{
		for(let detalle of detalles){
            detalle.precio = this._impuestosArticuloService.redondear(detalle.precioSinConvertir * tipoCambio,6);
            let porcentajeDescuento: number = 0;
            if(!!detalle.descuentoSinConvertir){
                porcentajeDescuento = detalle.descuentoSinConvertir / detalle.precioSinConvertir;
            }
            detalle.descuento = this._impuestosArticuloService.redondear(detalle.precio * porcentajeDescuento,6);
        }
	}

	getReinscripcionesModalidades(idiomaId: number, programaId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/listados/reinscripciones/modalidades/${idiomaId}/${programaId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onReinscripcionesModalidadesChanged.next(response.data);
					} else {
						this.onReinscripcionesModalidadesChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onReinscripcionesModalidadesChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getReinscripcionesHorarios(modalidadId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/listados/reinscripciones/horarios/${modalidadId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onReinscripcionesHorariosChanged.next(response.data);
					} else {
						this.onReinscripcionesHorariosChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onReinscripcionesHorariosChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getAlumnosSinGrupo(sucursalId: number, filtro: string, offset: number, top: number): Promise < any > {
		let requestBody = {
			filtro,
			offset,
			top
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/listados/alumnos-sin-grupo/${sucursalId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onAlumnosSinGrupoChanged.next(response.data);
					} else {
						this.onAlumnosSinGrupoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onAlumnosSinGrupoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getDatosAlumnoSinGrupo(inscripcionSinGrupoId: number, tipoGrupoId?: number): Promise < any > {
		if(!tipoGrupoId){
			return new Promise((resolve, reject) => {
				this.cargando = true;
				this._httpClient.get(`${this.urlApi}/datos/alumnos-sin-grupo/${this.hashid.encode(inscripcionSinGrupoId)}`,true)
					.subscribe((response: any) => {
						this.cargando = false;
						if (response.status == 200) {
							this.onDatosTiposGrupoAlumnoSinGrupoChanged.next(response.data);
						} else {
							this.onDatosTiposGrupoAlumnoSinGrupoChanged.next(null);
							this.snackBar.open(response.message, 'OK', {
								duration: 5000,
							});
						}
						resolve(response);
					}, err => {
						this.cargando = false;
						this.onDatosTiposGrupoAlumnoSinGrupoChanged.next(null);
						this.snackBar.open(this.getError(err), 'OK', {
							duration: 5000,
						});
						resolve(new JsonResponse(500, this.getError(err), null, null));
					});
			});
		}else{
			return new Promise((resolve, reject) => {
				this.cargando = true;
				this._httpClient.get(`${this.urlApi}/datos/alumnos-sin-grupo/${this.hashid.encode(inscripcionSinGrupoId)}/${this.hashid.encode(tipoGrupoId)}`,true)
					.subscribe((response: any) => {
						this.cargando = false;
						if (response.status == 200) {
							this.onDatosGruposAlumnoSinGrupoChanged.next(response.data);
						} else {
							this.onDatosGruposAlumnoSinGrupoChanged.next(null);
							this.snackBar.open(response.message, 'OK', {
								duration: 5000,
							});
						}
						resolve(response);
					}, err => {
						this.cargando = false;
						this.onDatosGruposAlumnoSinGrupoChanged.next(null);
						this.snackBar.open(this.getError(err), 'OK', {
							duration: 5000,
						});
						resolve(new JsonResponse(500, this.getError(err), null, null));
					});
			});
		}
	}

	relacionarAlumnoSinGrupo(
		inscripcionSinGrupoId: number,
		grupoId: number
	): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;

			let requestBody = {
				inscripcionSinGrupoId: String(inscripcionSinGrupoId),
				grupoId: String(grupoId)
			};
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/relacionar/alumno-sin-grupo`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onRelacionarAlumnoSinGrupoChanged.next(response.data);
					} else {
						this.onRelacionarAlumnoSinGrupoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onRelacionarAlumnoSinGrupoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getAlumnosEntregaLibros(filtro: string, offset: number, top: number): Promise < any > {
		let requestBody = {
			filtro,
			offset,
			top
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/listados/alumnos-entrega-libros/${this.getSucursalPuntoVentaId()}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onAlumnosEntregaLibrosChanged.next(response.data);
					} else {
						this.onAlumnosEntregaLibrosChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onAlumnosEntregaLibrosChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	entregarLibros(alumnos: AlumnoEntregarLibrosProjection[], localidadId: number): Promise < any > {
		let body = {
			alumnos,
			localidadId
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(body),`${this.urlApi}/alumnos-entrega-libros/entregar`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onEntregarLibrosChanged.next(true);
					} else {
						this.onEntregarLibrosChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onEntregarLibrosChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getAlumnosJOBS(filtro: string, offset: number, top: number): Promise < any > {
		let requestBody = {
			filtro,
			offset,
			top
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/listados/alumnos-inscripciones-pendientes-jobs/${this.getSucursalPuntoVentaId()}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onAlumnosJOBSChanged.next(response.data);
					} else {
						this.onAlumnosJOBSChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onAlumnosJOBSChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	agregarAlumnosJOBS(alumnos: AlumnoInscripcionesPendientesJOBSProjection[]): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(alumnos),`${this.urlApi}/alumnos-inscripciones-pendientes-jobs/agregar`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onAgregarAlumnosJOBSChanged.next(response.data);
					} else {
						this.onAgregarAlumnosJOBSChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onAgregarAlumnosJOBSChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getAlumnosJOBSSEMS(filtro: string, offset: number, top: number): Promise < any > {
		let requestBody = {
			filtro,
			offset,
			top
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/listados/alumnos-inscripciones-pendientes-jobs-sems/${this.getSucursalPuntoVentaId()}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onAlumnosJOBSSEMSChanged.next(response.data);
					} else {
						this.onAlumnosJOBSSEMSChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onAlumnosJOBSSEMSChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	agregarAlumnosJOBSSEMS(alumnos: AlumnoInscripcionesPendientesJOBSSEMSProjection[]): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(alumnos),`${this.urlApi}/alumnos-inscripciones-pendientes-jobs-sems/agregar`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onAgregarAlumnosJOBSSEMSChanged.next(response.data);
					} else {
						this.onAgregarAlumnosJOBSSEMSChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onAgregarAlumnosJOBSSEMSChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getBecasSindicato(filtro: string, offset: number, top: number): Promise < any > {
		let requestBody = {
			filtro,
			offset,
			top
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/listados/becas/sindicato`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onBecasSindicatoChanged.next(response.data);
					} else {
						this.onBecasSindicatoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onBecasSindicatoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getBecasProulex(filtro: string, offset: number, top: number): Promise < any > {
		let requestBody = {
			filtro,
			offset,
			top
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/listados/becas/proulex`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onBecasProulexChanged.next(response.data);
					} else {
						this.onBecasProulexChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onBecasProulexChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getDatosBecaSindicato(alumnoId: number, becaUDGId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/datos/alumno-beca-sindicato/${this.getSucursalPuntoVentaId()}/${alumnoId}/${becaUDGId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onDatosBecaSindicatoChanged.next(response.data);
					} else {
						this.onDatosBecaSindicatoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onDatosBecaSindicatoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getDatosBecaProulex(alumnoId: number, becaUDGId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/datos/alumno-beca-proulex/${this.getSucursalPuntoVentaId()}/${alumnoId}/${becaUDGId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onDatosBecaProulexChanged.next(response.data);
					} else {
						this.onDatosBecaProulexChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onDatosBecaProulexChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	aplicarBecaSindicato(
		alumnoId: number,
        becaId: number,
        grupoId: number,
        tipoGrupoId: number,
        listaPreciosId: number,
        localidadId: number,
        idTmp: number
	): Promise < any > {
		let requestBody = {
			alumnoId,
			becaId,
			grupoId,
			tipoGrupoId,
			listaPreciosId,
			localidadId,
			idTmp,
			sucursalId: this.getSucursalPuntoVentaId()
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/becas-sindicato/aplicar`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onAplicarBecaSindicatoChanged.next(response.data);
					} else {
						this.onAplicarBecaSindicatoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onAplicarBecaSindicatoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getBecaAlumno(alumnoId: number, grupoId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/becas-sindicato/alumno/${alumnoId}/${grupoId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onBecaAlumnoChanged.next(response.data);
					} else {
						this.onBecaAlumnoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onBecaAlumnoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	aplicarCierreTurno(): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(null,`${this.urlApi}/turno/cerrar`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200 || response.status == 1202) {
						this.cerrarTurno();
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

	cerrarTurno(){
		this.cargando = true;
		this.setSucursalPuntoVentaId(null);
		this.setPlantelPuntoVentaId(null);
		this.router.navigate([this.urlPuntoVentaInicio]);
	}

	imprimirNotaVenta(ordenesVentaIds: number[]): Promise<any> {
		let body = {
			ordenesVentaIdsStr: ordenesVentaIds.join(','),
			sucursalId: this.getSucursalPuntoVentaId()
		};
		this.cargando = true;
        return new Promise((resolve, reject) => {
            this._httpClient.post_get_file(body, `${this.urlApi}/imprimir/nota-venta`, true)
                .subscribe((response: any) => {

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

	getHistorial(fecha: Moment, filtro: string, offset: number, top: number): Promise < any > {
		let requestBody = {
			fecha: fecha.format('YYYY-MM-DD'),
			filtro,
			offset,
			top
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/listados/historial`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onHistorialChanged.next(response.data);
					} else {
						this.onHistorialChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onHistorialChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getHistorialResumen(ordenVentaId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/datos/historial/${ordenVentaId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onHistorialResumenChanged.next(response.data);
					} else {
						this.onHistorialResumenChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onHistorialResumenChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	validarDescuentoUsuario(montoDescuento: number, correo: string, contrasenia: string): Promise < any > {
		let requestBody = {
			montoDescuento: String(montoDescuento),
			correo,
			contrasenia
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/descuentos/validar/usuario`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onDescuentoUsuarioChanged.next(response.data);
					} else {
						this.onDescuentoUsuarioChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onDescuentoUsuarioChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getMontosCalculados(cantidad: number, precioUnitario: number, descuento: number, iva: number, ieps: number, cuotaFija: number, decimales: number = 6){
		return this._impuestosArticuloService.getMontos(cantidad, precioUnitario, descuento, iva, ieps, cuotaFija, decimales);
	}

	getAlumnosPCP(filtro: string, offset: number, top: number): Promise < any > {
		let requestBody = {
			filtro,
			offset,
			top
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/listados/pcp/alumnos/${this.getSucursalPuntoVentaId()}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onAlumnosPCPChanged.next(response.data);
					} else {
						this.onAlumnosPCPChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onAlumnosPCPChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	agregarAlumnosPCP(alumnos: AlumnoInscripcionPendientePCPProjection[]): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(alumnos),`${this.urlApi}/alumnos-inscripciones-pendientes-pcp/agregar`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onAgregarAlumnosPCPChanged.next(response.data);
					} else {
						this.onAgregarAlumnosPCPChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onAgregarAlumnosPCPChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	agregarAlumnoAprobadoReinscripciones(alumno: {id: number,grupoId?: number,localidadId?: number,idTmp: number, becaId?: number, cambioGrupo: boolean, nuevoGrupoId?: number, nuevaModalidadId?: number, nuevoHorarioId?: number, nuevoNivel?: number, comentario?: string, listaPreciosId: number}): Promise < any > {
		let body = {
			alumno
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(body),`${this.urlApi}/alumnos-reinscripciones/agregar/aprobado`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onAgregarAlumnosJOBSChanged.next(response.data);
					} else {
						this.onAgregarAlumnosJOBSChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onAgregarAlumnosJOBSChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	agregarAlumnoReprobadoReinscripcionesConGrupo(
		alumnoId: number,
		grupoId: number,
		articuloId: number,
		localidadId: number,
		listaPreciosId: number,
		comentarioReinscripcion: string,
		idTmp: number
	): Promise < any > {
		return this.agregarAlumnoReprobadoReinscripciones(
			alumnoId,
			grupoId,
			null,
			null,
			null,
			null,
			null,
			null,
			articuloId,
			localidadId,
			listaPreciosId,
			comentarioReinscripcion,
			idTmp
		);
	}

	agregarAlumnoReprobadoReinscripcionesSinGrupo(
		alumnoId: number,
		programaId: number,
        idiomaId: number,
        nivel: number,
        modalidadId: number,
        tipoGrupoId: number,
        horarioId: number,
		articuloId: number,
		localidadId: number,
		listaPreciosId: number,
		comentarioReinscripcion: string,
		idTmp: number
	): Promise < any > {
		return this.agregarAlumnoReprobadoReinscripciones(
			alumnoId,
			null,
			programaId,
			idiomaId,
			nivel,
			modalidadId,
			tipoGrupoId,
			horarioId,
			articuloId,
			localidadId,
			listaPreciosId,
			comentarioReinscripcion,
			idTmp
		);
	}

	private agregarAlumnoReprobadoReinscripciones(
		alumnoId: number,
		grupoId: number,
		programaId: number,
        idiomaId: number,
        nivel: number,
        modalidadId: number,
        tipoGrupoId: number,
        horarioId: number,
		articuloId: number,
		localidadId: number,
		listaPreciosId: number,
		comentarioReinscripcion: string,
		idTmp: number
	): Promise < any > {
		let body = {
			alumnoId,
			grupoId,
			programaId,
			idiomaId,
			nivel,
			modalidadId,
			tipoGrupoId,
			horarioId,
			articuloId,
			sucursalId: this.getSucursalPuntoVentaId(),
			localidadId,
			listaPreciosId,
			comentarioReinscripcion,
			idTmp
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(body),`${this.urlApi}/alumnos-reinscripciones/agregar/reprobado`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onAgregarAlumnosJOBSChanged.next(response.data);
					} else {
						this.onAgregarAlumnosJOBSChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onAgregarAlumnosJOBSChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getGruposAlumnoReinscripcion(idiomaId: number, programaId: number, modalidadId: number, horarioId: number, nivel: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/listados/reinscripciones/grupos/${this.getSucursalPuntoVentaId()}/${idiomaId}/${programaId}/${modalidadId}/${horarioId}/${nivel}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onGruposReinscripcionReprobadoChanged.next(response.data);
					} else {
						this.onGruposReinscripcionReprobadoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onGruposReinscripcionReprobadoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getClientesInCompany(): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/listados/in-company/clientes/${this.getSucursalPuntoVentaId()}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onClientesInCompanyChanged.next(response.data);
					} else {
						this.onClientesInCompanyChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onClientesInCompanyChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getGruposInCompany(clietneId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/listados/in-company/grupos/${this.getSucursalPuntoVentaId()}/${clietneId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onGruposInCompanyChanged.next(response.data);
					} else {
						this.onGruposInCompanyChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onGruposInCompanyChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	inscripcionInCompany(
		alumnoId: number,
		grupoId: number,
        localidadId: number,
        idTmp: number
	): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;

			let requestBody = {
				alumnoId: String(alumnoId),
				grupoId: String(grupoId),
				localidadId: String(localidadId),
				idTmp: String(idTmp)
			};
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/in-company/crear/detalle-ov`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onOVDChanged.next(response.data);
					} else {
						this.onOVDChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onOVDChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getValesCertificacion(filtro: string, offset: number, top: number): Promise < any > {
		let requestBody = {
			filtro,
			offset,
			top
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/listados/vales/certificacion`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onValesCertificacionesChanged.next(response.data);
					} else {
						this.onValesCertificacionesChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onValesCertificacionesChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	aplicarValeCertificacion(
		programaIdiomaCertificacionValeId: number,
        listaPreciosId: number,
        localidadId: number,
        idTmp: number
	): Promise < any > {
		let requestBody = {
			programaIdiomaCertificacionValeId,
			listaPreciosId,
			localidadId,
			idTmp,
			sucursalId: this.getSucursalPuntoVentaId()
		};
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/vales/certificacion/aplicar`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onAplicarValeCertificacionChanged.next(response.data);
					} else {
						this.onAplicarValeCertificacionChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onAplicarValeCertificacionChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getValeCertificacionAlumno(alumnoId: number, certificacionId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/vales/certificacion/alumno/${alumnoId}/${certificacionId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onValeCertificacionAlumnoChanged.next(response.data);
					} else {
						this.onValeCertificacionAlumnoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onValeCertificacionAlumnoChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}
    
	getDiplomadosAcademy(): Promise <any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/listados/academy/diplomados/${this.getSucursalPuntoVentaId()}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onDiplomadosAcademyChanged.next(response.data);
					} else {
						this.onDiplomadosAcademyChanged.next(null);
						this.snackBar.open(response.message, 'OK', { duration: 5000 });
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onDiplomadosAcademyChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', { duration: 5000 });
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getModalidadesAcademy(programaId: number, idiomaId: number): Promise <any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/listados/academy/modalidades/${programaId}/${idiomaId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onModalidadesAcademyChanged.next(response.data?.paModalidades);
					} else {
						this.onModalidadesAcademyChanged.next(null);
						this.snackBar.open(response.message, 'OK', { duration: 5000 });
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onModalidadesAcademyChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', { duration: 5000 });
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getTiposWorkshop(modalidadId: number): Promise <any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/listados/academy/tipos-workshop/${modalidadId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onTiposWorkshopChanged.next(response.data?.tipos);
					} else {
						this.onTiposWorkshopChanged.next(null);
						this.snackBar.open(response.message, 'OK', { duration: 5000 });
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onTiposWorkshopChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', { duration: 5000 });
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	getWorkshops(modalidadId: number, tipoWorkshopId: number): Promise <any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`${this.urlApi}/listados/academy/workshops/${this.getSucursalPuntoVentaId()}/${modalidadId}/${tipoWorkshopId}`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onWorkshopsChanged.next(response.data?.gruposCabeceras);
					} else {
						this.onWorkshopsChanged.next(null);
						this.snackBar.open(response.message, 'OK', { duration: 5000 });
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onWorkshopsChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', { duration: 5000 });
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});
	}

	inscripcionAcademy(
		alumnoId: number,
		grupoId: number,
        localidadId: number,
        idTmp: number
	): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;

			let requestBody = {
				alumnoId: String(alumnoId),
				grupoId: String(grupoId),
				localidadId: String(localidadId),
				idTmp: String(idTmp)
			};
			this._httpClient.post(JSON.stringify(requestBody),`${this.urlApi}/academy/crear/detalle-ov`,true)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onOVDChanged.next(response.data);
					} else {
						this.onOVDChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onOVDChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}
}