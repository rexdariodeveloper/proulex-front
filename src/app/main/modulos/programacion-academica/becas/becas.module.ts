import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { BecasListadoComponent } from './becas/becas.component';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { BecaModule } from './beca/beca.module';
import { CommonModule } from '@angular/common';

const routes = [
    {
        path: 'becas-solicitudes',
        component: BecasListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/becas-solicitudes/all' }
    }
];

@NgModule({
    declarations: [
        BecasListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        BecaModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ]
})

export class BecasListadoModule {
}