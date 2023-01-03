import { Pipe, PipeTransform } from '@angular/core';
import { OrdenVentaDetalleDatasource } from '../punto-venta-abierto.clases';

@Pipe({name: 'PuntoVentaSumaIEPSPipe'})
export class PuntoVentaSumaIEPSPipe implements PipeTransform {
    transform(detalles: OrdenVentaDetalleDatasource[]): number {
        let sumaIEPS: number = 0;

        for(let detalle of detalles){
            sumaIEPS += detalle.montoIeps;
        }

        return sumaIEPS;
    }
}