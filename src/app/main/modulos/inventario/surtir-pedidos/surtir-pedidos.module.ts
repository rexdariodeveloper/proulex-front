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

import { SurtirPedidosComponent } from './surtir-pedidos/surtir-pedidos.component';
import { SurtirPedidoService } from './surtir-pedido/surtir-pedido.service';
import { ArticuloDialogComponent } from './surtir-pedido/dialogs/articulo.dialog';
import { SurtirPedidoComponent } from './surtir-pedido/surtir-pedido.component';
import { NgxPrintModule } from 'ngx-print';
import { MatTableModule } from '@angular/material/table';
import { PedidoService } from './surtir-pedido/pedido.service';
import { PedidoComentariosDialogComponent } from './surtir-pedido/dialogs/comentarios/comentarios.dialog';
import { SurtirPedidosComponentesDialogComponent } from './surtir-pedido/dialogs/componentes/componentes.dialog';
import { SurtirPedidosArticuloComponenteNodoComponent } from './surtir-pedido/components/articulo-componente-nodo/articulo-componente-nodo.component';
import { InvoicePrintComponent } from './surtir-pedido/prints/invoice.print';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const routes = [
    {
        path: 'surtir',
        component: SurtirPedidosComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/pedidos/supply' }
    },
    {
        path: 'surtir/:handle', redirectTo: 'surtir/:handle/', pathMatch: 'full'
    },
    {
        path: 'surtir/:handle/:id',
        component: SurtirPedidoComponent,
        resolve: {
            data: SurtirPedidoService,
        },
        data: { url: '/api/v1/pedidos/supply/detail/' }
    }
];

@NgModule({
    declarations: [
        SurtirPedidosComponent,
        SurtirPedidoComponent,
        ArticuloDialogComponent,
        PedidoComentariosDialogComponent,
		SurtirPedidosComponentesDialogComponent,
        SurtirPedidosArticuloComponenteNodoComponent,
        InvoicePrintComponent
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
		MatProgressSpinnerModule,
        ImageCropperModule,
        NgxMaskModule,
        NgxPrintModule,
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
        SurtirPedidoService,
        FechaPipe,
        PedidoService
    ],
    entryComponents: [
        ArticuloDialogComponent,
        PedidoComentariosDialogComponent,
        SurtirPedidosComponentesDialogComponent,
        InvoicePrintComponent
    ]
})

export class SurtirPedidoModule {
}