import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { MetasListadoComponent } from './metas-listado/metas-listado.component';
import { MetaModule } from './meta/meta.module';


const routes = [
    {
        path: 'metas',
        component: MetasListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/programas-metas/all' }
    }
];

@NgModule({
    declarations: [
        MetasListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        MetaModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ]
})

export class MetasListadoModule {
}