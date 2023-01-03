import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { TabuladoresListadoComponent } from './tabuladores/tabuladores.component';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { TabuladorModule } from './tabulador/tabulador.module';
import { CommonModule } from '@angular/common';

const routes = [
    {
        path: 'tabuladores',
        component: TabuladoresListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/tabuladores/all' }
    }
];

@NgModule({
    declarations: [
        TabuladoresListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        TabuladorModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService
    ]
})

export class TabuladoresListadoModule {
}