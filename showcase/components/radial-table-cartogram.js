import React from 'react';

import {
  XYPlot,
  PolygonSeries,
  ArcSeries
} from 'react-vis';


import {colorCell} from '../colors';

export default function radilaCartogramPlot(props, setX, xFlip, yFlip) {
  const {
    data,
    fillMode,
    height = 600,
    width = 600,
    rectStyle = {}
  } = props;
  const valueDomain = data.reduce((acc, row) => {
    return {
      min: Math.min(acc.min, row.value),
      max: Math.max(acc.max, row.value)
    };
  }, {min: Infinity, max: -Infinity});

  const {xMax, yMax} = data.reduce((acc, row) => {
    return row.vertices.reduce((mem, {x, y}) => ({
      xMin: Math.min(mem.xMin, x),
      xMax: Math.max(mem.xMax, x),
      yMin: Math.min(mem.yMin, y),
      yMax: Math.max(mem.yMax, y)
    }), acc);
  }, {xMin: Infinity, yMin: Infinity, xMax: -Infinity, yMax: -Infinity});
  const angleSeriesData = data.map((cell, index) => {
    const [lowerLeft, lowerRight, upperRight, upperLeft] = cell.vertices;
    return {
      angle0: lowerLeft.y * Math.PI * 2,
      angle: lowerRight.y * Math.PI * 2,
      opacity: 0.2,
      radius: upperLeft.x,
      radius0: lowerLeft.x,
      color: colorCell(cell, index, fillMode, valueDomain)
    };
  });
  const showArcs = true;
  const showBoxes = false;
  return (
    <XYPlot
      margin={0}
      width={width}
      height={height}
      xDomain={[-2, 2]}
      yDomain={[-2, 2]}>
      {showArcs && <ArcSeries
        colorType={'literal'}
        center={{x: 0, y: 0}}
        data={angleSeriesData}
        style={{
          strokeWidth: 1,
          stroke: '#000',
          strokeOpacity: 1,
          opacity: 0.5
        }}/>}
      {
      showBoxes && data.map((cell, index) => {
        return (<PolygonSeries
          key={`quad-${index}`}
          data={cell.vertices
            .map(({x, y}) => ({x: y * Math.cos(x * Math.PI * 2), y: y * Math.sin(x * Math.PI * 2)}))}
          style={{
            strokeWidth: 1,
            // stroke: colorCell(cell, index, fillMode, valueDomain),
            stroke: '#000',
            strokeOpacity: 1,
            opacity: 0.5,
            fill: colorCell(cell, index, fillMode, valueDomain),
            ...rectStyle
          }}/>);
      })
    }
    </XYPlot>
  );
}
