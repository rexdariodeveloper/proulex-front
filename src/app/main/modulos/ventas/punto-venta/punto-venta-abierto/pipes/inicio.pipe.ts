import { Pipe, PipeTransform } from '@angular/core';
import { ArticuloFamiliaCardProjection } from '@app/main/modelos/articulo-familia';
import { ControlMaestroMultipleCardProjection } from '@models/control-maestro-multiple';
import { CardExtra } from '../punto-venta-abierto.clases';

@Pipe({name: 'PVInicioPipe'})
export class PVInicioPipe implements PipeTransform {
    transform(idiomas: ControlMaestroMultipleCardProjection[], familias: ArticuloFamiliaCardProjection[], extra: CardExtra[], filtro: string): any[] {
        let elementosFiltrados: any[] = idiomas.filter(idioma => {
            return idioma.valor.toLocaleLowerCase().includes((filtro || '').toLocaleLowerCase());
        }).concat(familias.filter(familia => {
            return familia.nombre.toLocaleLowerCase().includes((filtro || '').toLocaleLowerCase());
        }));
        elementosFiltrados = elementosFiltrados.concat(extra.filter(card => {
            return card.nombre.toLocaleLowerCase().includes((filtro || '').toLocaleLowerCase());
        }));
        while((elementosFiltrados.length%4) > 0){
            elementosFiltrados.push(null);
        }
        return elementosFiltrados;
    }
}