import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { HttpService } from '@pixvs/services/http.service';
import { Usuario } from '@models/usuario';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { HashidsService } from '@services/hashids.service';
import { MatSnackBar } from '@angular/material/snack-bar';


/** Investigar que es la notación @Injectable y el parámetro "providedIn" */
@Injectable({ providedIn: 'root' })
export class registerService {

    onPaisesChanged: BehaviorSubject<any>;
    onEstadosChanged: BehaviorSubject<any>;
    onMunicipiosChanged: BehaviorSubject<any>;

    constructor(
        private httpService: HttpService,
		private router: Router,
		private hashid: HashidsService,
        private snackBar: MatSnackBar
    ) {
        this.onPaisesChanged = new BehaviorSubject(null);
        this.onEstadosChanged = new BehaviorSubject(null);
        this.onMunicipiosChanged = new BehaviorSubject(null);
    }
    
    ngOnInit(): void {}

    register(usuario: Usuario): Observable<any> {
		return this.httpService
			.post(JSON.stringify(usuario), '/v1/usuario/register', false);
	}

    getPaises() {
        this.httpService
			.get('/v1/usuario/listados/paises', false)
            .subscribe((response: any) => {
                if(response.status == 200)
                    this.onPaisesChanged.next(response.data);
                else {
                    this.onPaisesChanged.next(null);
                    this.snackBar.open(response.mesage, 'OK', { duration: 5000 });
                }
            });
    }

    getEstados(paisId: number) {
        this.httpService
        .get('/v1/usuario/listados/estados/'+paisId, false)
        .subscribe((response: any) => {
            if(response.status == 200)
                this.onEstadosChanged.next(response.data);
            else {
                this.onEstadosChanged.next(null);
                this.snackBar.open(response.mesage, 'OK', { duration: 5000 });
            }
        });
    }

    getMunicipios(estadoId: number) {
        this.httpService
            .get('/v1/usuario/listados/municipios/'+estadoId, false)
            .subscribe((response: any) => {
                if(response.status == 200)
                    this.onMunicipiosChanged.next(response.data);
                else {
                    this.onMunicipiosChanged.next(null);
                    this.snackBar.open(response.mesage, 'OK', { duration: 5000 });
                }
            });
    }
}