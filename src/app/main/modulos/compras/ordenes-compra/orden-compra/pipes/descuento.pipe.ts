import { Pipe, PipeTransform } from '@angular/core';
import { OrdenCompraDetalleEditarProjection } from '@app/main/modelos/orden-compra-detalle';
import { ImpuestosArticuloService } from '@app/main/services/impuestos-articulos.service';
import { Redondeos } from '@pixvs/utils/pipes/redondeos.util';

@Pipe({name: 'DescuentoOCPipe'})
export class DescuentoOCPipe implements PipeTransform {

	constructor(
		private impuestosArticuloService: ImpuestosArticuloService
	){}

	transform(detalles: OrdenCompraDetalleEditarProjection[] = []): string {
		let descuento: number = 0;
		detalles.forEach(detalle => {
			descuento += this.impuestosArticuloService.getMontos(detalle.cantidad,detalle.precio,detalle.descuento,detalle.ivaExento ? 0 : detalle.iva,detalle.iepsCuotaFija ? null : detalle.ieps,detalle.iepsCuotaFija || null).descuento;
		});
		return descuento.toFixed(Redondeos.DECIMALES_DINERO);
	}
}