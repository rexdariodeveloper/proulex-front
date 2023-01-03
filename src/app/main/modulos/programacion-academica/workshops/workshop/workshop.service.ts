import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject } from 'rxjs';
import { JsonResponse } from '@models/json-response';

@Injectable()
export class WorkshopService extends FichaDataService implements Resolve<any>{
    cursos: any;
    onCursosChanged: BehaviorSubject<any>;

    constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
		hashid: HashidsService,
    ) {
        super(_httpClient, snackBar, hashid);
        this.onCursosChanged = new BehaviorSubject(null);
	}

    getGruposAfectados(filtros: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cargando = true;
            this._httpClient.post(filtros,'/api/v1/cursos/grupos-afectados', true)
                .subscribe((response: any) => {
                    this.cargando = false;  
                    if(response.status == 200)
                        this.cursos = response.data;
                    else
                        this.cursos = null;
                    this.snackBar.open(response.message,'OK', { duration: 5000 });
                    this.onCursosChanged.next(this.cursos);
                }, err => {
                    this.cargando = false;
                    this.cursos = null;
                    this.onCursosChanged.next(null);
                    this.snackBar.open(this.getError(err), 'OK', { duration: 5000 });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }
	
	afectarGrupos(data: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.cargando = true;
			this._httpClient.post(data,'/api/v1/cursos/afectar-grupos',true)
                .subscribe((response: any) => {
                    this.cargando = false;
                    if (response.status == 200) {
						console.log(response.data);
                    }
                    this.snackBar.open(response.message, 'OK', { duration: 5000 });
                    resolve(response);
                }, err => {
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', { duration: 5000 });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
		});
	}
    
}