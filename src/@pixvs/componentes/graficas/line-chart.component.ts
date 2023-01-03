import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

//import {default as Annotation} from 'chartjs-plugin-annotation';
import { MatColors } from '@fuse/mat-colors';

@Component({
    selector: 'line-chart-ng2',
    template: `
    <div class="position-relative p-0" fxLayout="row" fxLayoutAlign="space-between center" *ngIf="title">
        <div fxLayout="column" fxLayoutAlign="start center" fxFlex="100" class="p-0">
            <h1>{{ title }}</h1>
        </div>
    </div>
    <div class="position-relative p-0" fxLayout="row" fxLayoutAlign="space-between center">
        <div class="flex">
            <div class="flex-item">
                <div style="display: block;">
                    <canvas
                        baseChart
                        style="width: 90vw; display: block;"
                        [height]="height"
                        [datasets]="lineChartData"
                        [labels]="lineChartLabels"
                        [chartType]="lineChartType"
                        >
                    </canvas>
                </div>
            </div>
        </div>
    </div>
    `,
    styles: []
})
export class LineChartNg2Component {
    //  (chartHover)="chartHovered($event)" (chartClick)="chartClicked($event)"
    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
    //Inputs
    @Input('title') title: string;
    @Input('height') height: number = 400;
    @Input('type') lineChartType: 'line' | 'bar' | 'horizontalBar' | 'radar' | 'doughnut' | 'polarArea' | 'bubble' | 'pie' | 'scatter' = 'line';
    @Input('data') lineChartData: any[];
    @Input('labels') lineChartLabels: string[];
    //@Input('labelType') labelType: 'currency' | 'number' | 'string' = 'number';
    //lineChartData: ChartConfiguration['data'];
    lineChartOptions: ChartConfiguration['options'] = null;

    constructor() {
        //Chart.pluginService.register(null);
    }

    ngOnInit(){
        this._registerCustomChartJSPlugin(this);
    }

    private _registerCustomChartJSPlugin(context): void
    {
        
        (window as any).Chart.plugins.register({
            afterDatasetsDraw: function(chart, easing): any {

                if (!chart.options.plugins.xLabelsOnTop || 
                    (chart.options.plugins.xLabelsOnTop && chart.options.plugins.xLabelsOnTop.active === false)
                   )
                { return; }

                const ctx = chart.ctx;

                chart.data.datasets.forEach(function(dataset, i): any {
                    const meta = chart.getDatasetMeta(i);
                    if ( !meta.hidden )
                    {
                        meta.data.forEach(function(element, index): any {

                            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                            const fontSize = 13;
                            const fontStyle = 'normal';
                            const fontFamily = 'Roboto, Helvetica Neue, Arial';
                            ctx.font = (window as any).Chart.helpers.fontString(fontSize, fontStyle, fontFamily);

                            let l;
                            switch(context.labelType){
                                case 'currency':
                                    l = context.currency.format(dataset.data[index]);  
                                break;
                                default:
                                    l = dataset.data[index];
                                break;
                            }
                            const dataString = ' '+l; 

                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            const padding = 20;
                            const startY = 24;
                            const position = element.tooltipPosition();
                            ctx.fillText(dataString, position.x, startY);

                            ctx.save();

                            ctx.beginPath();
                            ctx.setLineDash([5, 3]);
                            ctx.moveTo(position.x, startY + padding);
                            ctx.lineTo(position.x, position.y - padding);
                            ctx.strokeStyle = 'rgba(255,255,255,0.12)';
                            ctx.stroke();

                            ctx.restore();
                        });
                    }
                });
            }
        });
    }

}