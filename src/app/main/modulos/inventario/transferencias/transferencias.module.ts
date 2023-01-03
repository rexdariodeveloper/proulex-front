import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { FuseHighlightModule, FuseSidebarModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { PixvsDynamicComponentModule } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.module';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { PixvsTablasModule } from '@pixvs/componentes/tablas/tablas.module';
import { FechaPipe } from '@pixvs/utils/pipes/fecha.pipe';
import { FichasDataService } from '@services/fichas-data.service';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxMaskModule } from 'ngx-mask';
import { ArticuloDialogComponent } from './transferencia/dialogs/articulo.dialog';
import { TransferenciaInvoicePrintComponent } from './transferencia/prints/invoice.print';
import { TransferenciaDetalleService } from './transferencia/transferencia-detalle.service';
import { TransferenciaComponent } from './transferencia/transferencia.component';
import { TransferenciaService } from './transferencia/transferencia.service';
import { TransferenciasComponent } from './transferencias/transferencias.component';

const routes = [
    {
        path: 'transferencias',
        component: TransferenciasComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/transferencias/all' }
    },
    {
        path: 'transferencias/:handle', redirectTo: 'transferencias/:handle/', pathMatch: 'full'
    },
    {
        path: 'transferencias/:handle/:id',
        component: TransferenciaComponent,
        resolve: {
            data: TransferenciaService,
        },
        data: { url: '/api/v1/transferencias/detalle/' }
    }
];

@NgModule({
    declarations: [
        TransferenciasComponent,
        TransferenciaComponent,
        ArticuloDialogComponent,
        TransferenciaInvoicePrintComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        MatIconModule,
        MatToolbarModule,
        MatRippleModule,
        MatButtonModule,
        MatSnackBarModule,
        MatMenuModule,
        MatTooltipModule,
        MatProgressBarModule,
        ScrollingModule,
        MatTabsModule,
        MatCardModule,
        MatInputModule,
        MatFormFieldModule,
        MatCheckboxModule,
        ImageCropperModule,
        NgxMaskModule,
        MatTableModule,

        TranslateModule,

        PixvsDynamicComponentModule,
        PixvsMatSelectModule,
        PixvsTablasModule,
        FichaCrudModule,

        FichaListadoModule,

        FuseSharedModule,
        FuseHighlightModule,
        FuseSidebarModule
    ],
    providers: [
        FichasDataService,
        TransferenciaService,
        TransferenciaDetalleService,
        FechaPipe
    ],
    entryComponents: [
        ArticuloDialogComponent
    ]
})

export class TransferenciaModule {
}