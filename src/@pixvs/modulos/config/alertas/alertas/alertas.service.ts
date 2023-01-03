import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { BehaviorSubject } from 'rxjs';
import { JsonResponse } from '@models/json-response';

@Injectable()
export class AlertasService extends FichaDataService implements Resolve<any>
{
    onEtapasChanged: BehaviorSubject<any>;
    onEtapaChanged: BehaviorSubject<any>;

    constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
        hashid: HashidsService
    ) {
        super(_httpClient, snackBar, hashid);

        this.onEtapasChanged = new BehaviorSubject(null);
        this.onEtapaChanged  = new BehaviorSubject(null);
    }

    getEtapas(configId, sucursalId): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cargando = true;
            this._httpClient.get(`/v1/alerta/etapas/${configId}` + (sucursalId ? `/${sucursalId}` : ''),true)
                .subscribe((response: any) => {
                    this.cargando = false;
                    if (response.status == 200)
                        this.onEtapasChanged.next(response.data);
                    else {
                        this.onEtapasChanged.next(null);
                        this.snackBar.open(response.message, 'OK', { duration: 5000 });
                    }
                    resolve(response);
                }, err => {
                    this.cargando = false;
                    this.onEtapasChanged.next(null);
                    this.snackBar.open(this.getError(err), 'OK', { duration: 5000 });
                    resolve(new  JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    getEtapa(etapaId): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cargando = true;
            this._httpClient.get(`/v1/alerta/etapa/${etapaId}`,true)
                .subscribe((response: any) => {
                    this.cargando = false;
                    if (response.status == 200)
                        this.onEtapaChanged.next(response.data);
                    else {
                        this.onEtapaChanged.next(null);
                        this.snackBar.open(response.message, 'OK', { duration: 5000 });
                    }
                    resolve(response);
                }, err => {
                    this.cargando = false;
                    this.onEtapaChanged.next(null);
                    this.snackBar.open(this.getError(err), 'OK', { duration: 5000 });
                    resolve(new  JsonResponse(500, this.getError(err), null, null));
                });
        });
    }
    
}