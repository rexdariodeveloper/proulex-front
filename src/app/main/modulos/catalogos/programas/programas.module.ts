import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { ProgramasListadoComponent } from './programas/programas.component';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { ProgramaModule } from './programa/programa.module';
import { CommonModule } from '@angular/common';

const routes = [
    {
        path: 'programas',
        component: ProgramasListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/programas/all' }
    }
];

@NgModule({
    declarations: [
        ProgramasListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        ProgramaModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ]
})

export class ProgramasListadoModule {
}