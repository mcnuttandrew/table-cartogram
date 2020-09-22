import React from 'react';

import {geoCenter} from '../../src/utils';

import {colorCell} from '../../showcase/colors';
import {scaleLinear} from 'd3-scale';
import {line} from 'd3-shape';
import {hsl} from 'd3-color';
interface Props {
  data: any[];
  fillMode: string;
  getLabel?: (x: any) => string;
  height?: number;
  width?: number;
}

function computeDomain(data: any): {min: number; max: number} {
  return data.reduce(
    (acc: any, row: any) => {
      return {
        min: Math.min(acc.min, row.value),
        max: Math.max(acc.max, row.value),
      };
    },
    {min: Infinity, max: -Infinity},
  );
}

export default function plot(props: Props): JSX.Element {
  const {data, fillMode, height = 600, width = 600, getLabel} = props;
  const valueDomain = computeDomain(data);

  const xScale = scaleLinear()
    .domain([0, 1])
    .range([0, width]);
  const yScale = scaleLinear()
    .domain([0, 1])
    .range([0, height]);
  const pather = line()
    .x((d: any) => xScale(d.x))
    .y((d: any) => yScale(d.y));
  return (
    <svg height={height} width={width}>
      {data.map((cell, index) => {
        const center = geoCenter(cell.vertices);
        const color = colorCell(cell, index, fillMode, valueDomain);
        const {l} = hsl(color);
        return (
          <g key={index}>
            <path d={pather(cell.vertices)} fill={color} stroke="#aaa" />
            <text x={xScale(center.x)} y={yScale(center.y)} fill={l < 0.5 ? 'white' : 'black'}>
              {getLabel(cell)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
