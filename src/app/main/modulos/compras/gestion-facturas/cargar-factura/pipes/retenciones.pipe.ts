import { Pipe, PipeTransform } from '@angular/core';
import { ImpuestosArticuloService } from '@app/main/services/impuestos-articulos.service';
import { Redondeos } from '@pixvs/utils/pipes/redondeos.util';
import { CargarFacturaComponent } from '../cargar-factura.component';

@Pipe({name: 'RetencionesCargarFacturaPipe'})
export class RetencionesCargarFacturaPipe implements PipeTransform {

	constructor(
		private impuestosArticuloService: ImpuestosArticuloService
	){}

	transform(componente: CargarFacturaComponent, actualizarCont: number): string {
		let retenciones = 0;
		componente.dataSourceRetenciones.data.forEach(retencionId => {
			retenciones += Number(componente.retencionMontoControls[retencionId].value);
		});
		return retenciones.toFixed(Redondeos.DECIMALES_DINERO);
	}
}