import { NgModule } from '@angular/core';
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

import { CalificacionesComponent } from './calificaciones.component';
import { CalificacionesService } from './calificaciones.service';
import { CalificacionesHistorialComponent } from './calificaciones-historial.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { ErroresDialogComponent } from './dialogs/errores/errores.dialog';




const routes = [

    {
        path: 'calificaciones/:handle', redirectTo: 'calificaciones/:handle/', pathMatch: 'full'
    },
    {
        path: 'calificaciones/:handle/:id',
        component: CalificacionesComponent,
        resolve: {
            data: CalificacionesService,
        },
        data: { url: '/api/v1/captura_calificaciones/detalle/' }
    }
];

@NgModule({
    declarations: [
        CalificacionesComponent,
        CalificacionesHistorialComponent,
        ErroresDialogComponent
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
        MatExpansionModule,
        NgxMaskModule,

        FichaCrudModule, 
        PixvsMatSelectModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        CalificacionesService
    ],
	entryComponents: [
        ErroresDialogComponent
    ]
})
export class CalificacionesModule {
}