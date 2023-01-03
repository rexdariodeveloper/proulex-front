import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
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
import { MatStepperModule } from '@angular/material/stepper';

import { ImageCropperModule } from 'ngx-image-cropper';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';

import { TranslateModule } from '@ngx-translate/core';
import { PagoClientesService } from './pago-clientes.service';
import { PagoClientesComponent } from './pago-clientes.component';
import { PixvsDynamicComponentModule } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.module';
import { PixvsTablasModule } from '@pixvs/componentes/tablas/tablas.module';
import { UtilsModule } from '@app/main/utils/utils.module';
import { MatTableModule } from '@angular/material/table';
import { FacturasService } from './facturas.service';
import { PixvsMatAccordionModule } from '@pixvs/componentes/mat-accordion/mat-accordion.module';
import { MatCheckboxModule } from '@angular/material/checkbox';

const routes = [
    {
        path: 'pago-clientes/:handle', redirectTo: 'pago-clientes/:handle/', pathMatch: 'full'
    },
    {
        path: 'pago-clientes/:handle/:id',
        component: PagoClientesComponent,
        resolve: {
            data: PagoClientesService,
        },
        data: { url: '/api/v1/cxcpago-clientes/listados/' }
    }
];

@NgModule({
    declarations: [
        PagoClientesComponent
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
        MatStepperModule,
        MatTableModule,
        MatCheckboxModule,

        FichaCrudModule,
        ImageCropperModule,

        PixvsMatSelectModule,
        PixvsDynamicComponentModule,
        PixvsTablasModule,
        PixvsMatAccordionModule,

        TranslateModule,
        UtilsModule,

        FuseSharedModule,
        FuseHighlightModule
    ],
    providers: [
        PagoClientesService,
        FacturasService
    ],
    entryComponents: [
    ]
})

export class PagoClientesModule {
}