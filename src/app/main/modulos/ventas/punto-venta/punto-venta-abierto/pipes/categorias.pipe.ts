import { Pipe, PipeTransform } from '@angular/core';
import { ArticuloCategoriaCardProjection } from '@app/main/modelos/articulo-categoria';

@Pipe({name: 'PVCategoriasPipe'})
export class PVCategoriasPipe implements PipeTransform {
    transform(categorias: ArticuloCategoriaCardProjection[], filtro: string): any[] {
        let categoriasFiltrados: any[] = categorias.filter(categoria => {
            return categoria.nombre.toLocaleLowerCase().includes((filtro || '').toLocaleLowerCase());
        });
        while((categoriasFiltrados.length%4) > 0){
            categoriasFiltrados.push(null);
        }
        return categoriasFiltrados;
    }
}