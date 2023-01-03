import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { EntidadesListadoComponent } from './entidades/entidades.component';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { EntidadModule } from './entidad/entidad.module';
import { CommonModule } from '@angular/common';

const routes = [
    {
        path: 'entidades',
        component: EntidadesListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/entidades/all' }
    }
];

@NgModule({
    declarations: [
        EntidadesListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        EntidadModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ]
})

export class EntidadesListadoModule {
}