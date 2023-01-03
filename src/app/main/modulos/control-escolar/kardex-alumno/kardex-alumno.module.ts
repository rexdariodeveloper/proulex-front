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
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { FuseConfirmDialogModule, FuseHighlightModule, FuseSidebarModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';
import { PixvsDynamicComponentModule } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.module';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { PixvsTablasModule } from '@pixvs/componentes/tablas/tablas.module';
import { VisorPdfComponent } from '@pixvs/componentes/visor-pdf/visor-pdf.component';
import { PdfModule } from '@pixvs/componentes/visor-pdf/visor-pdf.module';
import { FechaPipe } from '@pixvs/utils/pipes/fecha.pipe';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxMaskModule } from 'ngx-mask';
import { KardexAlumnoComponent } from './kardex-alumno/kardex-alumno.component';
import { KardexAlumnoService } from './kardex-alumno/kardex-alumno.service';
import { FiltrosKardexAlumnoSidebarComponent } from './kardex-alumno/sidebars/main/filtros-reporte-sidebar.component';

const routes = [
    {
        path: 'kardex-alumno',
        component: KardexAlumnoComponent,
        resolve: {
            data: KardexAlumnoService,
        },
        data: { url: '/api/v1/kardex-alumno/all' }
    }
];

@NgModule({
    declarations: [
        KardexAlumnoComponent,
        FiltrosKardexAlumnoSidebarComponent
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
        MatTableModule,
        MatPaginatorModule,
        NgxMaskModule,

        TranslateModule,

        PixvsDynamicComponentModule,
        PixvsMatSelectModule,
        PixvsTablasModule,
        FichaCrudModule,

        FichaListadoModule,

        FuseConfirmDialogModule,
        FuseSharedModule,
        FuseHighlightModule,
        FuseSidebarModule,
        PdfModule,
        PixvsBloqueoPantallaModule
    ],
    providers: [
        KardexAlumnoService,
        FechaPipe
    ],
    entryComponents: [
        FiltrosKardexAlumnoSidebarComponent
    ]
})

export class KardexAlumnoModule {
}