import { Pipe, PipeTransform } from '@angular/core';
import { ClienteRemisionDetalleEditarProjection } from '@app/main/modelos/cliente-remision-detalle';
import { RemisionService } from '../remision.service';

@Pipe({name: 'RemisionSumaMontoPipe'})
export class RemisionSumaMontoPipe implements PipeTransform {

    constructor(
        private _remisionService: RemisionService
    ){}

    transform(detalles: ClienteRemisionDetalleEditarProjection[], tipoMonto: string): number {
        let montoSuma = 0;
        for(let detalle of detalles){
            montoSuma += this._remisionService.getMontos(detalle.cantidad,detalle.articulo.precioVenta,0,(detalle.articulo.iva || 0) * 100,(detalle.articulo.ieps || 0) * 100,detalle.articulo.iepsCuotaFija,2)[tipoMonto];
        }
        return montoSuma;
    }
}