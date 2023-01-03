import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';

@Pipe({name: 'FechaHistorialPipe'})
export class FechaHistorialPipe implements PipeTransform {
    transform(fechaHistorial: Moment): string {
        let fechaHoy: Moment = moment();
        if(fechaHistorial.format('DD/MM/YYYY') == fechaHoy.format('DD/MM/YYYY')){
            return 'Hoy';
        }
        return fechaHistorial.format('DD/MM/YYYY');
    }
}