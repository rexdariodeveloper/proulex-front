import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule, FuseSidebarModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { AsistenciaModule } from './asistencias/asistencia.module';
import { AsistenciasListadoComponent } from './asistencias-listado/asistencias-listado.component';
import { MatButtonModule } from '@angular/material/button';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TranslateModule } from '@ngx-translate/core';
import { PixvsDynamicComponentModule } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.module';
import { ReporteAsistenciasService } from '../reportes/reporte-asistencias/reporte-listado/reporte-listado.service';
import { FiltrosSidebarComponent } from './sidebars/filtros/filtros.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

const routes = [
    {
        path: 'asistencias',
        component: AsistenciasListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/captura_asistencia/all' }
    }
];

@NgModule({
    declarations: [
        AsistenciasListadoComponent,
        FiltrosSidebarComponent
    ],
    imports: [
        CommonModule,
        MatIconModule,
        MatCardModule,
        MatButtonModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatProgressBarModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        AsistenciaModule,
        PixvsBloqueoPantallaModule,
        PixvsDynamicComponentModule,

        FuseSidebarModule,
        FuseSharedModule,
        FuseHighlightModule,
        ScrollingModule,

        TranslateModule
    ],
    providers: [
        FichasDataService,
        ReporteAsistenciasService
    ]
})

export class AsistenciasListadoModule {
}