import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject } from 'rxjs';
import { ProgramasGruposService } from '@app/main/services/grupos.services';
import { JsonResponse } from '@models/json-response';
import { FichasDataService } from '@services/fichas-data.service';

@Injectable()
export class CalificacionesService extends FichasDataService implements Resolve<any>
{
	private urlApi = '/api/v1/captura_calificaciones';
	private rutaBuscadorLocalStorage: string = 'ficha-listado-buscador';
    private buscadorMap: {[ruta:string]: string} = {};

	onFechaChange: BehaviorSubject<any> = new BehaviorSubject(null);

	constructor(
		_httpClient: HttpService,
		public _gruposService: ProgramasGruposService,
		snackBar: MatSnackBar,
		hashid: HashidsService
	) {
		super(_httpClient, snackBar, hashid);
		this.onFechaChange = new BehaviorSubject(null);
		let buscadorMap = localStorage.getItem(this.rutaBuscadorLocalStorage);
        if(!!buscadorMap)
            this.buscadorMap = JSON.parse(buscadorMap);
	}

	getFechas(filtros: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(filtros, `${this.urlApi}/getFechas`, true).subscribe((response: any) => {
				this.cargando = false;
				if (response.status == 200)
					this.onFechaChange.next(response.data);
				else {
					this.onFechaChange.next(null);
					this.snackBar.open(response.message, 'OK', { duration: 5000, });
				}
				resolve(response);
			}, err => {
				this.cargando = false;
				this.onFechaChange.next(null);
				this.snackBar.open(this.getError(err), 'OK', { duration: 5000, });
				resolve(new JsonResponse(500, this.getError(err), null, null));
			});
		});
	}

	getTextoBuscador(ruta: string){
        return this.buscadorMap[ruta] || '';
    }

    setTextoBuscador(ruta: string, textoBuscador: string){
        this.buscadorMap[ruta] = textoBuscador;
        localStorage.setItem(this.rutaBuscadorLocalStorage,JSON.stringify(this.buscadorMap));
    }
}