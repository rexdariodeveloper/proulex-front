import { Pipe, PipeTransform } from '@angular/core';
import { ImpuestosArticuloService } from '@app/main/services/impuestos-articulos.service';
import { Redondeos } from '@pixvs/utils/pipes/redondeos.util';
import { CargarFacturaComponent } from '../cargar-factura.component';

@Pipe({name: 'DescuentoCargarFacturaPipe'})
export class DescuentoCargarFacturaPipe implements PipeTransform {

	constructor(
		private impuestosArticuloService: ImpuestosArticuloService
	){}

	transform(componente: CargarFacturaComponent, actualizarCont: number): string {
		let descuento = 0;
		componente.dataSourceOCDetalles.filteredData.forEach(detalle => {
			descuento += this.impuestosArticuloService.getMontos(detalle.cantidadRelacionar,componente.precioControls[detalle.id].value,componente.descuentoControls[detalle.id].value,null,null,null).descuento;
		});
		return descuento.toFixed(Redondeos.DECIMALES_DINERO);
	}
}