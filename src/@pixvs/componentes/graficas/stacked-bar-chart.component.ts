import { Component, OnInit, ElementRef, ViewEncapsulation, Input, SimpleChanges, OnChanges } from '@angular/core';

import * as d3 from 'd3';

@Component({
    selector: 'stacked-bar-chart',
    encapsulation: ViewEncapsulation.None,
    template: `<svg></svg>`
})
export class StackedBarChartComponent implements OnInit, OnChanges {

    @Input() position: 'vertical' | 'horizontal';
    @Input() data: any[];
    @Input() labels: string[];
    @Input() groupBy: string;
    @Input() color: string;
    @Input() labelType: 'currency' | 'number' | 'string' = 'number';

    hostElement;
    svg;
    margin = {top: 10, right: 20, bottom: 20, left: 20};
    width  = 520;
    height = 500;
    g;

    constructor(private elRef: ElementRef) {
        this.hostElement = this.elRef.nativeElement;
    }

    ngOnInit() {
        if(!!this.data)
            this.updateChart(this.data);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!!changes.data) {
            this.updateChart(changes.data.currentValue);
        }
    }

    private merge(data){
        let merged = [];
        let labels = this.labels;
        data.forEach( d => {
            let index = merged.findIndex( item => item[labels[1]] == d[labels[1]]);
            if(index == -1){
                let object = {};
                object[labels[1]] = d[labels[1]];
                object[d[labels[0]]] = d[labels[2]];
                merged.push(object)
            }else {
                merged[index][d[labels[0]]] = d[labels[2]];
            }
        });
        return merged;
    }

    private processData(data){
        data = this.merge(data);
        let keys = Object.keys(data[0]);
        let max = 0;
        data.forEach(row => {
            keys.filter(e => e != this.groupBy).forEach(column => {
                if(row[column] > max) max = row[column];
            });
        });

        keys = Object.keys(data[0]);

        return {'data': data, 'keys': keys, 'max': max};
    }

    private createChart(data: any) {
        let width  = this.width;
        let height = this.height;
        const margin = this.margin;

        d3.select(this.hostElement).select('svg').remove();

        this.svg = d3.select(this.hostElement)
            .append('svg')
            .attr("width", '100%')
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        let svg = this.svg;
        let group = this.groupBy;
        let serie = data.data;
        let keys = data.keys;

        width  = parseInt(d3.select(this.hostElement).select('svg').style("width"))  - margin.left - margin.right;
        height = parseInt(d3.select(this.hostElement).select('svg').style("height")) - margin.top  - margin.bottom;

        //let keys = ["mes", "2014", "2015", "2016", "2017", "2018", "2019", "2020"]

        let _d3 = d3;

        let series = d3.stack().keys(keys.slice(1))(serie).map(d => (d.forEach( v => v["key"] = d.key), d));

        let x, y, xAxis, yAxis;

        let lt = this.labelType;

        let color = d3.scaleOrdinal()
            .domain(series.map(d => d.key))
            .range(this.setSchema(this.color,keys))
            .unknown("#ccc");

        if(!this.position || this.position == 'vertical'){

            x = d3.scaleBand()
                .domain(serie.map(d => d[group]))
                .range([margin.left, width - margin.right])
                .padding(0.1);

            y = d3.scaleLinear()
                .domain([0, d3.max(series, d => d3.max(d, d => d[1]))*1.1])
                .rangeRound([height - margin.bottom, margin.top]);

            xAxis = g => g
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x).tickSizeOuter(0))
                .call(g => g.selectAll(".domain").remove());
    
            yAxis =  g => g
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y).ticks(null, "s"))
                .call(g => g.selectAll(".domain").remove());

            svg.append("g")
                .selectAll("g")
                .data(series)
                .join("g")
                    .attr("fill", d => color(d.key))
                .selectAll("rect")
                .data(d => d)
                .join("rect")
                    .attr("x", (d, i) => x(d.data[group]))
                    .attr("y", d => y(d[1]))
                    .attr("matTooltip", "abcd")
                    .attr("height", d => y(d[0]) - y(d[1]))
                    .attr("width", x.bandwidth());

            svg.selectAll('rect').on('mouseover', function(d, i) {
                svg.append("text")
                    .attr('class', 'tip-display')
                    .style("opacity", 1)
                    .attr('x', () => {
                        let xPlus = x(d.data[group]);
                        return xPlus + 5
                    })
                    .attr("y", (d2) => y(d[1]) - 21)
                    .attr('text-anchor', 'middle')
                    .attr("font-family","sans-serif")
                    .attr("font-weight",'bolder')
                    .text((d2) => d.key);
        
                svg.append("text")
                    .attr('class', 'count-display')
                    .style("opacity", 1)
                    .attr('x', () => {
                        let xPlus = x(d.data[group]);
                        return xPlus + 5
                    })
                    .attr("y", (d2) => y(d[1]) - 7)
                    .attr('text-anchor', 'middle')
                    .attr("font-family","sans-serif")
                    .text((d2) => d.data[d.key]);
        
                svg.selectAll('rect')
                    .transition().duration(10)
                    .attr('opacity', (d2) => d2 != d ? 0.6 : 1)
                })
                .on('mouseout', (d) => {
                    d3.select('.tip-display').remove();
                    d3.select('.count-display').remove();
                svg.selectAll('rect')
                    .transition().duration(500)
                    .attr('opacity', 1)
                });
        } else {
            x = d3.scaleLinear()
                .domain([0, d3.max(series, d => d3.max(d, d => d[1]))*1.1])
                .range([margin.left*3, width - margin.right]);

            y = d3.scaleBand()
                .domain(serie.map(d => d[group]))
                .range([margin.top, height - margin.bottom])
                .padding(0.08);

            xAxis = g => g
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x).ticks(width / 100, "s"))
                .call(g => g.selectAll(".domain").remove());

            yAxis = g => g
                .attr("transform", `translate(${margin.left*3},0)`)
                .call(d3.axisLeft(y).tickSizeOuter(0))
                .call(g => g.selectAll(".domain").remove());

            this.svg.append("g")
                .selectAll("g")
                .data(series)
                .join("g")
                    .attr("fill", d => color(d.key))
                .selectAll("rect")
                .data(d => d)
                .join("rect")
                    .attr("x", d => x(d[0]))
                    .attr("y", (d, i) => y(d.data[group]))
                    .attr("width", d => x(d[1]) - x(d[0]))
                    .attr("height", y.bandwidth());

            svg.selectAll('rect').on('mouseover', function(d, i, a) {
                
                let h = a[i].height.baseVal.value;
                let w = a[i].width.baseVal.value;
                
                svg.append("text")
                    .attr('class', 'tip-display')
                    .style("opacity", 1)
                    .attr('y', () => {
                        let yPlus = y(d.data[group]) + h/2;
                        return yPlus + 15
                    })
                    .attr('x', (d2) => x(d[1]) + 10)
                    .attr('text-anchor', 'start')
                    .attr("font-family","sans-serif")
                    .attr("font-weight",'bolder')
                    .attr("background-color",'#000000')
                    .attr("pointer-events","none")
                    .text((d2) => d.key);

                if(this.labelType == 'currency'){
                    svg.append("text")
                    .attr('class', 'count-display')
                    .style("opacity", 1)
                    .attr('y', () => {
                        let yPlus = y(d.data[group]) + h/2;
                        return yPlus - 5
                    })
                    .attr("x", (d2) => x(d[1]) + 10)
                    .attr('text-anchor', 'start')
                    .attr("font-family","sans-serif")
                    .attr("font-weight",'bolder')
                    .attr("pointer-events","none")
                    .text((d2) => {
                        let currency = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD',});
                        return currency.format(d.data[d.key])
                    });
                } else {
                    svg.append("text")
                    .attr('class', 'count-display')
                    .style("opacity", 1)
                    .attr('y', () => {
                        let yPlus = y(d.data[group]) + h/2;
                        return yPlus - 5
                    })
                    .attr("x", (d2) => x(d[1]) + 10)
                    .attr('text-anchor', 'start')
                    .attr("font-family","sans-serif")
                    .attr("font-weight",'bolder')
                    .attr("pointer-events","none")
                    .text((d2) => { return d.data[d.key] });
                }
        

        
                    svg.selectAll('rect')
                        .transition().duration(10)
                        .attr('opacity', (d2) => d2 != d ? 0.6 : 1)

                }.bind(this))
                .on('mouseout', (d) => {
                    d3.select('.count-display').remove();
                    d3.select('.tip-display').remove();
                svg.selectAll('rect')
                    .transition().duration(500)
                    .attr('opacity', 1)
                });
        }

        this.svg.append("g")
            .call(xAxis);

        this.svg.append("g")
            .call(yAxis);

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

    public updateChart(data: any[]) {
        //console.log(data);
        let d = this.processData(data);
        this.createChart(d);

    }
}