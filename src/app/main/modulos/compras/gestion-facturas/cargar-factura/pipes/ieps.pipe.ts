import { Pipe, PipeTransform } from '@angular/core';
import { ImpuestosArticuloService } from '@app/main/services/impuestos-articulos.service';
import { Redondeos } from '@pixvs/utils/pipes/redondeos.util';
import { CargarFacturaComponent } from '../cargar-factura.component';

@Pipe({name: 'IepsCargarFacturaPipe'})
export class IepsCargarFacturaPipe implements PipeTransform {

	constructor(
		private impuestosArticuloService: ImpuestosArticuloService
	){}

	transform(componente: CargarFacturaComponent, actualizarCont: number): string {
		let ieps = 0;
		componente.dataSourceOCDetalles.filteredData.forEach(detalle => {
			ieps += this.impuestosArticuloService.getMontos(detalle.cantidadRelacionar,componente.precioControls[detalle.id].value,componente.descuentoControls[detalle.id].value,componente.ivaControls[detalle.id].value,componente.iepsControls[detalle.id].value,componente.iepsCuotaFijaControls[detalle.id].value, Redondeos.DECIMALES_DINERO).ieps;
		});
		return ieps.toFixed(Redondeos.DECIMALES_DINERO);
	}
}