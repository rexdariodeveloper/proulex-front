import { Pipe, PipeTransform } from '@angular/core';
import { ImpuestosArticuloService } from '@app/main/services/impuestos-articulos.service';
import { Redondeos } from '@pixvs/utils/pipes/redondeos.util';
import { CargarFacturaComponent } from '../cargar-factura.component';

@Pipe({name: 'SubtotalCargarFacturaPipe'})
export class SubtotalCargarFacturaPipe implements PipeTransform {

	constructor(
		private impuestosArticuloService: ImpuestosArticuloService
	){}

	transform(componente: CargarFacturaComponent, actualizarCont: number): string {
		let subtotal = 0;
		componente.dataSourceOCDetalles.filteredData.forEach(detalle => {
			subtotal += this.impuestosArticuloService.getMontos(detalle.cantidadRelacionar,componente.precioControls[detalle.id].value,null,null,null,null, Redondeos.DECIMALES_DINERO).subtotal;
		});
		return subtotal.toFixed(Redondeos.DECIMALES_DINERO);
	}
}