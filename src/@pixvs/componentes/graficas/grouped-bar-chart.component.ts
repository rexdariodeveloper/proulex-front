import { Component, OnInit, ElementRef, ViewEncapsulation, Input, SimpleChanges, OnChanges } from '@angular/core';

import * as d3 from 'd3';

@Component({
    selector: 'grouped-bar-chart',
    encapsulation: ViewEncapsulation.None,
    template: `<svg></svg>`,
    styles: [
        `
        .count-display {
            background-color: black;
            color: white;
            border-color: black;
            border-radius: 5px
        }
        `
    ]
})
export class GroupedBarChartComponent implements OnInit, OnChanges {

    //Global vars
    hostElement;
    svg;
    margin = {top: 10, right: 10, bottom: 20, left: 20};
    width  = 520;
    height = 500;
    g;

    //Inputs
    @Input() data: any;
    @Input() labels: string[];
    @Input() groupBy: string;
    @Input() color: string;
    
    constructor(private elRef: ElementRef) {
        this.hostElement = this.elRef.nativeElement;
    }

    ngOnInit() {
        this.updateChart(this.data);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.data) {
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

    private createChart(data) {
        let width  = this.width;
        let height = this.height;
        let margin = this.margin;

        d3.select(this.hostElement).select('svg').remove();

        this.svg = d3.select(this.hostElement)
            .append('svg')
            .attr("width", '100%')
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        let svg = this.svg;

        width  = parseInt(d3.select(this.hostElement).select('svg').style("width"))  - margin.left - margin.right;
        height = parseInt(d3.select(this.hostElement).select('svg').style("height")) - margin.top  - margin.bottom;
        
        let series = data.data;
        let keys   = data.keys;
        let groupBy = this.groupBy;
        let _color = this.color;
        let padding = 0.05;

        keys = keys.reverse().slice(1).reverse();

        let color = d3.scaleOrdinal().range(this.setSchema(_color,keys))
        
        let x0 = d3.scaleBand()
            .domain(series.map(d => d[groupBy]))
            .rangeRound([margin.left, width - (margin.right + margin.left * 2)])
            .paddingInner(0);

        let x1 = d3
            .scaleBand()
            .domain(keys)
            .rangeRound([0, x0.bandwidth()])
            .padding(padding)

        let y = d3
            .scaleLinear()
            .domain([0, (data.max * 1.1)])
            .rangeRound([height - margin.bottom, margin.top])

        let xAxis = g => g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x0)).attr("font-size", "1rem")
            .call(g => g.select(".domain").remove())
            .selectAll('text')
            .attr("transform", "translate(0,11)")
            .text(d => d)

        let yAxis = g => g
            .attr("transform", `translate(${margin.right},0)`)
            .call(d3.axisRight(y)
                .ticks(7, "s")
                .tickSize(width - margin.right))
            .call(g => g.select(".domain")
                .remove())
            .call(g => g.selectAll(".tick:not(:first-of-type) line")
                .attr("stroke-opacity", 0.5)
                .attr("stroke-dasharray", "2,2"))
            .call(g => g.selectAll(".tick text")
                .attr("x", 0)
                .attr("dy", -5.5))
            .attr("font-size", "0.9rem")
            .attr("opacity", 0.8)

        svg.append("g")
            .call(xAxis);

        svg.append("g")
            .call(yAxis);

        svg.append("g")
            .selectAll("g")
            .data(series)
            .join("g")
            .attr('class', 'bar')
            .attr("transform", d => `translate(${x0(d[groupBy])},0)`)
            .selectAll("rect")
            .data(d => keys.map(key => ({key, value: d[key]})))
            .join("rect")
            .attr("x", d => x1(d.key))
            .attr("width", x1.bandwidth())
            .attr("fill", d => color(d.key))
            .attr("height", d => height - y(0) - margin.bottom) 
            .attr("y", d => y(0));

        //Animation for bars
        svg.selectAll("rect")
            .transition()
            .duration(600)
            .attr("height", d => height - y(d.value) - margin.bottom)
            .attr("y", d => y(d.value));
        
        let bars = series.length * keys.length;
        //calculate offset normalized (%)
        //(number of bars * padding between bars) / 10
        let nOffset = ((bars * padding) / 10);
        //add 2% of white space between groups
        nOffset = nOffset * 1.2;
        //Calculate real width
        let rWidth = width - margin.left - margin.right;
        //Transform normalized offset to pixels
        nOffset = ((rWidth / bars) * ( 1 - nOffset)) / keys.length;
        nOffset = keys.length > 1 ? (nOffset + keys.length/2) : (nOffset/2 + keys.length/2);

        //Add tooltips
        svg.selectAll('rect').on('mouseover', function(d, i) {
            svg.append("text")
            .attr('class', 'tip-display')
            .style("opacity", 1)
            .attr('x', () => {
                let x = /^[^\d]*(\d+)/.exec(d3.select(this.parentNode).attr("transform"))[1];
                let xPlus = x1(d.key);
                return Number(x) + xPlus + nOffset
            })
            .attr("y", (d2) => y(d.value) - 21)
            .attr('text-anchor', 'middle')
            .attr("font-family","sans-serif")
            .attr("font-weight",'bolder')
            .text((d2) => d.key);

            svg.append("text")
            .attr('class', 'count-display')
            .style("opacity", 1)
            .attr('x', () => {
                let x = /^[^\d]*(\d+)/.exec(d3.select(this.parentNode).attr("transform"))[1];
                let xPlus = x1(d.key);
                return Number(x) + xPlus + nOffset
            })
            .attr("y", (d2) => y(d.value) - 7)
            .attr('text-anchor', 'middle')
            .attr("font-family","sans-serif")
            .text((d2) => d.value);

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
    }

    private setSchema(color: string = '', keys: string[]): any[]{
        let schema = [];
        let scale;
        //Find natural scales to avoid color white
        let index = ['blue','green','red','orange','purple'].findIndex( c => c == color);
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
        else { keys.filter(k => k != 'name').forEach(k => schema.push(d3.interpolateGreys(scale(k))));}
        
        return schema;
    }

    public updateChart(data: any[]) {
        if (!this.svg) {
            let d = this.processData(data);
            this.createChart(d);
            return;
        }
    }
}