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
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { FuseConfirmDialogModule, FuseHighlightModule, FuseSidebarModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { PixvsDynamicComponentModule } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.module';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { PixvsMatTreeModule } from '@pixvs/componentes/material/mat-tree/pixvs-mat-tree.module';
import { PixvsTablasModule } from '@pixvs/componentes/tablas/tablas.module';
import { FechaPipe } from '@pixvs/utils/pipes/fecha.pipe';
import { FichasDataService } from '@services/fichas-data.service';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatListModule } from '@angular/material/list';
import { NgxMaskModule } from 'ngx-mask';
import { ParametrosEmpresaComponent } from './parametros-empresa/parametros-empresa.component';
import { ParametrosEmpresaService } from './parametros-empresa/parametros-empresa.service';
import { AgregarDiaComponent } from './parametros-empresa/dialogs/agregar-dia/agregar-dia.dialog';

const routes = [
    {
        path: 'parametros-empresa',
        component: ParametrosEmpresaComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/v1/parametros-empresa/listados' }
    }
];

@NgModule({
    declarations: [
        ParametrosEmpresaComponent,
        AgregarDiaComponent
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
        MatListModule,
        MatDialogModule,

        TranslateModule,

        PixvsDynamicComponentModule,
        PixvsMatSelectModule,
        PixvsTablasModule,
        FichaCrudModule,
        PixvsMatTreeModule,

        FichaListadoModule,

        FuseConfirmDialogModule,
        FuseSharedModule,
        FuseHighlightModule,
        FuseSidebarModule,
        MatRadioModule
    ],
    providers: [
        FichasDataService,
        FechaPipe,
        ParametrosEmpresaService
    ],
    entryComponents: [AgregarDiaComponent]
})

export class ParametrosEmpresaModule {
}