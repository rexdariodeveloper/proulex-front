import { Pipe, PipeTransform } from '@angular/core';
import { OrdenCompraDetalleEditarProjection } from '@app/main/modelos/orden-compra-detalle';
import { ImpuestosArticuloService } from '@app/main/services/impuestos-articulos.service';
import { Redondeos } from '@pixvs/utils/pipes/redondeos.util';

@Pipe({name: 'IepsOCPipe'})
export class IepsOCPipe implements PipeTransform {

	constructor(
		private impuestosArticuloService: ImpuestosArticuloService
	){}

	transform(detalles: OrdenCompraDetalleEditarProjection[] = []): string {
		let ieps: number = 0;
		detalles.forEach(detalle => {
			ieps += this.impuestosArticuloService.getMontos(detalle.cantidad,detalle.precio,detalle.descuento,detalle.ivaExento ? 0 : detalle.iva,detalle.iepsCuotaFija ? null : detalle.ieps,detalle.iepsCuotaFija || null).ieps;
		});
		return ieps.toFixed(Redondeos.DECIMALES_DINERO);
	}
}