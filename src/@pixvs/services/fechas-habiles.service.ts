import { Injectable } from '@angular/core';
import { HttpService } from '@pixvs/services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JsonResponse } from '@models/json-response';
import { FichaDataService } from './ficha-data.service';
import { Resolve } from '@angular/router';
import { HashidsService } from './hashids.service';
import * as moment from 'moment';


@Injectable()
export class FechasHabilesService extends FichaDataService implements Resolve<any>{

    datos: any;

    constructor(
        public _httpClient: HttpService,
        public snackBar: MatSnackBar,
        public hashid: HashidsService
    ) {
        super(_httpClient, snackBar, hashid);
    }

    /**
     * @param fechaInicio   Fecha inicial. en caso de null, fecha actual. formato YYYY-MM-DD 
     * @param fechaFin      Fecha final. en caso de null, fecha actual. formato YYYY-MM-DD
     * @param dias          dias de la semana, arreglo de booleanos en el que la primera posición representa el domingo
     */
    getFechasHabiles(fechaInicio: string, fechaFin: string, dias:boolean[] = null): Promise<any> {
        //Validación de parametros
        let f0 = !!fechaInicio? moment(fechaInicio, 'YYYY-MM-DD') : moment();
        let f1 = !!fechaFin? moment(fechaFin, 'YYYY-MM-DD') : moment();
        let diasSemana: boolean[] = [true, true, true, true, true, true, true];
        if(dias != null && dias.length > 0){
            dias.forEach((dia, i) => {
                if(i < 8){ diasSemana[i] = dia; }
            });
        }

        return new Promise((resolve, reject) => {
            this._httpClient.get('/v1/parametros-empresa/getDiasNoLaborales', true).subscribe(
            (response: any) => {
                if (response.status == 200) {
                    let anuales: string[] = response?.data?.diasNoLaborales.map(fecha => fecha?.fecha);
                    let añoActual: string = moment().format('YYYY');
                    let fijos: string[] = response?.data?.diasNoLaboralesFijos.map((fecha) => {
                        return [añoActual,('0'+fecha.mes).slice(-2),('0'+fecha.dia).slice(-2)].join('-')
                    });
                    let noLaborales: string[] = anuales.concat(fijos);
                    let fecha = !!fechaInicio? moment(fechaInicio, 'YYYY-MM-DD') : moment();
                    let fechasValidas: string[] = [];
                    while(fecha.isBetween(f0, f1, 'day', '[]')){
                        let dow = fecha.day();
                        let ff = fecha.format('YYYY-MM-DD');
                        if(!noLaborales.includes(ff)){
                            if(diasSemana[dow])
                                fechasValidas.push(ff);
                        }
                        fecha.add(1, 'day');
                    }
                    this.datos = fechasValidas;
                    this.onDatosChanged.next(this.datos);
                } else {
                    if (response.status == 1557) {
                        this.snackBar.open(this.getError(response), 'OK', {
                            duration: 5000,
                        });
                    } else {
                        this.datos = [];
                        this.snackBar.open(response.message, 'OK', {
                            duration: 5000,
                        });
                    }
                    this.onDatosChanged.next(null);
                }
                resolve(response);
            }, 
            (error: any) => {
                this.datos = [];
                this.snackBar.open(this.getError(error), 'OK', {
                    duration: 5000,
                });
                this.onDatosChanged.next(null);
                resolve(new JsonResponse(500, this.getError(error), null, null));                
            });
        });
    }
    
}
