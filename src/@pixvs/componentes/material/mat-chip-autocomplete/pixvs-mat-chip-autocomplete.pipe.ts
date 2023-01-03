import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'PixvsMatChipAutocompletePipe'})
export class PixvsMatChipAutocompletePipe implements PipeTransform {
    transform(arregloBuscar: any[], arregloAgregados: any[] = []): any {
        let idsAgregados: number[] = arregloAgregados.map(obj => obj.id);
        return arregloBuscar.filter(obj => !idsAgregados.includes(obj.id));
    }
}