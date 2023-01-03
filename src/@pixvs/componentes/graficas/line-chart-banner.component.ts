import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { MatColors } from '@fuse/mat-colors';
import { BaseChartDirective } from 'ng2-charts';

@Component({
    selector: 'line-chart-banner',
    template: `<div class="position-relative p-24" [ngClass]="setColor('600')"  fxLayout="row" fxLayoutAlign="space-between center">
                    <div fxLayout="column" fxLayoutAlign="start start">
                        <span class="h2" *ngIf="title">{{ title }}</span>
                        <span class="h5 secondary-text" *ngIf="!!subtitle">{{ subtitle }}</span>
                    </div>
                    <div fxLayout="row" fxLayoutAlign="start center">
                        <div *ngFor="let datasetLabel of datasetsLabels" 
                            class="py-8 px-12 border-radius-2 line-height-1 mr-8 cursor-pointer"
                            (click)="onSelection(datasetLabel)"
                            [ngClass]="setColor('700',(selected === datasetLabel))"
                        >
                            {{ datasetLabel }}
                        </div>
                    </div>
                </div>
                <div class="position-relative h-256 pb-16" [ngClass]="setColor('600')" *ngIf="!!selected">
                    <canvas baseChart
                            [datasets]="datasets[selected]"
                            [labels]="labels"
                            [colors]="colors"
                            [options]="options"
                            [chartType]="'line'">
                    </canvas>
                </div>`,
    styles: []
})
export class LineChartBannerComponent {
    //Inputs
    @Input('title') title: string;
    @Input('subtitle') subtitle: string;
    @Input('labels') labels: string[];
    @Input('datasets') datasets: any;
    @Input('datasetsLabels') datasetsLabels: string[];
    @Input('defaultDataset') defaultDataset: string;
    @Input('color') color: string;
    @Input('range') range: number[] = [100, 1000];
    @Input('labelType') labelType: 'currency' | 'number' | 'string' = 'number';

    @Output() selection: EventEmitter<any> = new EventEmitter();

    @ViewChild(BaseChartDirective) private _chart;

    colors: any[] = [{
        borderColor              : '#42a5f5',//blue.400
        backgroundColor          : '#42a5f5',//blue.400
        pointBackgroundColor     : '#1e88e5',//blue.600
        pointHoverBackgroundColor: '#1e88e5',//blue.600
        pointBorderColor         : '#ffffff',//blue.contrast.600
        pointHoverBorderColor    : '#ffffff' //blue.contrast.600
    }];

    options = {};

    selected: string = null;
    currency = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD',});

    constructor() { 
        
    }

    ngOnInit(){
        this._registerCustomChartJSPlugin(this);

        this.options = {
            spanGaps           : false,
            legend             : { display: false },
            maintainAspectRatio: false,
            layout             : { padding: { top: 32, left: 32, right: 32 }},
            elements           : {
                point: { radius: 4, borderWidth: 2, hoverRadius: 4, hoverBorderWidth: 2 },
                line : { tension: 0.3 }
            },
            scales             : {
                xAxes: [ { gridLines: { display: false, drawBorder: false, tickMarkLength: 18 }, ticks: { fontColor: '#ffffff'}}],
                yAxes: [ { display: false, ticks: { min: this.range[0], max: this.range[1] * 1.1, stepSize: this.range[1] / 100 }}]
            },
            plugins: { filler: { propagate: false }, xLabelsOnTop: { active: true }},
            tooltips: {
                callbacks: {
                    label: function(context) {                        
                        if (context.yLabel !== null) {
                            let l;
                            switch(this.labelType){
                                case 'currency':
                                    l = this.currency.format(context.yLabel);  
                                break;
                                default:
                                    l = context.yLabel;
                                break;
                            }
                            return ' '+l;
                        }
                        return null;
                    }.bind(this)
                }
            }
        };
        
        let colorSet = MatColors.getColor(this.color);
        
        this.colors[0].borderColor               = colorSet['400'];
        this.colors[0].backgroundColor           = colorSet['400'];
        this.colors[0].pointBackgroundColor      = colorSet['600'];
        this.colors[0].pointHoverBackgroundColor = colorSet['600'];
        this.colors[0].pointBorderColor          = colorSet['contrast']['600'];
        this.colors[0].pointHoverBorderColor     = colorSet['contrast']['600'];

        this.onSelection(this.defaultDataset);
    }

    private onSelection(selection){
        this.selected = selection;
        this.selection.emit(selection);
    }

    setColor(variant: string, condition: boolean = true) : string {
        if(!condition)
            return '';
        if(!!this.color){
            return this.color+'-'+variant;
        }
        return 'blue-'+variant;
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