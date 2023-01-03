import { Pipe, PipeTransform } from '@angular/core';
import { OrdenCompraDetalleEditarProjection } from '@app/main/modelos/orden-compra-detalle';
import { ImpuestosArticuloService } from '@app/main/services/impuestos-articulos.service';
import { Redondeos } from '@pixvs/utils/pipes/redondeos.util';

@Pipe({name: 'TotalOCPipe'})
export class TotalOCPipe implements PipeTransform {

	constructor(
		private impuestosArticuloService: ImpuestosArticuloService
	){}

	transform(detalles: OrdenCompraDetalleEditarProjection[] = []): string {
		console.log('detalles',detalles);
		let total: number = 0;
		detalles.forEach(detalle => {
			total += this.impuestosArticuloService.getMontos(detalle.cantidad,detalle.precio,detalle.descuento,detalle.ivaExento ? 0 : detalle.iva,detalle.iepsCuotaFija ? null : detalle.ieps,detalle.iepsCuotaFija || null).total;
		});
		return total.toFixed(Redondeos.DECIMALES_DINERO);
	}
}