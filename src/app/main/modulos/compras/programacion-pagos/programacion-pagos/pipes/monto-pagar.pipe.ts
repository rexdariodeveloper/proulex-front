import { Pipe, PipeTransform } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CXPFacturaProgramacionPagoProjection } from '@app/main/modelos/cxpfactura';

@Pipe({name: 'MontoPagarPipe'})
export class MontoPagarPipe implements PipeTransform {
	transform(facturasSeleccionadas: {[facturaId:number]: CXPFacturaProgramacionPagoProjection} = {}, montosPagarControlMap: {[facturaId: number]: FormControl} = {}, actualizarCont: number): number {
		let total: number = 0;
		Object.keys(facturasSeleccionadas).forEach(facturaId => {
			if(!!facturasSeleccionadas[facturaId]){
				total += Number(montosPagarControlMap[facturaId].value || 0);
			}
		});
		return total;
	}
}