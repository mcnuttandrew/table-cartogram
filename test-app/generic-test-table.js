// Copyright (c) 2016 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React from 'react';

import {
  XYPlot,
  PolygonSeries,
  // MarkSeries,
  // LineSeries,
  LabelSeries
} from 'react-vis';

const tableCartogram = require('../second-pass.js').default;

const EXTENDED_DISCRETE_COLOR_RANGE = [
  '#19CDD7',
  '#DDB27C',
  '#88572C',
  '#FF991F',
  '#F15C17',
  '#223F9A',
  '#DA70BF',
  '#125C77',
  '#4DC19C',
  '#776E57',
  '#12939A',
  '#17B8BE',
  '#F6D18A',
  '#B7885E',
  '#FFCB99',
  '#F89570',
  '#829AE3',
  '#E79FD5',
  '#1E96BE',
  '#89DAC1',
  '#B3AD9E'
];
/* eslint-disable max-len */

function geoCenter(points) {
  const sum = points.reduce((center, row) => {
    return {x: center.x + row.x, y: center.y + row.y};
  }, {x: 0, y: 0});
  return {x: sum.x / points.length, y: sum.y / points.length};
}

export default class GenericTable extends React.Component {
  render() {
    const {data, name, mode, size} = this.props;
    const triangles = tableCartogram().mode(mode)(data);

    return (
      <div>
        {name}
        <XYPlot
          colorType="linear"
          width={600}
          height={300}
          {...size}>
          {triangles.map((cell, index) => {
            return (<PolygonSeries
              key={`triangle-${index}`}
              data={cell.vertices}
              style={{
                strokeWidth: 0.5,
                strokeOpacity: 1,
                opacity: 0.5,
                // fill: cell.value
                fill: EXTENDED_DISCRETE_COLOR_RANGE[(index + 2) % EXTENDED_DISCRETE_COLOR_RANGE.length]
              }}/>);
          })}
          <LabelSeries data={triangles.map((cell, index) => {
            return {...geoCenter(cell.vertices), label: `${cell.value || ''}`};
          })} />
        </XYPlot>
      </div>
    );
  }
}
