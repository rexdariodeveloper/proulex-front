import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { PrenominaListadoComponent } from './prenomina/prenomina-listado.component';
import { PrenominaService } from './prenomina/prenomina-listado.service';
import { HttpService } from '@services/http.service';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';

const routes = [
    {
        path: 'prenomina',
        component: PrenominaListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/prenomina/all' }
    }
];

@NgModule({
    declarations: [
        PrenominaListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,

        FuseSharedModule,
        FuseHighlightModule,
        PixvsBloqueoPantallaModule

    ],
    providers: [
        FichasDataService,
        PrenominaService,
        HttpService
    ]
})

export class PrenominaListadoModule {
}