import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { PAModalidadComboProjection } from '@app/main/modelos/pamodalidad';
import { BecaSolicitudEditarProjection } from '@app/main/modelos/beca-solicitud';
import { EstadoService } from '@app/main/services/estado.service';
import { JsonResponse } from '@models/json-response';
import { CursosService } from '@app/main/services/cursos-service';
import { BecaSolicitudService } from '@app/main/services/beca-solicitud';
import { HttpService } from '@pixvs/services/http.service';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject } from 'rxjs';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';


@Injectable()
export class BecaService extends FichaDataService implements Resolve<any>{

	onComboEstadosChanged: BehaviorSubject<EstadoComboProjection[]> = new BehaviorSubject(null);
	onComboModalidadChanged: BehaviorSubject <PAModalidadComboProjection[]> = new BehaviorSubject(null);
	onBecaSolicitudChanged: BehaviorSubject <BecaSolicitudEditarProjection> = new BehaviorSubject(null);
	onDatosAlumnoChanged: BehaviorSubject <any> = new BehaviorSubject(null);

	constructor(
		_httpClient: HttpService,
		snackBar: MatSnackBar,
		hashid: HashidsService,
		private estadoService: EstadoService,
		public _cursosService: CursosService,
		public _becaSolicitudService: BecaSolicitudService,
		private router: Router,
		private _fuseSidebarService: FuseSidebarService
	) {
		super(_httpClient, snackBar, hashid);
	}

	/**
	 * Get combo estados
	 *
	 * @returns {Promise<any>}
	 */
	getComboEstados(paisId: number): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.estadoService.getCombo(paisId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onComboEstadosChanged.next(response.data);
					} else {
						this.onComboEstadosChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onComboEstadosChanged.next(null);
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

	getSolicitudById(id: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._becaSolicitudService.getSolicitudById(id)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onBecaSolicitudChanged.next(response.data);
					} else {
						this.onBecaSolicitudChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onBecaSolicitudChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	aprobarPersonalizado(solicitudId: number, becasAprobarIdsMap: any, fechaModificacion: any): Promise < any >{
		return new Promise((resolve, reject) => {
			this.cargando = true;
			let body = {
				solicitudId,
				becasAprobarIdsMap,
				fechaModificacion
			};
			this._httpClient.post(JSON.stringify(body),`/api/v1/becas-solicitudes/alerta/aprobar`,true)
				.subscribe((response: any) => {
					if (response.status == 200) {
						this._fuseSidebarService.getAutorizaciones();
						this.router.navigate(['/app/compras/listado-alertas']);
					} else {
						this.cargando = false;
						this.snackBar.open(this.getError(response), 'OK', {
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

	getDatosAlumno(alumnoId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`/api/v1/becas-solicitudes/alumno/${alumnoId}`,true)
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
}