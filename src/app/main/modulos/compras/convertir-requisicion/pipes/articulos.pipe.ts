import { Pipe, PipeTransform } from '@angular/core';
import { ArticuloComboProjection } from '@app/main/modelos/articulo';
import { ArticuloCategoriaComboProjection } from '@app/main/modelos/articulo-categoria';
import { ArticuloFamiliaComboProjection } from '@app/main/modelos/articulo-familia';
import { ArticuloSubcategoriaComboProjection } from '@app/main/modelos/articulo-subcategoria';

@Pipe({name: 'ArticulosPipe'})
export class ArticulosPipe implements PipeTransform {
	transform(articulos: ArticuloComboProjection[], familiasSeleccionadas: ArticuloFamiliaComboProjection[] = [], categoriasSeleccionadas: ArticuloCategoriaComboProjection[] = [], subcategoriasSeleccionadas: ArticuloSubcategoriaComboProjection[] = [], actualizarCont: number): ArticuloComboProjection[] {
		if(!familiasSeleccionadas.length && !categoriasSeleccionadas.length && !subcategoriasSeleccionadas.length){
			return articulos;
		}
		if(!!subcategoriasSeleccionadas.length){
			let subcategoriasIds: number[] = subcategoriasSeleccionadas.map(subcategoria => {
				return subcategoria.id;
			});
			return articulos.filter(articulo => {
				return subcategoriasIds.includes(articulo.subcategoria.id);
			});
		}
		if(!!categoriasSeleccionadas.length){
			let categoriasIds: number[] = categoriasSeleccionadas.map(categoria => {
				return categoria.id;
			});
			return articulos.filter(articulo => {
				return categoriasIds.includes(articulo.categoria.id);
			});
		}
		let familiasIds: number[] = familiasSeleccionadas.map(familia => {
			return familia.id;
		});
		return articulos.filter(articulo => {
			return familiasIds.includes(articulo.familia.id);
		});
	}
}