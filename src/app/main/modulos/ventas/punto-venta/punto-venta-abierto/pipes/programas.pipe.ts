import { Pipe, PipeTransform } from '@angular/core';
import { ProgramaCardProjection } from '@app/main/modelos/programa';

@Pipe({name: 'PVProgramasPipe'})
export class PVProgramasPipe implements PipeTransform {
    transform(programas: ProgramaCardProjection[], filtro: string): any[] {
        let programasFiltrados: any[] = programas.filter(programa => {
            return programa.nombre.toLocaleLowerCase().includes((filtro || '').toLocaleLowerCase());
        });
        while((programasFiltrados.length%4) > 0){
            programasFiltrados.push(null);
        }
        return programasFiltrados;
    }
}