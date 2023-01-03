import { Pipe, PipeTransform } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CXPFacturaProgramacionPagoProjection } from '@app/main/modelos/cxpfactura';
import { ProveedorProgramacionPagoProjection } from '@app/main/modelos/proveedor';

@Pipe({name: 'MontoPagarProveedoresPipe'})
export class MontoPagarProveedoresPipe implements PipeTransform {
	transform(proveedores: ProveedorProgramacionPagoProjection[], facturasSeleccionadas: {[facturaId:number]: CXPFacturaProgramacionPagoProjection} = {}, montosPagarControlMap: {[facturaId: number]: FormControl} = {}): number {
		let total: number = 0;
		proveedores.forEach(proveedor => {
			proveedor.facturasProgramacion.forEach(factura => {
				if(facturasSeleccionadas[factura.id]){
					total += Number(montosPagarControlMap[factura.id].value || 0);
				}
			});
		})
		return total;
	}
}