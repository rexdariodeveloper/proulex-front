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
import { PixvsStepperVerticalModule } from '@pixvs/componentes/stepper/vertical/stepper.module';
import { PixvsPhonePickerModule } from '@pixvs/componentes/phone-picker/phone-picker.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxMaskModule } from 'ngx-mask';
import { RemisionComponent } from './remision.component';
import { RemisionService } from './remision.service';
import { ClienteRemisionDetalleDialogComponent } from './dialogs/detalle/detalle.dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RemisionSumaMontoPipe } from './pipes/suma-monto.pipe';
import { UtilsModule } from '@app/main/utils/utils.module';


const routes = [

    {
        path: 'remisiones/:handle', redirectTo: 'remisiones/:handle/', pathMatch: 'full'
    },
    {
        path: 'remisiones/:handle/:id',
        component: RemisionComponent,
        resolve: {
            data: RemisionService,
        },
        data: { url: '/api/v1/remisiones/listados/' }
    }
];

@NgModule({
    declarations: [
        RemisionComponent,

        ClienteRemisionDetalleDialogComponent,

        RemisionSumaMontoPipe
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
        MatTableModule,
        MatPaginatorModule,

        FichaCrudModule, 
        PixvsMatSelectModule,
        PixvsStepperVerticalModule,
        PixvsPhonePickerModule,

        TranslateModule,
        UtilsModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        RemisionService
    ],
	entryComponents: [
    ]
})
export class RemisionModule {
}