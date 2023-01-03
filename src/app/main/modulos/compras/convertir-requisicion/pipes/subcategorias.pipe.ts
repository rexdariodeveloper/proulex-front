import { Pipe, PipeTransform } from '@angular/core';
import { ArticuloCategoriaComboProjection } from '@app/main/modelos/articulo-categoria';
import { ArticuloFamiliaComboProjection } from '@app/main/modelos/articulo-familia';
import { ArticuloSubcategoriaComboProjection } from '@app/main/modelos/articulo-subcategoria';

@Pipe({name: 'SubcategoriasPipe'})
export class SubcategoriasPipe implements PipeTransform {
	transform(subcategorias: ArticuloSubcategoriaComboProjection[], familiasSeleccionadas: ArticuloFamiliaComboProjection[] = [], categoriasSeleccionadas: ArticuloCategoriaComboProjection[] = [], categorias: ArticuloCategoriaComboProjection[] = [], actualizarCont: number): ArticuloSubcategoriaComboProjection[] {
		if(!familiasSeleccionadas.length && !categoriasSeleccionadas.length){
			return subcategorias;
		}
		if(!!categoriasSeleccionadas.length){
			let categoriasIds: number[] = categoriasSeleccionadas.map(categoria => {
				return categoria.id;
			});
			return subcategorias.filter(subcategoria => {
				return categoriasIds.includes(subcategoria.categoria.id);
			});
		}
		let familiasIds: number[] = familiasSeleccionadas.map(familia => {
			return familia.id;
		});
		let categoriasIds: number[] = categorias.filter(categoria => {
			return familiasIds.includes(categoria.familia.id);
		}).map(categoria => {
			return categoria.id;
		});
		return subcategorias.filter(subcategoria => {
			return categoriasIds.includes(subcategoria.categoria.id);
		});
	}
}