import { Component, Input } from '@angular/core';
import { MatColors } from '@fuse/mat-colors';

@Component({
    selector: 'chart-card',
    template: `<div class="fuse-card auto-width mt-32" [ngClass.gt-sm]="'my-0'">
                    <div class="p-16 pb-0" fxLayout="row wrap" fxLayoutAlign="start end">
                        <div class="pr-16" class="w-100-p">
                            <div class="h3 secondary-text" *ngIf="!!title"> {{ title }}</div>
                        </div>
                        <div class="pr-16">
                            <div class="font-size-54 font-weight-300 line-height-1 mt-8" *ngIf="!!value || value == 0">{{ value }}</div>
                        </div>
                        <div class="py-4 font-size-16" fxLayout="row" fxLayoutAlign="start center" *ngIf="trending != 'none'">
                            <div fxFlex="row" fxLayoutAlign="start center" [ngClass]="trending == 'inverse'? 'red-fg' : 'green-fg'" *ngIf="getTrending(target, value) > 0">
                                <mat-icon [ngClass]="trending == 'inverse'? 'red-fg' : 'green-fg'" class="mr-4">trending_up</mat-icon>
                                <span>{{ getTrending(target, value) }}%</span>
                            </div>
                            <div fxFlex="row" fxLayoutAlign="start center" [ngClass]="trending == 'inverse'? 'green-fg' : 'red-fg'" *ngIf="getTrending(target, value) < 0">
                                <mat-icon [ngClass]="trending == 'inverse'? 'green-fg' : 'red-fg'" class="mr-4">trending_down</mat-icon>
                                <span>{{ getTrending(target, value) }}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="h-96 w-100-p" *ngIf="datasets">
                        <canvas baseChart
                                [datasets]  = "datasets"
                                [labels]    = "labels"
                                [colors]    = "colors"
                                [options]   = "options"
                                [chartType] = "chartType">
                        </canvas>
                    </div>
                </div>`,
    styles: []
})
export class ChartCardComponent {
    //Inputs
    @Input('title') title: string;
    @Input('value') value: number;
    @Input('target') target: number;
    @Input('trending') trending: 'none' | 'inverse' | 'natural'

    @Input('datasets') datasets: any;
    @Input('labels') labels: string[];
    @Input('color') color: string;
    @Input('chartType') chartType: string;

    colors: any[] = [{
        borderColor              : '#42a5f5',//blue.400
        backgroundColor          : '#42a5f5',//blue.400
        pointBackgroundColor     : '#1e88e5',//blue.600
        pointHoverBackgroundColor: '#1e88e5',//blue.600
        pointBorderColor         : '#ffffff',//blue.contrast.600
        pointHoverBorderColor    : '#ffffff' //blue.contrast.600
    }];

    options: any = {
        spanGaps: false,
        legend: { display: false },
        maintainAspectRatio: false,
        layout: { padding: { top: 24, left: 16, right: 16, bottom: 16 }},
        scales: {
            xAxes: [{ display: false }],
            yAxes: [{ display: false, ticks  : { min: 1, max: 100}}]
        }
    };


    constructor() {         
    }

    ngOnInit(){
        let colorSet = MatColors.getColor(this.color);
        
        this.colors[0].borderColor               = colorSet['400'];
        this.colors[0].backgroundColor           = colorSet['400'];
        this.colors[0].pointBackgroundColor      = colorSet['600'];
        this.colors[0].pointHoverBackgroundColor = colorSet['600'];
        this.colors[0].pointBorderColor          = colorSet['contrast']['600'];
        this.colors[0].pointHoverBorderColor     = colorSet['contrast']['600'];

        if(this.chartType == 'line'){
            this.options =  {
                spanGaps: false,
                legend: { display: false },
                maintainAspectRatio: false,
                layout: {
                    padding: { top: 24, left: 16, right: 16, bottom: 16 }
                },
                scales: {
                    xAxes: [{ display: false }],
                    yAxes: [{ display: false, ticks  : { /*min: 100, max: 500*/}}]
                },
                elements: {
                    point: { radius: 3, borderWidth: 2, hoverRadius: 5, hoverBorderWidth: 1 }, line : { tension: 0 }
                }
            };
        }
    }

    getTrending(base: number, value: number): number {
        if(base == 0)
            return 0;
        let trending = ((value - base) / base) * 100;
        return Math.round(trending * 100) / 100
    }
}