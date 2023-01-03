import { Component, OnInit, ElementRef, ViewEncapsulation, Input, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';

import * as d3 from 'd3';
import { HierarchyRectangularNode } from 'd3';
import * as _ from 'lodash';

@Component({
    selector: 'sequence-sunburst',
    encapsulation: ViewEncapsulation.None,
    template: `<div class="sequence"></div>
               <svg></svg>`,
    styles:[
        `.crumb{
            padding: 10px;
            color: white;
            margin: 5px;
            border-radius: 5px;
        }
        .sequence {
            margin-top: 25px;
            height: 1em;
        }`
    ]
})
export class SequenceSunburstComponent implements OnInit, OnChanges {

    //Inputs
    @Input() data;
    //Output
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

    formatData(data){
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

    getNode(data){
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
        return d3.partition().size([2 * Math.PI, 320 * 320])(
            d3.hierarchy(data)
              .sum(d => d.value)
              .sort((a, b) => b.value - a.value));
    }

    private createChart(data: any) {
        
        let _d3 = d3;
        let width  = 800;
        let height = 800;
        const margin = this.margin;

        d3.select(this.hostElement).select('svg').remove();

        this.svg = d3.select(this.hostElement)
            .append("svg")
            .attr("width","100%")
            .attr("height",height)
            .style("font", "10px sans-serif");

        width  = parseInt(d3.select(this.hostElement).select('svg').style("width"))  - margin.left - margin.right;
        //height = parseInt(d3.select(this.hostElement).select('svg').style("height")) - margin.top  - margin.bottom;

        this.g = this.svg.append("g")
            .attr("transform", `translate(${width / 2},${ width / 2})`);

        let radius = width / 2;

        let root = this.partition(data.data);
        let element = this.svg.node();
        element.value = { sequence: [], percentage: 0.0 };

        let color = d3.scaleOrdinal<string>()
            .domain(data.columns)
            .range(["#5d85cf", "#7c6561", "#da7847", "#6fb971", "#9e70cf", "#bbbbbb"])
            .unknown("#00ff00");

        let arc = d3
            .arc<HierarchyRectangularNode<any>>()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(1 / radius)
            .padRadius(radius)
            .innerRadius(d => Math.sqrt(d.y0))
            .outerRadius(d => Math.sqrt(d.y1) - 1);

        let mousearc = d3
            .arc<HierarchyRectangularNode<any>>()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => Math.sqrt(d.y0))
            .outerRadius(radius)

        let label = this.svg
            .append("text")
            .attr("text-anchor", "middle")
            .attr("fill", "#888");

        label
            .append("tspan")
            .attr("class", "percentage")
            .attr("x", 0)
            .attr("y", 0)
            .attr("dy", "-0.1em")
            .attr("font-size", "3em")
            .text("");

        label
            .append("tspan")
            .attr("x", 0)
            .attr("y", 0)
            .attr("dy", "1.5em")
            .attr("font-size", "2em")
            .text("Personas afectadas");

        label
            .style("visibility", null)
            .select(".percentage")
            .text(data.summary.total);

        this.svg
            .attr("viewBox", `${-radius} ${-radius} ${width} ${width}`)
            .style("max-width", `${width}px`)
            .style("font", "12px sans-serif");

        let path = this.svg
            .append("g")
            .selectAll("path")
            .data(
            root.descendants().filter(d => {
                return d.depth && d.x1 - d.x0 > 0.001;
            })
            )
            .join("path")
            .attr("fill", d => color(d.data.name))
            .attr("d", arc);

        this.svg
            .append("g")
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("mouseleave", (d) => {
            path.attr("fill-opacity", 1);

            remove_crumbs();
            
            const percentage = (root.value);
            label
                .style("visibility", null)
                .select(".percentage")
                .text(percentage);
            element.value = { sequence: [], percentage: 0.0 };
            element.dispatchEvent(new CustomEvent("input"));
            })
            .selectAll("path")
            .data(
            root.descendants().filter(d => {
                return d.depth && d.x1 - d.x0 > 0.001;
            })
            )
            .join("path")
            .attr("d", mousearc)
            .on("mouseenter", (d,i) => {
            const sequence = d
                .ancestors()
                .reverse()
                .slice(1);
            path
                .attr("fill-opacity", node =>
                sequence.indexOf(node) >= 0 ? 1.0 : 0.3
                );
            const percentage = (d.value);
            label
                .style("visibility", null)
                .select(".percentage")
                .text(percentage);
            element.value = { sequence, percentage };
            element.dispatchEvent(new CustomEvent("input"));
            update_crumbs(d, percentage);
            });

            function update_crumbs(d, p) {
                var crumb_container = d3.select('.sequence'),
                    sections = getNameArray(d,[]);
                
                remove_crumbs();
                
                sections.reverse().forEach(function(name) {
                    if(name != 'root'){
                        crumb_container.append('span')
                            .classed('crumb', true)
                            .style('background-color', color(name))
                            .text(name);
                    }
                });

                d3.select('.sequence').attr('visibility','');
                d3.select("#trail").style("visibility", "");
            };
            
            function remove_crumbs() {
                d3.select('.sequence').selectAll('.crumb').remove();
            };

            function getNameArray(d, array) {
                array = array || [];
                array.push(d.data.name);
                if (d.parent) getNameArray(d.parent, array);
            
                return array;
            };
    }

    public updateChart(data: any) {
        let d = this.formatData(data)
        this.createChart(d);
    }
}