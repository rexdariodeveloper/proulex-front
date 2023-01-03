import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'FechaPipe' })
export class FechaPipe implements PipeTransform {
    transform(fecha: number | string | Date, mostrarHoras?: boolean, mostrarSegundos?: boolean): string {
        let dateMoment: moment.Moment = moment(fecha);

        if (!dateMoment.isValid()) {
            return ''
        }

        let fechaConFormato = dateMoment.format('MMMM DD, YYYY' + (mostrarHoras ? ' h:mm' + (mostrarSegundos ? ':ss' : '') + ' A' : ''));

        return fechaConFormato.charAt(0).toUpperCase() + fechaConFormato.slice(1);
    }
}