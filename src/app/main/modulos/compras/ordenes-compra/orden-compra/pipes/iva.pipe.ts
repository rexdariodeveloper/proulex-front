import { Pipe, PipeTransform } from '@angular/core';
import { OrdenCompraDetalleEditarProjection } from '@app/main/modelos/orden-compra-detalle';
import { ImpuestosArticuloService } from '@app/main/services/impuestos-articulos.service';
import { Redondeos } from '@pixvs/utils/pipes/redondeos.util';

@Pipe({name: 'IvaOCPipe'})
export class IvaOCPipe implements PipeTransform {

	constructor(
		private impuestosArticuloService: ImpuestosArticuloService
	){}

	transform(detalles: OrdenCompraDetalleEditarProjection[] = []): string {
		let iva: number = 0;
		detalles.forEach(detalle => {
			iva += this.impuestosArticuloService.getMontos(detalle.cantidad,detalle.precio,detalle.descuento,detalle.ivaExento ? 0 : detalle.iva,detalle.iepsCuotaFija ? null : detalle.ieps,detalle.iepsCuotaFija || null).iva;
		});
		return iva.toFixed(Redondeos.DECIMALES_DINERO);
	}
}