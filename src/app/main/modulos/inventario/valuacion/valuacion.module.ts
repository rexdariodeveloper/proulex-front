import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import {  MatExpansionModule } from '@angular/material/expansion';
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
import { FuseConfirmDialogModule, FuseHighlightModule, FuseSidebarModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { PixvsDynamicComponentModule } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.module';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { PixvsMatAccordionModule } from '@pixvs/componentes/mat-accordion/mat-accordion.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { PixvsTablasModule } from '@pixvs/componentes/tablas/tablas.module';
import { PdfModule } from '@pixvs/componentes/visor-pdf/visor-pdf.module';
import { FechaPipe } from '@pixvs/utils/pipes/fecha.pipe';
import { FichasDataService } from '@services/fichas-data.service';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxMaskModule } from 'ngx-mask';
import { FiltrosReporteSidebarComponent } from './valuacion/sidebars/main/filtros-reporte-sidebar.component';
import { ValuacionComponent } from './valuacion/valuacion.component';

const routes = [
    {
        path: 'valuacion',
        component: ValuacionComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/valuacion/all' }
    },
    {
        path: 'valuacion/:handle', redirectTo: 'valuacion/:handle/', pathMatch: 'full'
    }
];

@NgModule({
    declarations: [
        ValuacionComponent,
        FiltrosReporteSidebarComponent
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
        PixvsMatAccordionModule,
        FichaCrudModule,

        FuseConfirmDialogModule,
        FuseSharedModule,
        FuseHighlightModule,
        FuseSidebarModule,
        PdfModule,

        MatExpansionModule
    ],
    providers: [
        FichasDataService,
        FechaPipe
    ],
    entryComponents: [
        FiltrosReporteSidebarComponent
    ]
})

export class ValuacionModule {
}