import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { ClientesListadoComponent } from './clientes/clientes.component';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { ClienteModule } from './cliente/cliente.module';
import { CommonModule } from '@angular/common';

const routes = [
    {
        path: 'clientes',
        component: ClientesListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/clientes/all' }
    }
];

@NgModule({
    declarations: [
        ClientesListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        ClienteModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ]
})

export class ClientesListadoModule {
}