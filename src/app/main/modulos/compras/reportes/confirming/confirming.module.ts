import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule, FuseSidebarModule } from '@fuse/components';
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
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReporteConfirmingService } from './reporte/reporte.service';
import { ReporteConfirmingComponent } from './reporte/reporte.component';
import { FiltrosSidebarComponent } from './sidebars/filtros/filtros.component';
import { MatDividerModule } from '@angular/material/divider';

const routes = [
	{
		path: 'reportes/confirming',
		component: ReporteConfirmingComponent,
		resolve: {
			data: ReporteConfirmingService,
		},
		data: {
			url: '/api/v1/confirming/all'
		}
	}
];

@NgModule({
	declarations: [
		// Components
		ReporteConfirmingComponent,
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
        MatDividerModule,

        TranslateModule,

        PixvsDynamicComponentModule,
        
        FuseSidebarModule,
        FuseSharedModule,
        FuseHighlightModule

	],
	providers: [
		ReporteConfirmingService
	],
	entryComponents: [
	]
})

export class ReporteConfirmingModule {}