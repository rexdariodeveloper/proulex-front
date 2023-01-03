import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { FuseSharedModule } from '@fuse/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartsModule } from 'ng2-charts';

import { LineChartBannerComponent } from '@pixvs/componentes/graficas/line-chart-banner.component';
import { ChartCardComponent } from '@pixvs/componentes/graficas/chart-card.component';
import { GroupedBarChartComponent } from '@pixvs/componentes/graficas/grouped-bar-chart.component';
import { StackedBarChartComponent } from '@pixvs/componentes/graficas/stacked-bar-chart.component';
import { ZoomableSunburstComponent } from '@pixvs/componentes/graficas/zoomable-sunburst.component';
import { SequenceSunburstComponent } from '@pixvs/componentes/graficas/sequence-sunburst.component';
import { ExampleChartComponent } from '@pixvs/componentes/graficas/example-chart.component';

import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './dashboard.service';
import { FuseWidgetModule } from '@fuse/components';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { TreemapChartComponent } from '@pixvs/componentes/graficas/treemap-chart.component';


const routes = [
    {
        path: '',
        component: DashboardComponent,
        resolve: {
            data: DashboardService,
        },
        data: { url: '/api/v1/dashboard/all' }
    }
];

@NgModule({
    declarations: [
        DashboardComponent,
        LineChartBannerComponent,
        ChartCardComponent,
        GroupedBarChartComponent,
        StackedBarChartComponent,
        ZoomableSunburstComponent,
        SequenceSunburstComponent,
        TreemapChartComponent,
        ExampleChartComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        ChartsModule,
        NgxChartsModule,
        MatIconModule,
        MatDividerModule,
        MatMenuModule,
        MatSelectModule,
        MatButtonModule,
        MatTooltipModule,
        MatTabsModule,
        MatTableModule,
        PixvsMatSelectModule,

        TranslateModule,
        FuseSharedModule,

        MatIconModule
    ],
    exports: [
        DashboardComponent
    ],
    providers: [
        DashboardService
    ]
})

export class DashboardModule {
}
