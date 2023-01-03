import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'ArraySubdividirPipe'})
export class ArraySubdividirPipe implements PipeTransform {
    transform(array: any[], numeroElementos: number): any[][] {
        let arrays: any[][] = [];
        let elementoInicialActual: number = 0;

        while(elementoInicialActual < array.length){
            let subArray: any[] = array.slice(elementoInicialActual,elementoInicialActual+numeroElementos);
            arrays.push(subArray);
            elementoInicialActual += numeroElementos;
        }

        return arrays;
    }
}