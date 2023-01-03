import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { HttpService } from '@services/http.service';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';
import { InscripcionesComponent } from './reporte/inscripciones.component';
import { InscripcionesService } from './reporte/inscripciones.service';

const routes = [
    {
        path: 'reportes/inscripciones',
        component: InscripcionesComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/inscripciones/all' }
    }
];

@NgModule({
    declarations: [
        InscripcionesComponent
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
        InscripcionesService,
        HttpService
    ]
})

export class ReporteInscripcionesModule {
}