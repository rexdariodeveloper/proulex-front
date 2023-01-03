import { LOCALE_ID, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatStepperModule } from '@angular/material/stepper';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { TranslateModule } from '@ngx-translate/core';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxMaskModule } from 'ngx-mask';

import LocaleEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';

import { AsistenciaComponent } from './asistencia.component';
import { AsistenciaService } from './asistencia.service';
import { TipoAsistenciaDialogComponent } from './dialogs/tipo-asistencia/tipo-asistencia.dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatRadioModule } from '@angular/material/radio';
import { ComentarioDialogComponent } from './dialogs/comentario/comentario.dialog';
import { FechasHabilesService } from '@services/fechas-habiles.service';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';

const routes = [

    {
        path: 'asistencias/:handle', redirectTo: 'asistencias/:handle/', pathMatch: 'full'
    },
    {
        path: 'asistencias/:handle/:id',
        component: AsistenciaComponent,
        resolve: {
            data: AsistenciaService,
        },
        data: { url: '/api/v1/captura_asistencia/detalle/'},
        canDeactivate: [PendingChangesGuard]
    }
];

registerLocaleData(LocaleEs, 'es');

@NgModule({
    declarations: [
        AsistenciaComponent,
        TipoAsistenciaDialogComponent,
        ComentarioDialogComponent,
    ],
    imports: [
        RouterModule.forChild(routes),

        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatTabsModule,
        MatInputModule,
        MatMenuModule,
        MatTooltipModule,
        MatProgressBarModule,
        MatTableModule,
        MatDatepickerModule,
        MatStepperModule,
        MatCheckboxModule,
        MatRadioModule,
        MatExpansionModule,
        NgxMaskModule,
        MatToolbarModule,
        MatDialogModule,

        FichaCrudModule, 
        PixvsMatSelectModule,
        PixvsBloqueoPantallaModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        AsistenciaService,
        { provide: LOCALE_ID, useValue: 'es'},
        FechasHabilesService,
        PendingChangesGuard
    ],
    entryComponents: [
        TipoAsistenciaDialogComponent,
        ComentarioDialogComponent,
    ]
})
export class AsistenciaModule {
}