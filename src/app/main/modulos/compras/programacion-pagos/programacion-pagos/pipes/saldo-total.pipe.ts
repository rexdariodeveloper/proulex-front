import { Pipe, PipeTransform } from '@angular/core';
import { ProveedorProgramacionPagoProjection } from '@app/main/modelos/proveedor';

@Pipe({name: 'SaldoTotalPipe'})
export class SaldoTotalPipe implements PipeTransform {
	transform(proveedores: ProveedorProgramacionPagoProjection[], actualizarCont: number): number {
		let total: number = 0;
		for(let proveedor of proveedores){
			for(let factura of proveedor.facturasProgramacion){
				total += factura.saldo;
			}
		}
		return total;
	}
}