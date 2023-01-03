import { Pipe, PipeTransform } from '@angular/core';
import { OrdenVentaDetalleDatasource } from '../punto-venta-abierto.clases';

@Pipe({name: 'PuntoVentaSumaIVAPipe'})
export class PuntoVentaSumaIVAPipe implements PipeTransform {
    transform(detalles: OrdenVentaDetalleDatasource[]): number {
        let sumaIVA: number = 0;

        for(let detalle of detalles){
            sumaIVA += detalle.montoIva;
        }

        return sumaIVA;
    }
}