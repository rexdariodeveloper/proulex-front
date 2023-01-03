import { Pipe, PipeTransform } from '@angular/core';
import { ProgramaGrupoCardProjection } from '@app/main/modelos/programa-grupo';

@Pipe({name: 'PVInCompanyGruposPipe'})
export class PVInCompanyGruposPipe implements PipeTransform {
    transform(grupos: ProgramaGrupoCardProjection[], filtro: string): ProgramaGrupoCardProjection[] {
        let gruposFiltrados: ProgramaGrupoCardProjection[] = grupos.filter(grupo => {
            return grupo.nombre.toLocaleLowerCase().includes((filtro || '').toLocaleLowerCase());
        });
        while((gruposFiltrados.length%4) > 0){
            gruposFiltrados.push(null);
        }
        return gruposFiltrados;
    }
}