import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule, FuseSidebarModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { ReporteListadoComponent } from './reporte-listado/reporte-listado.component';
import { ReporteGrupoService } from './reporte-listado/reporte-listado.service';
import { HttpService } from '@services/http.service';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';
import { GrupoService } from '@app/main/modulos/programacion-academica/incompany/grupo/grupo.service';
import { FechasHabilesService } from '@services/fechas-habiles.service';
import { DialogComponent } from './reporte-listado/dialogs/calificaciones-asistencias.dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PixvsMatChipAutocompleteModule } from '@pixvs/componentes/material/mat-chip-autocomplete/pixvs-mat-chip-autocomplete.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { TabCalificacionesComponent } from './reporte-listado/tabs/calificaciones/tab-calificaciones.component';
import { TabAsistenciasComponent } from './reporte-listado/tabs/asistencias/tab-asistencias.component';
import { CalificacionesService } from '../../calificaciones/calificaciones/calificaciones.service';
import { AsistenciaService } from '../../asistencias/asistencias/asistencia.service';

const routes = [
    {
        path: 'reportes/reporte-alumnos',
        component: ReporteListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/reporte-alumnos/all' }
    }
];

@NgModule({
    declarations: [
        ReporteListadoComponent,
        DialogComponent,
        TabCalificacionesComponent,
        TabAsistenciasComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,

        FuseSharedModule,
        FuseHighlightModule,
        PixvsBloqueoPantallaModule,
        MatDialogModule,

        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatTabsModule,
        MatInputModule,
        MatMenuModule,
        MatTooltipModule,
        MatProgressBarModule,
        MatCardModule,
        MatDatepickerModule,
        MatListModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatRippleModule,
        FuseSidebarModule,

        FuseSharedModule,
        FuseHighlightModule,
        MatToolbarModule,
        ImageCropperModule,
        PixvsMatChipAutocompleteModule,
        MatTableModule
    ],
    providers: [
        FichasDataService,
        ReporteGrupoService,
        GrupoService,
        FechasHabilesService,
        HttpService,
        CalificacionesService,
        AsistenciaService,
    ]
})

export class ReporteAlumnosModule {
}