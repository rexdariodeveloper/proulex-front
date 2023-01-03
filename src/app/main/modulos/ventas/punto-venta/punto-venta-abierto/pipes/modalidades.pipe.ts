import { Pipe, PipeTransform } from '@angular/core';
import { PAModalidadCardProjection } from '@app/main/modelos/pamodalidad';

@Pipe({name: 'PVModalidadesPipe'})
export class PVModalidadesPipe implements PipeTransform {
    transform(modalidades: PAModalidadCardProjection[], filtro: string): any[] {
        let modalidadesFiltrados: any[] = modalidades.filter(modalidad => {
            return modalidad.nombre.toLocaleLowerCase().includes((filtro || '').toLocaleLowerCase());
        });
        while((modalidadesFiltrados.length%4) > 0){
            modalidadesFiltrados.push(null);
        }
        return modalidadesFiltrados;
    }
}