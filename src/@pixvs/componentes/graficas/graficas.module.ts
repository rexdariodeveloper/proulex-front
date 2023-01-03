import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartsModule } from 'ng2-charts';
import { LineChartBannerComponent } from '@pixvs/componentes/graficas/line-chart-banner.component';
import { ChartCardComponent } from '@pixvs/componentes/graficas/chart-card.component';
import { GroupedBarChartComponent } from '@pixvs/componentes/graficas/grouped-bar-chart.component';
import { ExampleChartComponent } from '@pixvs/componentes/graficas/example-chart.component';
import { StackedBarChartComponent } from '@pixvs/componentes/graficas/stacked-bar-chart.component';
import { ZoomableSunburstComponent } from '@pixvs/componentes/graficas/zoomable-sunburst.component';
import { SequenceSunburstComponent } from '@pixvs/componentes/graficas/sequence-sunburst.component';
import { TreemapChartComponent } from '@pixvs/componentes/graficas/treemap-chart.component';
import { LineChartNg2Component } from '@pixvs/componentes/graficas/line-chart.component';

import { MatIconModule } from '@angular/material/icon';
/*import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatRippleModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
*/

@NgModule({
    declarations: [
		//PixvsTablaSimpleComponent,
		//PixvsTablaDetallesComponent
        LineChartBannerComponent,
        ChartCardComponent,
        GroupedBarChartComponent,
        StackedBarChartComponent,
        ZoomableSunburstComponent,
        SequenceSunburstComponent,
        LineChartNg2Component,
        TreemapChartComponent,
        ExampleChartComponent
    ],
    imports: [
        CommonModule,
        RouterModule,

        TranslateModule,
        ChartsModule,
        NgxChartsModule,

        FuseSharedModule,
        FuseHighlightModule
    ],
    entryComponents: [
        LineChartBannerComponent,
        ChartCardComponent,
        GroupedBarChartComponent,
        StackedBarChartComponent,
        ZoomableSunburstComponent,
        SequenceSunburstComponent,
        LineChartNg2Component,
        TreemapChartComponent,
        ExampleChartComponent
    ],
    exports: [
		//PixvsTablaSimpleComponent,
		//PixvsTablaDetallesComponent
        LineChartBannerComponent,
        ChartCardComponent,
        GroupedBarChartComponent,
        StackedBarChartComponent,
        ZoomableSunburstComponent,
        SequenceSunburstComponent,
        LineChartNg2Component,
        TreemapChartComponent,
        ExampleChartComponent
    ]
})
export class GraficasModule {
}
