import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { PagoClientesListadoComponent } from './pago-clientes-listado/pago-clientes-listado.component';
import { PagoClientesModule } from './pago-clientes/pago-clientes.module';
import { PagoClientesService } from './pago-clientes-listado/pago-clientes.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UtilsModule } from '@app/main/utils/utils.module';
import { TranslateModule } from '@ngx-translate/core';
import { PixvsDynamicComponentModule } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.module';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { PixvsMatAccordionModule } from '@pixvs/componentes/mat-accordion/mat-accordion.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { PixvsTablasModule } from '@pixvs/componentes/tablas/tablas.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatCheckboxModule } from '@angular/material/checkbox';

const routes = [
    {
        path: 'pago-clientes',
        component: PagoClientesListadoComponent,
        resolve: {
            data: PagoClientesService,
        },
        data: { url: '/api/v1/cxcpago-clientes/all' }
    }
];

@NgModule({
    declarations: [
        PagoClientesListadoComponent
    ],
    imports: [
        CommonModule,
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
        FuseHighlightModule,

        FichaListadoModule,
        PagoClientesModule,

        FuseSharedModule,
        FuseHighlightModule
    ],
    providers: [
        FichasDataService,
        PagoClientesService
    ],
    entryComponents: [
    ]
})

export class PagoClientesListadoModule {
}