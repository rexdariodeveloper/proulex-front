import { Pipe, PipeTransform } from '@angular/core';
import { CXPFacturaProgramacionPagoProjection } from '@app/main/modelos/cxpfactura';

@Pipe({name: 'ProveedoresSeleccionadosPipe'})
export class ProveedoresSeleccionadosPipe implements PipeTransform {
	transform(proveedoresSeleccionados: {[facturaId:number]: boolean} = {}, actualizarCont: number): number {
		let total: number = 0;
		Object.keys(proveedoresSeleccionados).forEach(facturaId => {
			if(proveedoresSeleccionados[facturaId]){
				total++;
			}
		});
		return total;
	}
}