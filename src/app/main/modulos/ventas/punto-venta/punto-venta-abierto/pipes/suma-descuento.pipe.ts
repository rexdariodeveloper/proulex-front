import { Pipe, PipeTransform } from '@angular/core';
import { OrdenVentaDetalleDatasource } from '../punto-venta-abierto.clases';

@Pipe({name: 'PuntoVentaSumaDescuentoPipe'})
export class PuntoVentaSumaDescuentoPipe implements PipeTransform {
    transform(detalles: OrdenVentaDetalleDatasource[]): number {
        let sumaDescuento: number = 0;

        for(let detalle of detalles){
            sumaDescuento += detalle.descuentoSinConvertir;
        }

        return sumaDescuento;
    }
}