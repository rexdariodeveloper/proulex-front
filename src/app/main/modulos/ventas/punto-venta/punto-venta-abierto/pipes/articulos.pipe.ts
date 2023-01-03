import { Pipe, PipeTransform } from '@angular/core';
import { ArticuloCardProjection } from '@app/main/modelos/articulo';

@Pipe({name: 'PVArticulosPipe'})
export class PVArticulosPipe implements PipeTransform {
    transform(articulos: ArticuloCardProjection[], listaPrecios: {[articuloId:string]: number} = {}, filtro: string): ArticuloCardProjection[][] {
        let articulosFiltrados: ArticuloCardProjection[] = articulos.filter(articulo => {
            return !!listaPrecios[articulo.id] && articulo.nombre.toLocaleLowerCase().includes((filtro || '').toLocaleLowerCase());
        });
        while((articulosFiltrados.length%4) > 0){
            articulosFiltrados.push(null);
        }
        let articulosFiltradosAgrupados: ArticuloCardProjection[][] = [];
        for(let i=0 ; i<articulosFiltrados.length/4 ; i++){
            articulosFiltradosAgrupados.push(articulosFiltrados.slice(i*4,i*4+4));
        }
        return articulosFiltradosAgrupados;
    }
}