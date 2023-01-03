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
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxMaskModule } from 'ngx-mask';
import { CancelacionNotaVentaComponent } from './cancelacion-nota-venta.component';
import { CancelacionNotaVentaService } from './cancelacion-nota-venta.service';
import { MatTableModule } from '@angular/material/table';
import { NumeroFormatoPipe } from '@pixvs/utils/pipes/numero-formato.pipe';
import { UtilsModule } from '@app/main/utils/utils.module';
import { CancelacionNotaVentaDocumentosDialogComponent } from './dialogs/documentos/documentos.dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


const routes = [
    {
        path: 'cancelacion-nota-venta/:handle', redirectTo: 'cancelacion-nota-venta/:handle/', pathMatch: 'full'
    },
    {
        path: 'cancelacion-nota-venta/:handle/:id',
        component: CancelacionNotaVentaComponent,
        resolve: {
            data: CancelacionNotaVentaService,
        },
        data: { url: '/api/v1/orden-venta-cancelacion/listados/' }
    }
];

@NgModule({
    declarations: [
        CancelacionNotaVentaComponent,

        CancelacionNotaVentaDocumentosDialogComponent
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
        MatProgressSpinnerModule,

        FichaCrudModule, 
        PixvsMatSelectModule,
        UtilsModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        CancelacionNotaVentaService
    ],
    entryComponents: [
        CancelacionNotaVentaDocumentosDialogComponent
    ]
})
export class CancelacionNotaVentaModule {
}