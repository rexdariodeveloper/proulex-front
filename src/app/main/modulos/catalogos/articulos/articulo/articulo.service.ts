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

@Injectable()
export class ArticuloService extends FichaDataService implements Resolve<any>{
	
	onComboCategoriasChanged: BehaviorSubject <ArticuloCategoriaComboProjection[]> ;
	onComboSubcategoriasChanged: BehaviorSubject <ArticuloSubcategoriaComboProjection[]> ;
	onComboSubtiposChanged: BehaviorSubject <ArticuloSubtipoComboProjection[]> ;
	
	constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
		private articuloCategoriaService: ArticuloCategoriaService,
		private articuloSubcategoriaService: ArticuloSubcategoriaService,
		private articuloSubtipoService: ArticuloSubtipoService
    ) {
		super(_httpClient, snackBar, hashid);
		this.onComboCategoriasChanged = new BehaviorSubject(null);
		this.onComboSubcategoriasChanged = new BehaviorSubject(null);
		this.onComboSubtiposChanged = new BehaviorSubject(null);
	}
	
	/**
	 * Get combo categorías
	 *
	 * @returns {Promise<any>}
	 */
	getComboCategorias(familiaId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.articuloCategoriaService.getCombo(familiaId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onComboCategoriasChanged.next(response.data);
					} else {
						this.onComboCategoriasChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onComboCategoriasChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}
	
	/**
	 * Get combo subcategorías
	 *
	 * @returns {Promise<any>}
	 */
	getComboSubcategorias(categoriaId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.articuloSubcategoriaService.getCombo(categoriaId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onComboSubcategoriasChanged.next(response.data);
					} else {
						this.onComboSubcategoriasChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onComboSubcategoriasChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}

	/**
	 * Get combo subtipos
	 *
	 * @returns {Promise<any>}
	 */
	getComboSubtipos(articuloTipoId: number): Promise < any > {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this.articuloSubtipoService.getCombo(articuloTipoId)
				.subscribe((response: any) => {
					this.cargando = false;
					if (response.status == 200) {
						this.onComboSubtiposChanged.next(response.data);
					} else {
						this.onComboSubtiposChanged.next(null);
						this.snackBar.open(response.message, 'OK', {
							duration: 5000,
						});
					}
					resolve(response);
				}, err => {
					this.cargando = false;
					this.onComboSubtiposChanged.next(null);
					this.snackBar.open(this.getError(err), 'OK', {
						duration: 5000,
					});
					resolve(new JsonResponse(500, this.getError(err), null, null));
				});
		});

	}
    
}
