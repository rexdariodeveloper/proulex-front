import { Pipe, PipeTransform } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CXPFacturaProgramacionPagoProjection } from '@app/main/modelos/cxpfactura';
import { ProveedorProgramacionPagoProjection } from '@app/main/modelos/proveedor';

@Pipe({name: 'PagosRhPipe'})
export class PagosRhPipe implements PipeTransform {
	transform(proveedores: ProveedorProgramacionPagoProjection[], isNull:boolean ): ProveedorProgramacionPagoProjection[] {
		return proveedores.filter(proveedor => !!isNull ? !!proveedor.rfc : !proveedor.rfc);
	}
}