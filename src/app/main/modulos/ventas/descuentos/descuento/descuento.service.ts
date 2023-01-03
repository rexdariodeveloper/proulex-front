import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Resolve } from '@angular/router';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { EstadoService } from '@app/main/services/estado.service';
import { JsonResponse } from '@models/json-response';
import { HttpService } from '@pixvs/services/http.service';
import { CursosService } from '@app/main/services/cursos-service';
import { ProgramaService } from '@app/main/services/programa.service';
import { ArticuloCategoriaService } from '@app/main/services/articulo-categoria.service';
import { ArticuloService } from '@app/main/services/articulo.service';

import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DescuentoService extends FichaDataService implements Resolve<any>{

	onComboEstadosChanged: BehaviorSubject<EstadoComboProjection[]> = new BehaviorSubject(null);
	onComboModalidadChanged: BehaviorSubject<any[]> = new BehaviorSubject(null);
	onComboCursoChanged: BehaviorSubject<any[]> = new BehaviorSubject(null);
	onComboCategoriaChanged: BehaviorSubject<any[]> = new BehaviorSubject(null);
	onComboArticuloChanged: BehaviorSubject<any[]> = new BehaviorSubject(null);
	onComboSucursalChanged: BehaviorSubject<SucursalComboProjection[]> = new BehaviorSubject(null);

	constructor(
		_httpClient: HttpService,
		snackBar: MatSnackBar,
		hashid: HashidsService,
		private estadoService: EstadoService,
		private articuloCategoriaService: ArticuloCategoriaService,
		private articuloService: ArticuloService,
		public _cursosService: CursosService,
		public _programaService: ProgramaService,
	) {
		super(_httpClient, snackBar, hashid);
	}

	/**
	 * Get combo estados
	 *
	 * @returns {Promise<any>}
	 */

	getComboCursos(programaId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._programaService.getCursos(programaId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onComboCursoChanged.next(response.data);
					} else {
						this.onComboCursoChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onComboCursoChanged.next(null);
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

	getComboCategorias(familiaId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.articuloCategoriaService.getCombo(familiaId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onComboCategoriaChanged.next(response.data);
					} else {
						this.onComboCategoriaChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onComboCategoriaChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getArticulosByCategoria(categoriaId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.articuloService.getByCategoria(categoriaId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onComboArticuloChanged.next(response.data);
					} else {
						this.onComboArticuloChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onComboArticuloChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	getSucursalesByUsuario(idUsuario: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get(`/api/v1/sucursales/usuario/${idUsuario}`,true)
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
}