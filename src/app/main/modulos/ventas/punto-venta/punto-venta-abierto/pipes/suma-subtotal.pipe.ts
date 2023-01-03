import { Pipe, PipeTransform } from '@angular/core';
import { OrdenVentaDetalleDatasource } from '../punto-venta-abierto.clases';

@Pipe({name: 'PuntoVentaSumaSubtotalPipe'})
export class PuntoVentaSumaSubtotalPipe implements PipeTransform {
    transform(detalles: OrdenVentaDetalleDatasource[]): number {
        let sumaSubtotal: number = 0;

        for(let detalle of detalles){
            sumaSubtotal += detalle.montoSubtotal;
        }

        return sumaSubtotal;
    }
}