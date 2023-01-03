import { Pipe, PipeTransform } from '@angular/core';
import { OrdenCompraDetalleEditarProjection } from '@app/main/modelos/orden-compra-detalle';
import { ImpuestosArticuloService } from '@app/main/services/impuestos-articulos.service';
import { Redondeos } from '@pixvs/utils/pipes/redondeos.util';

@Pipe({name: 'SubtotalOCPipe'})
export class SubtotalOCPipe implements PipeTransform {

	constructor(
		private impuestosArticuloService: ImpuestosArticuloService
	){}

	transform(detalles: OrdenCompraDetalleEditarProjection[] = []): string {
		let subtotal: number = 0;
		detalles.forEach(detalle => {
			subtotal += this.impuestosArticuloService.getMontos(detalle.cantidad,detalle.precio,null,null,null,null).subtotal;
		});
		return subtotal.toFixed(Redondeos.DECIMALES_DINERO);
	}
}