import { Pipe, PipeTransform } from '@angular/core';
import { ImpuestosArticuloService } from '@app/main/services/impuestos-articulos.service';
import { OrdenVentaDetalleDatasource } from '../punto-venta-abierto.clases';

@Pipe({name: 'PuntoVentaSumaTotalPipe'})
export class PuntoVentaSumaTotalPipe implements PipeTransform {

    constructor(public impuestosArticuloService: ImpuestosArticuloService){}

    transform(detalles: OrdenVentaDetalleDatasource[], tipoCambio: number = 1): number {
        let sumaTotal: number = 0;

        for(let detalle of detalles){
            let precioUnitarioConvertido: number = this.impuestosArticuloService.redondear(detalle.precioSinConvertir * tipoCambio,6);
            let porcentajeDescuento: number = 0;
            if(!!detalle.descuentoSinConvertir){
                porcentajeDescuento = (detalle.descuentoSinConvertir) / detalle.precioSinConvertir;
            }
            let descuentoConvertido: number = this.impuestosArticuloService.redondear(precioUnitarioConvertido * porcentajeDescuento,6);
            sumaTotal += this.impuestosArticuloService.getMontos(detalle.cantidad,precioUnitarioConvertido,descuentoConvertido,(detalle.iva || 0)*100,(detalle.ieps | 0)*100,detalle.iepsCuotaFija).total;
        }

        return sumaTotal;
    }
}