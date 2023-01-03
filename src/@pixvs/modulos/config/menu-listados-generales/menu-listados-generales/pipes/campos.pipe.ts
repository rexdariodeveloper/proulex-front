import { Pipe, PipeTransform } from '@angular/core';
import { MenuListadoGeneralDetalleEditarProjection } from '@models/menu-listado-general-detalle';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';

@Pipe({name: 'CamposPipe'})
export class CamposPipe implements PipeTransform {
	transform(campos: MenuListadoGeneralDetalleEditarProjection[]): FieldConfig[] {
		return campos.map(campo => {
			return campo.jsonConfig;
		});
	}
}