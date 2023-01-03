import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { ReporteListadoComponent } from './reporte-listado/reporte-listado.component';
import { ReporteBecasService } from './reporte-listado/reporte-listado.service';
import { HttpService } from '@services/http.service';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';
import { GruposService } from '@app/main/modulos/programacion-academica/grupos/grupos/grupos.service';

const routes = [
    {
        path: 'reportes/becas',
        component: ReporteListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/reporte-becas/all' }
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
        ReporteBecasService,
        GruposService,
        HttpService
    ]
})

export class ReporteBecasModule {
}