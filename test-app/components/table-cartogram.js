import React from 'react';

import {
  interpolateInferno,
  interpolateReds,
  interpolatePlasma
} from 'd3-scale-chromatic';

import {
  XYPlot,
  PolygonSeries,
  LabelSeries
} from 'react-vis';

import {
  area,
  round,
  geoCenter
} from '../../iterative-methods/utils';

import {RV_COLORS} from '../colors';

function colorCell(cell, index, fillMode, {min, max}) {
  switch (fillMode) {
  case 'valueHeat':
    return interpolateInferno(
      1 - ((cell.value - min) / (max - min))
    );
  case 'valueHeatAlt':
    return interpolateReds(
      1 - Math.sqrt(1 - (cell.value - min) / (max - min))
    );
  case 'errorHeat':
    return interpolateInferno(Math.sqrt(cell.individualError));
  case 'plasmaHeat':
    return interpolatePlasma(((cell.value - min) / (max - min)));
  case 'byValue':
    return RV_COLORS[cell.value % RV_COLORS.length];
  case 'byDataColor':
    return cell.data.color || '#fff';
  case 'none':
    return 'rgba(255, 255, 255, 0)';
  default:
  case 'periodicColors':
    return RV_COLORS[(index + 3) % RV_COLORS.length];
  }
}

export default function cartogramPlot(props) {
  const {
    data,
    fillMode,
    showLabels,
    height = 600,
    width = 600,
    showAxisLabels = false,
    xLabels = [],
    yLabels = [],
    getLabel
  } = props;
  const valueDomain = data.reduce((acc, row) => {
    return {
      min: Math.min(acc.min, row.value),
      max: Math.max(acc.max, row.value)
    };
  }, {min: Infinity, max: -Infinity});

  const dataWidth = xLabels.length;
  return (
    <XYPlot
      animation
      colorType="linear"
      yDomain={[1, 0]}
      width={width}
      margin={50}
      height={height}>
      {data.map((cell, index) => {
        return (<PolygonSeries
          key={`quad-${index}`}
          data={cell.vertices}
          style={{
            strokeWidth: 1,
            // stroke: colorCell(cell, index, fillMode, valueDomain),
            stroke: '#000',
            strokeOpacity: 1,
            opacity: 0.5,
            fill: colorCell(cell, index, fillMode, valueDomain)
          }}/>);
      })}
      <PolygonSeries
        style={{
          fill: 'none',
          strokeOpacity: 1,
          strokeWidth: 1,
          stroke: 'black'
        }}
        data={[{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 1, y: 0}]} />
      {showLabels && <LabelSeries data={data.map((cell, index) => ({
        ...geoCenter(cell.vertices),
        label: getLabel ? getLabel(cell) : `${cell.value}`,
        style: {
          textAnchor: 'middle',
          alignmentBaseline: 'middle'
        }
      }))} />}
      {showAxisLabels && <LabelSeries
        data={data.slice(0, dataWidth).map((cell, index) => {
          const {x} = geoCenter(cell.vertices);
          return ({
            x,
            y: -0.01,
            label: xLabels[index],
            style: {
              textAnchor: 'middle',
              alignmentBaseline: 'middle',
              fontSize: 11
            }
          });
        })} />}
      {showAxisLabels && <LabelSeries
          data={data.filter((d, idx) => !(idx % dataWidth)).map((cell, index) => {
            const {y} = geoCenter(cell.vertices);
            return ({
              x: -0.01,
              y,
              label: yLabels[index],
              style: {
                textAnchor: 'end',
                alignmentBaseline: 'middle',
                fontSize: 11
              }
            });
          })} />
      }

      {showLabels && !getLabel && <LabelSeries data={data.map((cell, index) => {
        return {
          ...geoCenter(cell.vertices),
          label: `${round(area(cell.vertices), Math.pow(10, 6))}`,
          style: {
            transform: 'translate(0, 15)',
            textAnchor: 'middle',
            alignmentBaseline: 'middle'
          }
        };
      })} />}
    </XYPlot>
  );
}
