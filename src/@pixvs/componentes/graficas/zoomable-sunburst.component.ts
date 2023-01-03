import { Component, OnInit, ElementRef, ViewEncapsulation, Input, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';

import * as d3 from 'd3';
import { HierarchyRectangularNode } from 'd3';
import * as _ from 'lodash';

@Component({
    selector: 'zoomable-sunburst',
    encapsulation: ViewEncapsulation.None,
    template: `<svg></svg>`
})
export class ZoomableSunburstComponent implements OnInit, OnChanges {

    @Input() data;
    @Output() summary: EventEmitter<any> = new EventEmitter();

    hostElement;
    svg;
    margin = {top: 10, right: 10, bottom: 20, left: 40};
    width  = 520;
    height = 500;
    g;

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

    private formatData(data){
        let keys = [];
        let columns = Object.keys(data[0]).reverse().slice(1);
        let summary = {};
        
        columns = columns.reverse();
        summary['total'] = 0;

        data.forEach(row => {
            summary[row[columns[0]]] = !!summary[row[columns[0]]]? summary[row[columns[0]]] : 0;
            summary[row[columns[0]]] += row['valor'];
            summary['total'] += row['valor'];

            columns.forEach(column => {
                let index = keys.findIndex(e => e == row[column]);
                if(index == -1)
                    keys.push(row[column]);
            });
        });

        this.summary.emit(summary);

        return {data: {name: 'root', children: this.getNode(data)}, columns: keys, summary: summary};
    }

    private getNode(data){
        let column: any = Object.keys(data[0]);
        let children = [];
        if(column.length > 1){
            column = column[0];
            let datos = Object.entries(_.mapValues(_.groupBy(data, column),clist => clist.map((p:any) => _.omit(p, column))));
            datos.forEach(item => {
                let child = this.getNode(item[1]);
                if(typeof child == 'number')
                    children.push({name:item[0], value: child});
                else
                    children.push({name:item[0], children: child});
            });
        }
        else
            return data[0][column];

        return children;
    }

    private partition(data){
        const root = d3.hierarchy(data).sum(d => d.value).sort((a, b) => b.value - a.value);
        return d3.partition().size([2 * Math.PI, root.height + 1])(root);
    }

    private createChart(data: any) {
        let _d3 = d3;
        let width  = 800;
        let height = 500;
        const margin = this.margin;

        d3.select(this.hostElement).select('svg').remove();

        this.svg = d3.select(this.hostElement)
            .append("svg")
            .attr("width","100%")
            .style("font", "10px sans-serif");

        width  = parseInt(d3.select(this.hostElement).select('svg').style("width"))  - margin.left - margin.right;
        this.svg.attr("height",width);
        height = parseInt(d3.select(this.hostElement).select('svg').style("height")) - margin.top  - margin.bottom;

        this.g = this.svg.append("g")
            .attr("transform", `translate(${width / 2},${ width / 2})`);

        let radius = width / 6;

        let root = this.partition(data.data);
        root.each(d => {d['current'] = d});

        let arc = d3.arc<HierarchyRectangularNode<any>>()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 1.5)
        .innerRadius(d => d.y0 * radius)
        .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

        let color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.data.children.length + 1));

        let path = this.svg.append("g")
            .attr("transform", `translate(${width / 2},${ width / 2})`)
            .selectAll("path")
            .data(root.descendants().slice(1))
            .join("path")
            .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
            .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
            .attr("d", d => arc(d.current));

        path.filter(d => d.children)
            .style("cursor", "pointer")
            .on("click", clicked);

        path.append("title")
            .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${d.value}`);

        let label = this.g.append("g")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .style("user-select", "none")
            .selectAll("text")
            .data(root.descendants().slice(1))
            .join("text")
            .attr("dy", "0.35em")
            .attr("fill-opacity", d => +labelVisible(d.current))
            .attr("transform", d => labelTransform(d.current))
            .text(d => d.data.name);

        let parent = this.g.append("circle")
            .datum(root)
            .attr("r", radius)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", d => clicked(d));

        let g = this.g;
        let svg = this.svg;
        let currentLevel = 0;
        function clicked(p) {
            parent.datum(p.parent || root);
            if(p.y0 < currentLevel)
                p = p.parent;

            currentLevel = p.y0 + 1;

            root.each(d => d['target'] = {
                x0: Math.max(0, Math.min(1, (d.x0 - (p.x0)) / (p.x1 - (p.x0)))) * 2 * Math.PI,
                x1: Math.max(0, Math.min(1, (d.x1 - (p.x0)) / (p.x1 - (p.x0)))) * 2 * Math.PI,
                y0: Math.max(0, d.y0 - (p.depth)),
                y1: Math.max(0, d.y1 - (p.depth))
            });

            let t = svg.transition().duration(400);

            path.transition(t)
                .tween("data", d => {
                const i = d3.interpolate(d.current, d.target);
                return t => d.current = i(t);
                })
            .filter(function(d) {
                return +this.getAttribute("fill-opacity") || arcVisible(d.target);
            })
                .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
                .attrTween("d", d => () => arc(d.current));

            label.filter(function(d) {
                return +this.getAttribute("fill-opacity") || labelVisible(d.target);
            }).transition(t)
                .attr("fill-opacity", d => + labelVisible(d.target))
                .attrTween("transform", d => () => labelTransform(d.current));
        }
        
        function arcVisible(d) {
            return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
        }

        function labelVisible(d) {
            return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
        }

        function labelTransform(d) {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2 * radius;
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        }

    }

    public updateChart(data: any) {
        let d = this.formatData(data)
        this.createChart(d);
    }
}