import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';

import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { CortesListadoComponent } from './cortes/cortes.component';
import { CorteModule } from './corte/corte.module';

const routes = [
    {
        path: 'cortes',
        component: CortesListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/cortes/all' }
    }
];

@NgModule({
    declarations: [
        CortesListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        CorteModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ]
})

export class CortesListadoModule {
}