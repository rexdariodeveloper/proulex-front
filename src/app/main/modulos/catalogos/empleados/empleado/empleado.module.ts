import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { EmpleadoComponent } from './empleado.component';
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


import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { UsuarioDatosAdicionalesModule } from '@app/main/componentes/usuario-datos-adicionales/usuario-datos-adicionales.module';

import { EmpleadoService } from './empleado.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { VerificarRfcComponent } from './dialogs/verificar-rfc/verificar-rfc.dialog';
import { AgregarCategoriaComponent } from './dialogs/agregar-categoria/agregar-categoria.dialog';
import { PixvsPhonePickerModule } from '@pixvs/componentes/phone-picker/phone-picker.module';
import { DocumentoDialogComponent } from './dialogs/documento/documento.dialog';



const routes = [

    {
        path: 'empleados/:handle', redirectTo: 'empleados/:handle/', pathMatch: 'full'
    },
    {
        path: 'empleados/:handle/:id',
        component: EmpleadoComponent,
        resolve: {
            data: EmpleadoService,
        },
		data: { url: '/api/v1/empleados/listados/' },
		canDeactivate: [PendingChangesGuard]
    }
];

@NgModule({
    declarations: [
        EmpleadoComponent,
        VerificarRfcComponent,
        AgregarCategoriaComponent,
        DocumentoDialogComponent
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
        MatTableModule,

        FichaCrudModule, 
        PixvsMatSelectModule,
        PixvsPhonePickerModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule,
        MatToolbarModule,
        UsuarioDatosAdicionalesModule,
        ImageCropperModule

    ],
    providers: [
		EmpleadoService,
		PendingChangesGuard
    ],
    entryComponents: [
        DocumentoDialogComponent
    ]
})
export class EmpleadoModule {
}