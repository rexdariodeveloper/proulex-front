import { Pipe, PipeTransform } from '@angular/core';
import { ControlMaestroMultipleCardProjection } from '@models/control-maestro-multiple';

@Pipe({name: 'PVNivelesPipe'})
export class PVNivelesPipe implements PipeTransform {
    transform(niveles: number[], filtro: string): any[] {
        let nivelesFiltrados: any[] = niveles.filter(nivel => {
            return String(nivel).includes((filtro || ''));
        });
        while((nivelesFiltrados.length%4) > 0){
            nivelesFiltrados.push(null);
        }
        return nivelesFiltrados;
    }
}