import { Component, OnInit, ElementRef, ViewEncapsulation, Input, SimpleChanges, OnChanges } from '@angular/core';

import * as d3 from 'd3';

export class Rect {
    x: number;
    y: number;
    w: number;
    h: number;

    data: any;
    children: Rect[];
    vertical: boolean;
    color: string | any;
    opacity: number;
    textColor: string | any;

    constructor(x:number, y:number, w:number, h:number){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.opacity = 1.0;
    }

    setColor(rgb: any){
        this.color = rgb;

        let color = rgb.replace('rgb(','').replace(')','').split(',');
        let bright = (Number(color[0])*0.2126)+(Number(color[1])*0.7152)+(Number(color[2])*0.0722);
        if(bright/ 255 > 0.5)
            this.textColor =  'rgb(0,0,0)';
        else
            this.textColor = 'rgb(255,255,255)';
    }
}

@Component({
    selector: 'treemap-chart',
    encapsulation: ViewEncapsulation.None,
    template: ` <svg [attr.width]="width" [attr.height]="height">
                    <g *ngIf="!!dataset && dataset.length == 0">
                        <rect [attr.x]="0" [attr.y]="0" [attr.width]="width" [attr.height]="height" [attr.fill]="'white'">
                        </rect>
                        <text [attr.x]="width/2" [attr.y]="height/2" [attr.fill]="'black'" [attr.text-anchor]="'middle'"
                            style="pointer-events: none; text-rendering: optimizeLegibility;">
                            No hay datos para mostrar
                        </text>
                    </g>
                    <g *ngFor="let rectangle of dataset">
                        <rect
                            [attr.x]="rectangle.x"
                            [attr.y]="rectangle.y"
                            [attr.width]="rectangle.w"
                            [attr.height]="rectangle.h"
                            [attr.fill]="rectangle.color"
                            [attr.opacity]="rectangle.opacity"
                            (mouseover)= "modifyOpacity(rectangle,0.5)"
                            (mouseout) = "modifyOpacity(rectangle,1.0)"
                            style="stroke-width:3; stroke:'white'"
                            matTooltip="$ {{(rectangle.data.value).toFixed(2) | mask:'separator.2':',' }} {{ rectangle.data.name }}">
                        </rect>
                        <text *ngIf="rectangle.w >= 200 && rectangle.h >= 80"
                            [attr.x]="rectangle.x + 10"
                            [attr.y]="rectangle.y + 20"
                            [attr.width]="rectangle.w"
                            [attr.fill]="rectangle.textColor"
                            style="pointer-events: none; text-rendering: optimizeLegibility;">
                            $ {{(rectangle.data.value).toFixed(2) | mask:'separator.2':',' }}
                        </text>
                        <text *ngIf="rectangle.w >= 200 && rectangle.h >= 80"
                            [attr.x]="rectangle.x + 10"
                            [attr.y]="rectangle.y + 40"
                            [attr.width]="rectangle.w - 10"
                            [attr.fill]="rectangle.textColor"
                            style="pointer-events: none; text-rendering: optimizeLegibility;">
                            {{ rectangle.data.name }}
                        </text>
                    </g>
                </svg>`
})
export class TreemapChartComponent implements OnInit, OnChanges {

    @Input() data: any[];
    @Input() color: string;
    @Input() labelType: 'currency' | 'number' | 'string' = 'number';
    @Input() width;
    @Input() height;

    dataset: any[] = [];

    constructor(private elRef: ElementRef) {
    }

    ngOnInit() {
        //if(!!this.data)
        //    this.createChart(this.data);
    }

    ngOnChanges(changes: SimpleChanges) {

        if(changes?.data)
            this.updateChart(changes.data.currentValue);
        else
            this.updateChart(this.data);
    }

