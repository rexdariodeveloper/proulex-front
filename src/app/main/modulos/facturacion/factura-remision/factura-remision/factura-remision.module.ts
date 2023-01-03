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
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FacturaRemisionService } from './factura-remision.service';
import { MatDialogModule } from '@angular/material/dialog';
import { ClientesRemisionesDetallesDialogComponent } from './dialogs/clientes-remisiones-detalles/clientes-remisiones-detalles.dialog';
import { FacturaRemisionComponent } from './factura-remision.component';
import { MontoCalculosModule } from '@app/main/directivas/monto-calculos/monto-calculos.module';
import { UtilsModule } from '@app/main/utils/utils.module';
import { RedondearDirectiveModule } from '@app/main/directivas/redondear/redondear.module';

const routes = [

    {
        path: 'factura-remision/:handle', redirectTo: 'factura-remision/:handle/', pathMatch: 'full'
    },
    {
        path: 'factura-remision/:handle/:id',
        component: FacturaRemisionComponent,
        resolve: {
            data: FacturaRemisionService,
        },
        data: { url: '/api/v1/cxcfacturas-remisiones/listados/' }
    }
];

@NgModule({
    declarations: [
        FacturaRemisionComponent,

        ClientesRemisionesDetallesDialogComponent
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
        MatDialogModule,

        FichaCrudModule, 
        PixvsMatSelectModule,
        PixvsStepperVerticalModule,
        PixvsPhonePickerModule,

        MontoCalculosModule,
		UtilsModule,
        RedondearDirectiveModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FacturaRemisionService
    ],
	entryComponents: [
    ]
})

export class FacturaRemisionModule {
}