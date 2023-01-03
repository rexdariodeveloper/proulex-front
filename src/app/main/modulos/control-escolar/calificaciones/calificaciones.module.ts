import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule, FuseSidebarModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { CalificacionesModule } from './calificaciones/calificaciones.module';
import { CalificacionesListadoComponent } from './calificaciones-listado/calificaciones-listado.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { FiltrosSidebarComponent } from './sidebars/filtros/filtros.component';
import { PixvsDynamicComponentModule } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.module';
import { CalificacionesService } from './calificaciones-listado/calificaciones.service';
import { TranslateModule } from '@ngx-translate/core';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

const routes = [
    {
        path: 'calificaciones',
        component: CalificacionesListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/captura_calificaciones/all' }
    }
];

@NgModule({
    declarations: [
        CalificacionesListadoComponent,
        FiltrosSidebarComponent
    ],
    imports: [
        CommonModule,
        MatIconModule,
        MatCardModule,
        MatButtonModule,
        MatMenuModule,
        MatTableModule,
        MatProgressBarModule,
        MatSnackBarModule,
        MatTooltipModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        CalificacionesModule,
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
        CalificacionesService
    ]
})

export class CalificacionesListadoModule {
}