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
import { FacturaGlobalService } from './factura-global.service';
import { FacturaGlobalComponent } from './factura-global.component';
import { NotaVentaDialogComponent } from './dialogs/nota-venta.dialog';
import { PixvsDynamicComponentModule } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.module';
import { PixvsTablasModule } from '@pixvs/componentes/tablas/tablas.module';
import { UtilsModule } from '@app/main/utils/utils.module';
import { MatTableModule } from '@angular/material/table';
import { OrdenesVentaService } from './ordenes-venta.service';
import { PixvsMatAccordionModule } from '@pixvs/componentes/mat-accordion/mat-accordion.module';
import { FacturacionDescargasService } from '../../descargas.service';
import { ImpuestosArticuloSATService } from '@app/main/services/impuestos-articulo-sat.service';
import { FacturasRelacionDetalleService } from '../../facturas-relacion-detalle.service';
import { FacturasRelacionService } from '../../facturas-relacion.service';

const routes = [
    {
        path: 'factura-global/:handle', redirectTo: 'factura-global/:handle/', pathMatch: 'full'
    },
    {
        path: 'factura-global/:handle/:id',
        component: FacturaGlobalComponent,
        resolve: {
            data: FacturaGlobalService,
        },
        data: { url: '/api/v1/cxcfacturas-global/listados/' }
    }
];

@NgModule({
    declarations: [
        FacturaGlobalComponent,
        NotaVentaDialogComponent
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
        FacturaGlobalService,
        OrdenesVentaService,
        FacturasRelacionService,
        FacturasRelacionDetalleService,
        ImpuestosArticuloSATService,
        FacturacionDescargasService
    ],
	entryComponents: [
    ]
})

export class FacturaGlobalModule {
}