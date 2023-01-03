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
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatStepperModule } from '@angular/material/stepper';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { TranslateModule } from '@ngx-translate/core';
import { AlumnoComponent } from './alumno.component';
import { AlumnoService } from './alumno.service';
import { PixvsStepperVerticalModule } from '@pixvs/componentes/stepper/vertical/stepper.module';
import { PixvsPhonePickerModule } from '@pixvs/componentes/phone-picker/phone-picker.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxMaskModule } from 'ngx-mask';
import { AlumnosRepetidosDialogComponent } from './dialogs/alumnos-repetidos/alumnos-repetidos.dialog';
import { PdfModule } from '@pixvs/componentes/visor-pdf/visor-pdf.module';


const routes = [

    {
        path: 'alumnos/:handle', redirectTo: 'alumnos/:handle/', pathMatch: 'full'
    },
    {
        path: 'alumnos/:handle/:id',
        component: AlumnoComponent,
        resolve: {
            data: AlumnoService,
        },
        data: { url: '/api/v1/alumnos/listados/' }
    }
];

@NgModule({
    declarations: [
        AlumnoComponent,
        AlumnosRepetidosDialogComponent
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
        MatCardModule,
        MatDatepickerModule,
        MatStepperModule,
        ImageCropperModule,
        MatCheckboxModule,
        NgxMaskModule,

        FichaCrudModule, 
        PixvsMatSelectModule,
        PixvsStepperVerticalModule,
        PixvsPhonePickerModule,
        PdfModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        AlumnoService
    ],
	entryComponents: [
    ]
})
export class AlumnoModule {
}