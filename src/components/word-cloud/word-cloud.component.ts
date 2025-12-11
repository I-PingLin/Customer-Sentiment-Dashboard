import { Component, ChangeDetectionStrategy, effect, ElementRef, input, viewChild } from '@angular/core';
import { WordCloudWord } from '../../models';

declare const d3: any;

@Component({
  selector: 'app-word-cloud',
  standalone: true,
  template: `<div #cloudContainer class="w-full h-full relative"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WordCloudComponent {
  words = input.required<WordCloudWord[]>();
  colorScale = input.required<string[]>();
  container = viewChild.required<ElementRef>('cloudContainer');

  constructor() {
    effect(() => {
        const words = this.words();
        if (words && words.length > 0) {
            this.createCloud(words);
        }
    });
  }

  private createCloud(words: WordCloudWord[]): void {
    const el = this.container().nativeElement;
    d3.select(el).select('svg').remove();

    const width = el.clientWidth;
    const height = el.clientHeight;

    const maxVal = d3.max(words, (d: WordCloudWord) => d.value);
    const minVal = d3.min(words, (d: WordCloudWord) => d.value) || 1;
    
    const fontSize = d3.scaleSqrt().domain([minVal, maxVal]).range([14, 60]);

    // FIX: Bind the component's `this` context to the `draw` function directly
    // in the event handler. The previous attempt to reassign `draw` after its
    // declaration is invalid in strict mode and caused a TypeError.
    const layout = d3.layout.cloud()
      .size([width, height])
      .words(words.map(d => ({ text: d.text, size: fontSize(d.value) })))
      .padding(5)
      .rotate(() => (~~(Math.random() * 6) - 3) * 15) // Random rotation
      .font('Roboto')
      .on('end', draw.bind(this));

    layout.start();

    function draw(this: WordCloudComponent, words: any[]) {
      const color = d3.scaleOrdinal(this.colorScale());

      d3.select(el)
        .append('svg')
        .attr('width', layout.size()[0])
        .attr('height', layout.size()[1])
        .append('g')
        .attr('transform', `translate(${layout.size()[0] / 2},${layout.size()[1] / 2})`)
        .selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .style('font-size', d => `${d.size}px`)
        .style('font-family', 'Roboto')
        .style('fill', (d, i) => color(i))
        .attr('text-anchor', 'middle')
        .attr('transform', d => `translate(${d.x}, ${d.y})rotate(${d.rotate})`)
        .text(d => d.text);
    }
  }
}
