import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { ArticuloCategoriaService } from '@app/main/services/articulo-categoria.service';
import { ArticuloCategoriaComboProjection } from '@app/main/modelos/articulo-categoria';
import { JsonResponse } from '@models/json-response';
import { ArticuloSubcategoriaService } from '@app/main/services/articulo-subcategoria.service';
import { ArticuloSubcategoriaComboProjection } from '@app/main/modelos/articulo-subcategoria';
import { ArticuloSubtipoService } from '@app/main/services/articulo-subtipo.service';
import { ArticuloSubtipoComboProjection } from '@app/main/modelos/articulo-subtipo';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { EstadoService } from '@app/main/services/estado.service';
import { LocalidadComboProjection } from '@app/main/modelos/localidad';
import { LocalidadService } from '@app/main/services/localidad.service';

@Injectable()
export class SucursalService extends FichaDataService implements Resolve<any>{
	
	onComboEstadosChanged: BehaviorSubject <EstadoComboProjection[]> ;
	onComboLocalidadesChanged: BehaviorSubject <LocalidadComboProjection[]> ;
	
	constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private estadoService: EstadoService,
		private localidadesService: LocalidadService
    ) {
		super(_httpClient, snackBar, hashid);
		this.onComboEstadosChanged = new BehaviorSubject(null);
		this.onComboLocalidadesChanged = new BehaviorSubject(null);
	}
	
	/**
	 * Get combo estados
	 *
	 * @returns {Promise<any>}
	 */
	getComboEstados(paisId: number): Promise < any > {
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

	getComboLocalidades(almacenId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.localidadesService.getLocalidadesByAlmacen(almacenId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onComboLocalidadesChanged.next(response.data);
					} else {
						this.onComboLocalidadesChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onComboLocalidadesChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}
    
}
