import { Pipe, PipeTransform } from '@angular/core';
import { ClienteCardProjection } from '@app/main/modelos/cliente';

@Pipe({name: 'PVInCompanyClientesPipe'})
export class PVInCompanyClientesPipe implements PipeTransform {
    transform(clientes: ClienteCardProjection[], filtro: string): any {
        let clientesFiltrados: any[] = clientes.filter(cliente => {
            return cliente.nombre.toLocaleLowerCase().includes((filtro || '').trim().toLocaleLowerCase());
        });
        while((clientesFiltrados.length%4) > 0){
            clientesFiltrados.push(null);
        }
        return clientesFiltrados;
    }
}