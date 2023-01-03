import { Pipe, PipeTransform } from '@angular/core';
import { ProgramaGrupoCardProjection } from '@app/main/modelos/programa-grupo';

@Pipe({name: 'PVGruposPipe'})
export class PVGruposPipe implements PipeTransform {
    transform(grupos: ProgramaGrupoCardProjection[], listaPrecios: {[articuloId:string]: number} = {}, filtro: string, mostrarSinGrupo: boolean = false): ProgramaGrupoCardProjection[] {
        let gruposFiltrados: ProgramaGrupoCardProjection[] = grupos.filter(grupo => {
            return !!listaPrecios[grupo.articuloId] && grupo.nombre.toLocaleLowerCase().includes((filtro || '').toLocaleLowerCase());
        });
        while((gruposFiltrados.length%4) > 0){
            gruposFiltrados.push(null);
        }
        return gruposFiltrados;
    }
}