    private getKeys(array, key) {
        let d = array.reduce(function(rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
        return Object.keys(d);
    }

    private setSchema(color: string = '', keys: string[]): any[]{
        let schema = [];
        let scale;
        //Find natural scales to avoid color white
        let index = ['blue','green','red','orange','purple','gender'].findIndex( c => c == color);
        if(index != -1)
            scale = d3.scaleBand().domain(keys.filter(k => k != 'name')).range([0.2,0.8]);
        else
            scale = d3.scaleBand().domain(keys.filter(k => k != 'name')).range([0,1]);
        if(color == 'blue'        )  { keys.filter(k => k != 'name').forEach(k => schema.push(d3.interpolateBlues(scale(k))));}
        else if(color == 'green'  )  { keys.filter(k => k != 'name').forEach(k => schema.push(d3.interpolateGreens(scale(k))));}
        else if(color == 'red'    )  { keys.filter(k => k != 'name').forEach(k => schema.push(d3.interpolateReds(scale(k))));}
        else if(color == 'orange' )  { keys.filter(k => k != 'name').forEach(k => schema.push(d3.interpolateOranges(scale(k))));}
        else if(color == 'purple' )  { keys.filter(k => k != 'name').forEach(k => schema.push(d3.interpolatePurples(scale(k))));}
        else if(color == 'cool'   )  { keys.filter(k => k != 'name').forEach(k => schema.push(d3.interpolateCool(scale(k))));}
        else if(color == 'rainbow')  { keys.filter(k => k != 'name').forEach(k => schema.push(d3.interpolateRainbow(scale(k))));}
        else if(color == 'sinebow')  { keys.filter(k => k != 'name').forEach(k => schema.push(d3.interpolateSinebow(scale(k))));}
        else if(color == 'turbo'  )  { keys.filter(k => k != 'name').forEach(k => schema.push(d3.interpolateTurbo(scale(k))));}
        else if(color == 'spectre')  { keys.filter(k => k != 'name').forEach(k => schema.push(d3.interpolateSpectral(scale(k))));}
        else if(color == 'gender' )  { keys.slice(1).reverse().forEach(k => schema.push(d3.interpolateRdBu(scale(k))));}
        else { keys.filter(k => k != 'name').forEach(k => schema.push(d3.interpolateGreys(scale(k))));}
        
        return schema;
    }

    private normalize(data: any[], height: number, width: number): any[] {
        let total = data.map((d) => d.value).reduce((acc,cur) => acc + cur, 0);
        return data.map((d)=>{
            d['nvalue'] = ((d.value * height * width) / total);
            return d;
        });
    }

    private getLayout(h: number,w: number){
        if(h > w)
            return {vertical: false, value: w};
        return {vertical: true, value: h};
    }

    private getRatio(total: number, area: number, valor: number){
        let proporcion = area / total;
        let ancho = area / (valor * proporcion);
        let ratio = Math.abs(1 - ((valor * proporcion) / ancho));

        return {ratio: ratio, ancho: ancho, proporcion: proporcion};
    }

    private squarified(data, dx, dy, width, height, parentColor = null){

        let keys = this.getKeys(data,'name');
        let color = d3.scaleOrdinal()
                        .domain(data.map(d => d.name))
                        .range(this.setSchema(this.color,keys))
                        .unknown("#ccc");

        let rects: Rect[] = [];
        let wt = width;
        let ht = height;
        let inicio = 0;

        do{
            let total = 0;
            let layout = this.getLayout(ht,wt);
            let ratio = null;
            let fin = inicio;
            let newRow = false;
            do {
                total += data[fin].nvalue;
                let r0 = this.getRatio(total, data[fin].nvalue, layout.value);
                let r1 = this.getRatio(total + data[fin].nvalue, data[fin + 1]?.nvalue, layout.value);
                if(r0.ratio < (r1?.ratio || Number.POSITIVE_INFINITY)){
                    ratio = r0;
                    newRow = true;
                }
                fin++;
            } while(!newRow && fin < data.length - 1);

            let x0 = Math.round(width - wt);
            let y0 = Math.round(height - ht);

            //console.log({wt: Math.round(width - wt), ht: Math.round(height - ht)});

            for(let i = inicio; i < fin; i++){
                let v0 = ratio?.ancho;
                let v1 = (data[i].nvalue / total) * layout.value;

                if(layout.vertical){
                    let rect = new Rect(dx + x0, dy + y0, Math.round(v0), Math.round(v1));
                    rect.data = data[i];
                    rect.setColor(parentColor || color(rect.data.name));
                    if(data[i]?.children && data[i]?.children.length > 0){
                        let norm = this.normalize(data[i].children,rect.h,rect.w);
                        let children = this.squarified(norm,rect.x,rect.y,rect.w,rect.h,rect.color);
                        rect.children = children;
                    }
                    rect.vertical = layout.vertical;
                    rects.push(rect);
                    //console.log({x: dx + x0, y: dy + y0, h: Math.round(v1), w: Math.round(v0), vertical: layout.vertical});
                    y0 += rect.h;
                }
                else{
                    let rect = new Rect(dx + x0, dy + y0, Math.round(v1), Math.round(v0));
                    rect.data = data[i];
                    rect.setColor(parentColor || color(rect.data.name));
                    if(data[i]?.children && data[i]?.children.length > 0){
                        let norm = this.normalize(data[i].children,rect.h,rect.w);
                        let children = this.squarified(norm,rect.x,rect.y,rect.w,rect.h,rect.color);
                        rect.children = children;
                    }
                    rect.vertical = layout.vertical;
                    rects.push(rect);
                    //console.log({x: dy + y0, y: dx + x0, h: Math.round(v0), w: Math.round(v1), vertical: layout.vertical});
                    x0 += rect.w;
                }
            }
            if(layout.vertical)
                wt -= ratio?.ancho;
            else
                ht -= ratio?.ancho;
            inicio = fin;
        }while(inicio < data.length)

        return rects;
    }

    private flattened(data){
        let flatten: Rect[] = [];
        data.forEach(d => {
            if(d?.children && d.children.length > 0)
                flatten = flatten.concat(...this.flattened(d.children));
            else
                flatten.push(d);
        });
        return flatten;
    }

    public modifyOpacity(element, value) {
        element.opacity = value;
    }

    public createChart(data) {
        let norm = this.normalize(data, this.height, this.width);
        let s = this.squarified(norm,0,0,this.width,this.height);
        this.dataset = this.flattened(s);
    }

    public updateChart(d: any[]) {
        if(d && d.length > 0)
            this.createChart(d);
        else
            this.dataset = [];
    }
}