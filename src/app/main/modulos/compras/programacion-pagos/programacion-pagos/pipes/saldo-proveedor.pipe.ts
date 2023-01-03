import { Pipe, PipeTransform } from '@angular/core';
import { ProveedorProgramacionPagoProjection } from '@app/main/modelos/proveedor';

@Pipe({name: 'SaldoProveedorPipe'})
export class SaldoProveedorPipe implements PipeTransform {
	transform(proveedor: ProveedorProgramacionPagoProjection, actualizarCont: number): number {
		let total: number = 0;
		for(let factura of proveedor.facturasProgramacion){
			total += factura.saldo;
		}
		return total;
	}
}