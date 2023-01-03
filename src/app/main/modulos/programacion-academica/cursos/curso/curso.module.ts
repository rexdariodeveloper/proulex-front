import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { CursoComponent } from './curso.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import {  MatDatepickerModule } from '@angular/material/datepicker';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FuseSidebarModule } from '@fuse/components';
import { PixvsStepperVerticalModule } from '@pixvs/componentes/stepper/vertical/stepper.module';


import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { PixvsMatChipAutocompleteModule } from '@pixvs/componentes/material/mat-chip-autocomplete/pixvs-mat-chip-autocomplete.module';
import { UsuarioDatosAdicionalesModule } from '@app/main/componentes/usuario-datos-adicionales/usuario-datos-adicionales.module';

import { CursoService } from './curso.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { AddExamenComponent } from './dialogs/add-examen/add-examen.dialog';
import { AddQuizzComponent } from './dialogs/add-quizz/add-quizz.dialog';
import { AddTareaComponent } from './dialogs/add-tarea/add-tarea.dialog';
import { PonderarTareasComponent } from './dialogs/ponderar-tareas/ponderar-tareas.dialog';
import { EditarQuizzComponent } from './dialogs/editar-quizz/editar-quizz.dialog';
import { PixvsYearCalendarModule } from '@pixvs/componentes/year-calendar/year-calendar.module';
import { CursoProgramacionAcademicaComercialPipe } from './pipes/programacion-academica-comercial.pipe';
import { AddlibroComponent } from './dialogs/add-libro/add-libro.dialog';
import { VerreglasComponent } from './dialogs/ver-reglas/ver-reglas.dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';



const routes = [

    {
        path: 'cursos/:handle', redirectTo: 'cursos/:handle/', pathMatch: 'full'
    },
    {
        path: 'cursos/:handle/:id',
        component: CursoComponent,
        resolve: {
            data: CursoService,
        },
		data: { url: '/api/v1/cursos/listados/' },
		canDeactivate: [PendingChangesGuard]
    }
];

@NgModule({
    declarations: [
        CursoComponent,
        AddExamenComponent,
        CursoProgramacionAcademicaComercialPipe,
        AddQuizzComponent,
        AddTareaComponent,
        PonderarTareasComponent,
        EditarQuizzComponent,
        AddlibroComponent,
        VerreglasComponent
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
        MatDialogModule,
        MatProgressBarModule,
        MatCardModule,
        MatDatepickerModule,
        MatListModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatDividerModule,
        FuseSidebarModule,
        PixvsStepperVerticalModule,
        MatPaginatorModule,
        DragDropModule,
        ScrollingModule,

        FichaCrudModule, 
        PixvsMatSelectModule,
        PixvsYearCalendarModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule,
        MatToolbarModule,
        UsuarioDatosAdicionalesModule,
        ImageCropperModule,
        PixvsMatChipAutocompleteModule,
        MatTableModule

    ],
    providers: [
		CursoService,
		PendingChangesGuard
    ]
})
export class CursoModule {
}