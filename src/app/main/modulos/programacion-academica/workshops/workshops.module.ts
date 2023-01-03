import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';

import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { WorkshopModule } from './workshop/workshop.module';
import { WorkshopListadoComponent } from './workshops/workshops.component';

const routes = [
    {
        path: 'workshops',
        component: WorkshopListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/workshop/all' }
    }
];

@NgModule({
    declarations: [
        WorkshopListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        WorkshopModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ]
})

export class WorkshopsListadoModule {
}