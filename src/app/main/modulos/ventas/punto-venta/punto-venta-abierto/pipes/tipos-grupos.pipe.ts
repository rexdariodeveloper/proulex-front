import { Pipe, PipeTransform } from '@angular/core';
import { ControlMaestroMultipleCardProjection } from '@models/control-maestro-multiple';

@Pipe({name: 'PVTiposGruposPipe'})
export class PVTiposGruposPipe implements PipeTransform {
    transform(tiposGrupos: ControlMaestroMultipleCardProjection[], filtro: string): any[] {
        let tiposGruposFiltrados: any[] = tiposGrupos.filter(tipoGrupo => {
            return tipoGrupo.valor.toLocaleLowerCase().includes((filtro || '').toLocaleLowerCase());
        });
        while((tiposGruposFiltrados.length%4) > 0){
            tiposGruposFiltrados.push(null);
        }
        return tiposGruposFiltrados;
    }
}