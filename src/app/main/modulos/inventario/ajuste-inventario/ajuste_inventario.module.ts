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
import { AjusteInventarioComponent } from './ajuste-inventario/ajuste-inventario.component';
import { AjusteInventarioService } from './ajuste-inventario/ajuste-inventario.service';
import { AjustesInventarioComponent } from './ajustes-inventario/ajustes-inventario.component';

const routes = [
    {
        path: 'ajuste-inventario',
        component: AjustesInventarioComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/inventario-movimiento/ajuste-inventario/all' }
    },
    {
        path: 'ajuste-inventario/:handle', redirectTo: 'ajuste-inventario/:handle/', pathMatch: 'full'
    },
    {
        path: 'ajuste-inventario/:handle/:id',
        component: AjusteInventarioComponent,
        resolve: {
            data: AjusteInventarioService,
        },
        data: { url: '/api/v1/inventario-movimiento/ajuste-inventario/detalle/' }
    }
];

@NgModule({
    declarations: [
        AjustesInventarioComponent,
        AjusteInventarioComponent
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
        AjusteInventarioService,
        FechaPipe
    ]
})

export class AjusteInventarioModule {
}