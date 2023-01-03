import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { ListaPreciosListadoComponent } from './lista-precios/lista-precios.component';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { ListaPrecioModule } from './lista-precio/lista-precio.module';
import { CommonModule } from '@angular/common';

const routes = [
    {
        path: 'lista-precios',
        component: ListaPreciosListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/listado-precio/all' }
    }
];

@NgModule({
    declarations: [
        ListaPreciosListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        ListaPrecioModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ]
})

export class ListaPreciosModule {
}