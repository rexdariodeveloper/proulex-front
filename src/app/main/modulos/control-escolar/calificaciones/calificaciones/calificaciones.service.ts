import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { JsonResponse } from '@models/json-response';

@Injectable()
export class CalificacionesService extends FichaDataService implements Resolve<any>{

	constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
        hashid: HashidsService
    ) {
        super(_httpClient, snackBar, hashid);
    }
	
	getListados(grupo: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cargando = true;
            this._httpClient.get(this.url+grupo, true)
                .subscribe((response: any) => {
                    this.cargando = false;
                    if (response.status == 200) {
                        this.datos = response.data;
                    } else {
                        this.datos = [];
                        this.snackBar.open(response.message, 'OK', {
                            duration: 5000,
                        });
                    }
                    this.onDatosChanged.next(this.datos);
                    resolve(response);
                }, err => {
                    this.datos = [];
                    this.cargando = false;
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    this.onDatosChanged.next(this.datos);
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    cerrar(grupoId: number) {
        return new Promise((resolve, reject) => {
            this.cargando = true;
            this._httpClient.get('/api/v1/grupos/cerrar/'+grupoId, true)
                .subscribe((response: any) => {
                    this.cargando = false;
                    if (response.status == 200) {
                        this.snackBar.open('El curso se ha finalizado!', 'OK', {
                            duration: 5000,
                        });
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
}