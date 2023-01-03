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
import { FacturaMiscelaneaService } from './factura-miscelanea.service';
import { FacturaMiscelaneaComponent } from './factura-miscelanea.component';
import { ConceptoDialogComponent } from './dialogs/concepto.dialog';
import { PixvsDynamicComponentModule } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.module';
import { PixvsTablasModule } from '@pixvs/componentes/tablas/tablas.module';
import { UtilsModule } from '@app/main/utils/utils.module';
import { MatTableModule } from '@angular/material/table';
import { TablaService } from './tabla.service';
import { FacturacionDescargasService } from '../../descargas.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FacturaNotaVentaService } from '../../factura-nota-venta/factura-nota-venta/factura-nota-venta.service';
import { ImpuestosArticuloSATService } from '@app/main/services/impuestos-articulo-sat.service';
import { FacturasRelacionService } from '../../facturas-relacion.service';
import { FacturasRelacionDetalleService } from '../../facturas-relacion-detalle.service';

const routes = [
    {
        path: 'factura-miscelanea/:handle', redirectTo: 'factura-miscelanea/:handle/', pathMatch: 'full'
    },
    {
        path: 'factura-miscelanea/:handle/:id',
        component: FacturaMiscelaneaComponent,
        resolve: {
            data: FacturaMiscelaneaService,
        },
        data: { url: '/api/v1/cxcfacturas-miscelanea/listados/' }
    }
];

@NgModule({
    declarations: [
        FacturaMiscelaneaComponent,
        ConceptoDialogComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatCheckboxModule,
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

        TranslateModule,
        UtilsModule,

        FuseSharedModule,
        FuseHighlightModule
    ],
    providers: [
        FacturaMiscelaneaService,
        FacturaNotaVentaService,
        FacturasRelacionService,
        FacturasRelacionDetalleService,
        TablaService,
        FacturacionDescargasService,
        ImpuestosArticuloSATService
    ],
    entryComponents: [
    ]
})

export class FacturaMiscelaneaModule {
}