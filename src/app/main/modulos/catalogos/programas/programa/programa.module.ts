import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { ProgramaComponent } from './programa.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';


import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { PixvsMatChipAutocompleteModule } from '@pixvs/componentes/material/mat-chip-autocomplete/pixvs-mat-chip-autocomplete.module';
import { UsuarioDatosAdicionalesModule } from '@app/main/componentes/usuario-datos-adicionales/usuario-datos-adicionales.module';

import { ProgramaService } from './programa.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { AddlibroComponent } from './dialogs/add-libro/add-libro.dialog';
import { VerreglasComponent } from './dialogs/ver-reglas/ver-reglas.dialog';
//import { AddExamenComponent } from './dialogs/add-examen/add-examen.dialog';



const routes = [

    {
        path: 'programas/:handle', redirectTo: 'programas/:handle/', pathMatch: 'full'
    },
    {
        path: 'programas/:handle/:id',
        component: ProgramaComponent,
        resolve: {
            data: ProgramaService,
        },
		data: { url: '/api/v1/programas/listados/' },
		canDeactivate: [PendingChangesGuard]
    }
];

@NgModule({
    declarations: [
        ProgramaComponent,
        AddlibroComponent,
        VerreglasComponent
        //AddExamenComponent
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
        MatPaginatorModule,

        FichaCrudModule, 
        PixvsMatSelectModule,
        MatExpansionModule,

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
		ProgramaService,
		PendingChangesGuard
    ]
})
export class ProgramaModule {
}