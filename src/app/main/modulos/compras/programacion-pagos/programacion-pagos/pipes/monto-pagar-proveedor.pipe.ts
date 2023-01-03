import { Pipe, PipeTransform } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CXPFacturaProgramacionPagoProjection } from '@app/main/modelos/cxpfactura';
import { ProveedorProgramacionPagoProjection } from '@app/main/modelos/proveedor';

@Pipe({name: 'MontoPagarProveedorPipe'})
export class MontoPagarProveedorPipe implements PipeTransform {
	transform(proveedor: ProveedorProgramacionPagoProjection, facturasSeleccionadas: {[facturaId:number]: CXPFacturaProgramacionPagoProjection} = {}, montosPagarControlMap: {[facturaId: number]: FormControl} = {}): number {
		let total: number = 0;
		proveedor.facturasProgramacion.forEach(factura => {
			if(facturasSeleccionadas[factura.id]){
				total += Number(montosPagarControlMap[factura.id].value || 0);
			}
		});
		return total;
	}
}