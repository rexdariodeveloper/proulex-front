import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Resolve } from '@angular/router';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { EstadoService } from '@app/main/services/estado.service';
import { JsonResponse } from '@models/json-response';
import { HttpService } from '@pixvs/services/http.service';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject } from 'rxjs';
import { CursosService } from '@app/main/services/cursos-service';
import { ProgramaService } from '@app/main/services/programa.service';

@Injectable()
export class TabuladorService extends FichaDataService implements Resolve<any>{

	onComboEstadosChanged: BehaviorSubject<EstadoComboProjection[]> = new BehaviorSubject(null);
	onComboModalidadChanged: BehaviorSubject<any[]> = new BehaviorSubject(null);
	onComboCursoChanged: BehaviorSubject<any[]> = new BehaviorSubject(null);

	constructor(
		_httpClient: HttpService,
		snackBar: MatSnackBar,
		hashid: HashidsService,
		private estadoService: EstadoService,
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
}