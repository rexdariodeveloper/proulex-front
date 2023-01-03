import { Pipe, PipeTransform } from '@angular/core';
import { ArticuloCategoriaComboProjection } from '@app/main/modelos/articulo-categoria';
import { ArticuloFamiliaComboProjection } from '@app/main/modelos/articulo-familia';

@Pipe({name: 'CategoriasPipe'})
export class CategoriasPipe implements PipeTransform {
	transform(categorias: ArticuloCategoriaComboProjection[], familiasSeleccionadas: ArticuloFamiliaComboProjection[] = [], actualizarCont: number): ArticuloCategoriaComboProjection[] {
		console.log(' -------------------------- ');
		console.log(' - - - CategoriasPipe - - - ');
		console.log(' -------------------------- ');
		console.log('categorias',categorias);
		console.log('familiasSeleccionadas',familiasSeleccionadas);
		if(!familiasSeleccionadas.length){
			return categorias;
		}
		let familiasIds: number[] = familiasSeleccionadas.map(familia => {
			return familia.id;
		});
		console.log('familiasIds',familiasIds);
		return categorias.filter(categoria => {
			console.log(categoria.familia.id,familiasIds.includes(categoria.familia.id));
			return familiasIds.includes(categoria.familia.id);
		});
	}
}