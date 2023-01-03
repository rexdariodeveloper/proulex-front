import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { HttpService } from '@services/http.service';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';
import { PagosAlumnosComponent } from './reporte/pagos-alumnos.component';
import { PagosAlumnosService } from './reporte/pagos-alumnos.service';

const routes = [
    {
        path: 'reportes/pagos-alumnos',
        component: PagosAlumnosComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/pagos-alumnos/all' }
    }
];

@NgModule({
    declarations: [
        PagosAlumnosComponent
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
        PagosAlumnosService,
        HttpService
    ]
})

export class ReportePagosAlumnosModule {
}