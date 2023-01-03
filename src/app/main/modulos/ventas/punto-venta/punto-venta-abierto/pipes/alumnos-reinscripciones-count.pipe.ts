import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'AlumnosReinscripcionesCountPipe'})
export class AlumnosReinscripcionesCountPipe implements PipeTransform {
    transform(reinscripcionesSeleccionadas: {[alumnoId:string]: {[idiomaId:string]: boolean}} = {}, actualizarCont: number): number {
        let totalAlumnos: number = 0;

        for(let alumnoId in reinscripcionesSeleccionadas){
            for(let idiomaId in reinscripcionesSeleccionadas[alumnoId]){
                if(reinscripcionesSeleccionadas[alumnoId][idiomaId]){
                    totalAlumnos++;
                    break;
                }
            }
        }

        return totalAlumnos;
    }
}