import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { InasistenciasComponent } from './inasistencias/inasistencias.component';
import { InasistenciasService } from './inasistencias/inasistencias.service';
import { HttpService } from '@services/http.service';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';

const routes = [
    {
        path: 'reportes/inasistencias',
        component: InasistenciasComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/inasistencias/all' }
    }
];

@NgModule({
    declarations: [
        InasistenciasComponent
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
        InasistenciasService,
        HttpService
    ]
})

export class ReporteInasistenciasModule {
}