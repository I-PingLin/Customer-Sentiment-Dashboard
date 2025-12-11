
import { Component, ChangeDetectionStrategy, effect, ElementRef, input, viewChild } from '@angular/core';
import { SentimentDataPoint } from '../../models';

declare const d3: any;

@Component({
  selector: 'app-sentiment-chart',
  standalone: true,
  template: `<div #chartContainer class="w-full h-80"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SentimentChartComponent {
  data = input.required<SentimentDataPoint[]>();
  container = viewChild.required<ElementRef>('chartContainer');

  constructor() {
    effect(() => {
      const data = this.data();
      if (data && data.length > 0) {
        this.createChart(data);
      }
    });
  }

  private createChart(data: SentimentDataPoint[]): void {
    const el = this.container().nativeElement;
    d3.select(el).select('svg').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = el.clientWidth - margin.left - margin.right;
    const height = el.clientHeight - margin.top - margin.bottom;

    const svg = d3.select(el).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
      
    const x = d3.scalePoint()
        .domain(data.map(d => d.time))
        .range([0, width]);

    const y = d3.scaleLinear()
      .domain([-1, 1])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-35)');

    svg.append('g').call(d3.axisLeft(y));

    // Zero line
    svg.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(0))
        .attr("y2", y(0))
        .attr("stroke", "#94a3b8")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4");

    const line = d3.line()
      .x((d: any) => x(d.time))
      .y((d: any) => y(d.sentiment))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    svg.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', (d: any) => x(d.time))
      .attr('cy', (d: any) => y(d.sentiment))
      .attr('r', 5)
      .attr('fill', (d: any) => d.sentiment >= 0 ? '#22c55e' : '#ef4444');
  }
}
