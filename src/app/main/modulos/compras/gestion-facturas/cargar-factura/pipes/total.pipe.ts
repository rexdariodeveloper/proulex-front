import { Pipe, PipeTransform } from '@angular/core';
import { ImpuestosArticuloService } from '@app/main/services/impuestos-articulos.service';
import { Redondeos } from '@pixvs/utils/pipes/redondeos.util';
import { CargarFacturaComponent } from '../cargar-factura.component';

@Pipe({name: 'TotalCargarFacturaPipe'})
export class TotalCargarFacturaPipe implements PipeTransform {

	constructor(
		private impuestosArticuloService: ImpuestosArticuloService
	){}

	transform(componente: CargarFacturaComponent, actualizarCont: number): string {
		let total = 0;
		componente.dataSourceOCDetalles.filteredData.forEach(detalle => {
			total += this.impuestosArticuloService.getMontos(detalle.cantidadRelacionar,componente.precioControls[detalle.id].value,componente.descuentoControls[detalle.id].value,componente.ivaControls[detalle.id].value,componente.iepsControls[detalle.id].value,componente.iepsCuotaFijaControls[detalle.id].value).total;
		});
		componente.dataSourceRetenciones.data.forEach(retencionId => {
			total -= Number(componente.retencionMontoControls[retencionId].value);
		});
		return total.toFixed(Redondeos.DECIMALES_DINERO);
	}
}