import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { ReporteListadoComponent } from './reporte-listado/reporte-listado.component';
import { ReporteGrupoService } from './reporte-listado/reporte-listado.service';
import { HttpService } from '@services/http.service';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';

const routes = [
    {
        path: 'reportes/avance-inscripciones',
        component: ReporteListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/avance-inscripciones/all' }
    }
];

@NgModule({
    declarations: [
        ReporteListadoComponent
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
        ReporteGrupoService,
        HttpService
    ]
})

export class ReporteAvanceInscripcionesModule {
}