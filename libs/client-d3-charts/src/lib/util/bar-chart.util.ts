import { ElementRef } from '@angular/core';
import * as d3 from 'd3';

import { IBarChartDataNode, IBarChartOptions, TBarChartData } from '../interfaces/bar-chart.interface';

const defaultChartConfig: IBarChartOptions = Object.freeze({
  width: 600,
  height: 600,
  margin: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },
  xAxisPadding: 0.4,
  xAxisTitle: 'x',
  yAxisTitle: 'y',
  labelTextWrapWidth: 20, // the number of pixels after which a label needs to be given a new line
  color: d3.scaleOrdinal(d3.schemeCategory10),
});

const createContainer = (container: ElementRef<HTMLDivElement>, config: IBarChartOptions) => {
  const id = container.nativeElement.id ?? 'bar-0';

  d3.select(`#${id}`).select('svg').remove();
  const svg = d3
    .select(`#${id}`)
    .append('svg')
    .attr('width', config.width + config.margin.left + config.margin.right)
    .attr('height', config.height + config.margin.top + config.margin.bottom)
    .attr('class', id);
  const g = svg
    .append('g')
    .attr('transform', `translate(${config.width / 2 - config.margin.left},${config.height / 2 - config.margin.top})`);

  return { svg, g };
};

const wrapSvgText = (svgText: d3.Selection<d3.BaseType, unknown, HTMLElement, unknown>, width: number) => {
  svgText.each(function (this: d3.BaseType) {
    const text = d3.select<d3.BaseType, string>(this);
    const words = text.text().split(/\s+/).reverse();
    let line: string[] = [];
    let lineNumber = 0;
    const lineHeight = 1.4;
    const y = text.attr('y');
    const x = text.attr('x');
    const dy = parseFloat(text.attr('dy') ?? 0);
    let tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', `${dy}em`); // axis label

    let word = words.pop();

    while (typeof word !== 'undefined') {
      line.push(word ?? '');
      tspan.text(line.join(' '));
      if ((tspan.node()?.getComputedTextLength() ?? 0) > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word ?? ''];
        lineNumber += 1;
        tspan = text
          .append('tspan')
          .attr('x', 0)
          .attr('y', y)
          .attr('dy', `${lineNumber * lineHeight + dy}em`)
          .text(word ?? '');
      }
      word = words.pop();
    }
  });
};

const createAxisX = (g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>, x: d3.ScaleBand<string>, config: IBarChartOptions) => {
  const heightModifier = 196;
  const widthModifier = 15;
  g.append('g')
    .attr('transform', `translate(0, ${config.height})`)
    .call(d3.axisBottom(x))
    .append('text')
    .attr('y', config.height - heightModifier)
    .attr('x', config.width + widthModifier)
    .attr('text-anchor', 'end')
    .attr('class', 'legend')
    .attr('dy', '0.35em')
    .text(config.xAxisTitle);

  d3.selectAll('text').call(wrapSvgText, config.labelTextWrapWidth);
};

const createAxisY = (
  g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>,
  y: d3.ScaleLinear<number, number>,
  config: IBarChartOptions,
) => {
  const ticks = 10;
  const yAttr = -10;
  const xAttr = 3;
  g.append('g')
    .call(
      d3
        .axisLeft(y)
        .tickFormat(function (d) {
          return `${d}`;
        })
        .ticks(ticks),
    )
    .append('text')
    .attr('y', yAttr)
    .attr('x', xAttr)
    .attr('text-anchor', 'end')
    .attr('class', 'legend')
    .text(config.yAxisTitle);
};

const onMouseOver = (
  self: SVGRectElement,
  d: IBarChartDataNode,
  g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>,
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number>,
  config: IBarChartOptions,
) => {
  const duration = 400;
  const widthModifier = 5;
  d3.select(self)
    .transition()
    .duration(duration)
    .attr('width', x.bandwidth() + widthModifier)
    .attr('y', function () {
      const modifier = 10;
      return y(d.value) - modifier;
    })
    .attr('height', function () {
      const modifier = 10;
      return config.height - y(d.value) + modifier;
    });

  g.append('text')
    .attr('class', 'val')
    .style('font-size', '11px')
    .attr('x', function () {
      return x(d.title) ?? '';
    })
    .attr('y', function () {
      const modifier = 15;
      return y(d.value) - modifier;
    })
    .text(function () {
      return `${d.value}`;
    });
};

const onMouseOut = (
  self: SVGRectElement,
  d: IBarChartDataNode,
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number>,
  config: IBarChartOptions,
) => {
  const duration = 400;
  d3.select(self).attr('class', 'bar');
  d3.select(self)
    .transition()
    .duration(duration)
    .attr('width', x.bandwidth())
    .attr('y', function () {
      return y(d.value) ?? 0;
    })
    .attr('height', function () {
      return config.height - (y(d.value) ?? 0);
    });

  d3.selectAll('.val').remove();
};

const drawBarsAndSetPointerEvents = (
  g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>,
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number>,
  config: IBarChartOptions,
  data: TBarChartData,
) => {
  const duration = 400;
  g.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .style('fill', function (d, i) {
      return config.color(i.toString());
    })
    .on('mouseover', function (this, event, d) {
      return onMouseOver(this, d, g, x, y, config);
    })
    .on('mouseout', function (this, event, d) {
      return onMouseOut(this, d, x, y, config);
    })
    .attr('x', function (d) {
      return x(d.title) ?? '';
    })
    .attr('y', function (d) {
      return y(d.value);
    })
    .attr('width', x.bandwidth())
    .transition()
    .ease(d3.easeLinear)
    .duration(duration)
    .delay(function (d, i) {
      const multiplier = 50;
      return i * multiplier;
    })
    .attr('height', function (d) {
      return config.height - y(d.value);
    });
};

export const drawBarChart = (container: ElementRef<HTMLDivElement>, data: TBarChartData, options?: Partial<IBarChartOptions>) => {
  const config: IBarChartOptions = { ...defaultChartConfig };
  if (typeof options !== 'undefined') {
    for (const i in options) {
      if (typeof options[i] !== 'undefined') {
        config[i] = options[i];
      }
    }
  }

  const { g } = createContainer(container, config);

  const x = d3
    .scaleBand([0, config.width])
    .padding(config.xAxisPadding)
    .domain(
      data.map(function (d) {
        return d.title;
      }),
    );
  const y = d3.scaleLinear([config.height, 0]).domain([
    0,
    d3.max(data, function (d) {
      return d.value;
    }) ?? 1,
  ]);

  createAxisX(g, x, config);

  createAxisY(g, y, config);

  drawBarsAndSetPointerEvents(g, x, y, config, data);

  return config;
};
