import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule, FuseSidebarModule } from '@fuse/components';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TranslateModule } from '@ngx-translate/core';
import { PixvsDynamicComponentModule } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { NgxMaskModule } from 'ngx-mask';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PixvsTablasModule } from '@pixvs/componentes/tablas/tablas.module';
import { ReporteAntiguedadSaldosComponent } from './reporte/reporte.component';
import { ReporteAntiguedadSaldosService } from './reporte/reporte.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FiltrosSidebarComponent } from './sidebars/filtros/filtros.component';
import { SumaPipe } from '@pixvs/utils/pipes/suma.pipe';
import { PdfModule } from '@pixvs/componentes/visor-pdf/visor-pdf.module';

const routes = [
	{
		path: 'reportes/antiguedad-saldos',
		component: ReporteAntiguedadSaldosComponent,
		resolve: {
			data: ReporteAntiguedadSaldosService,
		},
		data: {
			url: '/api/v1/reporte-antiguedad-saldos/filtros'
		}
	}
];

@NgModule({
	declarations: [
		// Components
		ReporteAntiguedadSaldosComponent,
		FiltrosSidebarComponent
	],
	imports: [
		CommonModule,
        RouterModule.forChild(routes),

        MatIconModule,
        MatPaginatorModule,
        MatTableModule,
        MatToolbarModule,
        MatRippleModule,
        MatSortModule,
        MatButtonModule,
        MatSnackBarModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatTabsModule,
        MatInputModule,
        MatDatepickerModule,
        MatMenuModule,
        MatTooltipModule,
        MatProgressBarModule,
        CdkTableModule,
        CdkTreeModule,
        DragDropModule,
        ScrollingModule,

        TranslateModule,

        PixvsDynamicComponentModule,
        
        FuseSidebarModule,
        FuseSharedModule,
        FuseHighlightModule,
        PdfModule

	],
	providers: [
		ReporteAntiguedadSaldosService,
        SumaPipe
	],
	entryComponents: [
	]
})

export class ReporteAntiguedadSaldosModule {}