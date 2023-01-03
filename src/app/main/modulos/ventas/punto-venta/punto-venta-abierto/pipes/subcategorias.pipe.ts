import { Pipe, PipeTransform } from '@angular/core';
import { ArticuloSubcategoriaCardProjection } from '@app/main/modelos/articulo-subcategoria';

@Pipe({name: 'PVSubcategoriasPipe'})
export class PVSubcategoriasPipe implements PipeTransform {
    transform(subcategorias: ArticuloSubcategoriaCardProjection[], filtro: string): any[] {
        let subcategoriasFiltrados: any[] = subcategorias.filter(subcategoria => {
            return subcategoria.nombre.toLocaleLowerCase().includes((filtro || '').toLocaleLowerCase());
        });
        while((subcategoriasFiltrados.length%4) > 0){
            subcategoriasFiltrados.push(null);
        }
        return subcategoriasFiltrados;
    }
}