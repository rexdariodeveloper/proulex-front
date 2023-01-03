import { Pipe, PipeTransform } from '@angular/core';
import { ArticuloPrecargarProjection } from '@app/main/modelos/articulo';
import { UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';

@Pipe({name: 'UMArticuloPipe'})
export class UMArticuloPipe implements PipeTransform {
	transform(articulo: ArticuloPrecargarProjection): UnidadMedidaComboProjection[] {
		if(!!articulo.unidadMedidaConversionCompras?.id && articulo.unidadMedidaConversionCompras.id != articulo.unidadMedidaInventario.id){
			return [articulo.unidadMedidaInventario,articulo.unidadMedidaConversionCompras];
		}
		return [articulo.unidadMedidaInventario];
	}
}