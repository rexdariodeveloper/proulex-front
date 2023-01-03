import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule, registerLocaleData } from '@angular/common';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
import { ArticuloComponenteNodoComponent } from './pedido/components/articulo-componente-nodo/articulo-componente-nodo.component';

import { ArticuloDialogComponent } from './pedido/dialogs/articulo/articulo.dialog';
import { ComponentesDialogComponent } from './pedido/dialogs/componentes/componentes.dialog';
import { PedidoDetalleService } from './pedido/pedido-detalle.service';
import { PedidoComponent } from './pedido/pedido.component';
import { PedidoService } from './pedido/pedido.service';
import { PedidosComponent } from './pedidos/pedidos.component';

import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';

const routes = [
    {
        path: 'pedidos',
        component: PedidosComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/pedidos/all' }
    },
    {
        path: 'pedidos/:handle', redirectTo: 'pedidos/:handle/', pathMatch: 'full'
    },
    {
        path: 'pedidos/:handle/:id',
        component: PedidoComponent,
        resolve: {
            data: PedidoService,
        },
        data: { url: '/api/v1/pedidos/detail/' }
    }
];

@NgModule({
    declarations: [
        PedidosComponent,
        PedidoComponent,
        ArticuloDialogComponent,
		ArticuloComponenteNodoComponent,
		ComponentesDialogComponent
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
        MatTableModule,

        TranslateModule,

        PixvsDynamicComponentModule,
        PixvsMatSelectModule,
        PixvsTablasModule,
        FichaCrudModule,

        FichaListadoModule,

        FuseSharedModule,
        FuseHighlightModule,
        FuseSidebarModule,

        PixvsBloqueoPantallaModule        
    ],
    providers: [
        FichasDataService,
        PedidoService,
        PedidoDetalleService,
        FechaPipe
    ],
    entryComponents: [
        ArticuloDialogComponent
    ]
})

export class PedidoModule {
}