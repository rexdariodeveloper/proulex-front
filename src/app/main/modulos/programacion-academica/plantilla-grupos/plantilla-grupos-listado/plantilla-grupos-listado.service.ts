import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Resolve } from '@angular/router';
import { PAModalidadComboSimpleProjection } from '@app/main/modelos/pamodalidad';
import { ProgramaIdiomaComboProjection } from '@app/main/modelos/programa-idioma';
import { SucursalPlantelComboProjection } from '@app/main/modelos/sucursal-plantel';
import { JsonResponse } from '@models/json-response';
import { FichasDataService } from '@services/fichas-data.service';
import { HashidsService } from '@services/hashids.service';
import { HttpService } from '@services/http.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PlantillaGruposListadoService extends FichasDataService implements Resolve<any> {

	private urlApi: string = '/api/v1/plantilla-grupos';

	onListaPlantelChanged: BehaviorSubject<SucursalPlantelComboProjection[]> = new BehaviorSubject(null);
	onListaCursoChanged: BehaviorSubject<ProgramaIdiomaComboProjection[]> = new BehaviorSubject(null);
	onListaModalidadChanged: BehaviorSubject<PAModalidadComboSimpleProjection[]> = new BehaviorSubject(null);
	onFechasChanged: BehaviorSubject<string[]> = new BehaviorSubject(null);

	constructor(
		_httpClient: HttpService,
		_snackBar: MatSnackBar,
		_hashid: HashidsService,
	) { 
		super(_httpClient, _snackBar, _hashid);
	}

	getListaPlantel(sedeId: number): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(sedeId, this.urlApi + '/getListaPlantel', true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onListaPlantelChanged.next(response.data.listaPlantel);
				else {
					this.onListaPlantelChanged.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onListaPlantelChanged.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}

	getListaCurso(sedeId: number): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get('/api/v1/cursos/getSucursales/' + sedeId, true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onListaCursoChanged.next(response.data);
				else {
					this.onListaCursoChanged.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onListaCursoChanged.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}

  	getListaModalidad(filtros: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(filtros, this.urlApi + '/getListaModalidad', true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onListaModalidadChanged.next(response.data.listaModalidad);
				else {
					this.onListaModalidadChanged.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onListaModalidadChanged.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}

  	getListaFecha(filtros: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(filtros, this.urlApi + '/getListaFecha', true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onFechasChanged.next(response.data.listaFecha);
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
	
	getExcelConFiltros(url: string, filtros: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post_get_file(filtros, url, true).subscribe((response: any) => {
				this.cargando = false;
				if(response.body.type === 'application/json'){
					const fr = new FileReader();
					fr.onload = (e) => {
						this.snackBar.open((e.target.result as string), 'OK', {
						duration: 5000,
						});
					}
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

	getExcel(url: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.get_file(url, true).subscribe((response: any) => {
				this.cargando = false;
				if(response.body.type === 'application/json'){
					const fr = new FileReader();
					fr.onload = (e) => {
						this.snackBar.open((e.target.result as string), 'OK', {
						duration: 5000,
						});
					}
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
}
