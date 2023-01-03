import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Resolve } from '@angular/router';
import { HttpService } from '@pixvs/services/http.service';
import { FichaDataService } from '@services/ficha-data.service';
import { HashidsService } from '@services/hashids.service';
import { JsonResponse } from '@models/json-response';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PedidoService extends FichaDataService implements Resolve<any> {
    
    constructor(
        _httpClient: HttpService,
        snackBar: MatSnackBar,
        hashid: HashidsService,
    ) {
        super(_httpClient, snackBar, hashid);
    }

    setDatos(datos) {
        this.datos = datos;
        this.onDatosChanged.next(datos);
    }
}