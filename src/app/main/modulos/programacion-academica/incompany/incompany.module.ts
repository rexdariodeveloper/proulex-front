import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { GruposListadoComponent } from './grupos/grupos.component';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { GrupoModule } from './grupo/grupo.module';
import { CommonModule } from '@angular/common';

const routes = [
    {
        path: 'incompany',
        component: GruposListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/incompany/grupos/all' }
    }
];

@NgModule({
    declarations: [
        GruposListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        GrupoModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ]
})

export class IncompanyModule {
}