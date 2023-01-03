import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Resolve } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { JsonResponse } from '@models/json-response';
import { BehaviorSubject } from 'rxjs';
import { ArticuloArbolComponentesProjection } from '@app/main/modelos/articulo';

@Injectable()
export class SurtirPedidoService extends FichaDataService implements Resolve<any> {

    onArticulosChanged: BehaviorSubject<any>;
    onStatusChanged: BehaviorSubject<any>;
	onArticuloArbolComponentesChanged: BehaviorSubject<ArticuloArbolComponentesProjection>;
    
    constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
        hashid: HashidsService,
    ) {
        super(_httpClient, snackBar, hashid);
        this.onArticulosChanged = new BehaviorSubject({});
        this.onStatusChanged = new BehaviorSubject({});
        this.onArticuloArbolComponentesChanged = new BehaviorSubject(null);
    }

    getArticulos(url,localidadId): Promise<any> {
        let datos = []
        return new Promise((resolve, reject) => {
            this._httpClient.get(url + localidadId, true)
                .subscribe((response: any) => {
                    if (response.status == 200) {
                        datos = response.data;
                    } else {
                        datos = [];
                        this.snackBar.open(response.message, 'OK', {
                            duration: 5000,
                        });
                    }
                    this.onArticulosChanged.next(datos);
                    resolve(response);
                }, err => {
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    this.onArticulosChanged.next(datos);
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

    updateStatus(url,pedidoId): Promise<any> {
        let datos;
        return new Promise((resolve, reject) => {
            this._httpClient.post({id: pedidoId},url, true)
                .subscribe((response: any) => {
                    if (response.status == 200) {
                        datos = {'datos': true};
                    } else {
                        datos = {};
                        this.snackBar.open(response.message, 'OK', {
                            duration: 5000,
                        });
                    }
                    this.onStatusChanged.next(datos);
                    resolve(response);
                }, err => {
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }

	getArticuloArbolComponentes(articuloId: number): Promise<any> {
        let datos = []
        return new Promise((resolve, reject) => {
            this._httpClient.get('/api/v1/articulos/arbol/componentes/' + articuloId, true)
                .subscribe((response: any) => {
                    if (response.status == 200) {
						this.onArticuloArbolComponentesChanged.next(response.data);
                    } else {
						this.onArticuloArbolComponentesChanged.next(null);
                        this.snackBar.open(response.message, 'OK', {
                            duration: 5000,
                        });
                    }
                    resolve(response);
                }, err => {
                    this.snackBar.open(this.getError(err), 'OK', {
                        duration: 5000,
                    });
                    this.onArticuloArbolComponentesChanged.next(null);
                    resolve(new JsonResponse(500, this.getError(err), null, null));
                });
        });
    }
}