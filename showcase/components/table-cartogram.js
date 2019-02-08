import React from 'react';

import {
  XYPlot,
  PolygonSeries,
  LabelSeries
} from 'react-vis';

import {
  area,
  round,
  geoCenter
} from '../../src/utils';

import {colorCell} from '../colors';

function plot(props, setX, xFlip, yFlip) {
  const {
    annotationBoxes,
    annotationBoxStyle = {},
    data,
    fillMode,
    getSubLabel,
    showLabels,
    height = 600,
    width = 600,
    showAxisLabels = false,
    xLabels = [],
    yLabels = [],
    getLabel,
    rugMode,
    showBorder = true,
    rectStyle = {},
    clipToX
  } = props;
  const valueDomain = data.reduce((acc, row) => {
    return {
      min: Math.min(acc.min, row.value),
      max: Math.max(acc.max, row.value)
    };
  }, {min: Infinity, max: -Infinity});

  const dataWidth = xLabels.length;
  const XYprops = {
    animation: !rugMode,
    colorType: 'linear',
    yDomain: yFlip ? [0, 1] : [1, 0],
    width,
    margin: rugMode ? 0 : 50,
    height
  };
  if (setX || clipToX) {
    XYprops.xDomain = xFlip ? [1, 0] : [0, 1];
  }
  return (
    <XYPlot {...XYprops}>
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
            fill: colorCell(cell, index, fillMode, valueDomain),
            ...rectStyle
          }}/>);
      })}
      {(annotationBoxes || []).map((box, idx) => {
        return (<PolygonSeries
          key={`annotation-box-${idx}`}
          data={box.vertices}
          className="annotation"
          style={{
            strokeWidth: 4,
            stroke: '#000',
            strokeOpacity: 0.8,
            fillOpacity: 0,
            ...annotationBoxStyle
          }}/>);
      })}
      {showBorder && <PolygonSeries
        style={{
          fill: 'none',
          strokeOpacity: 1,
          strokeWidth: 1,
          stroke: 'black'
        }}
        data={[{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 1, y: 0}]} />}
      {showLabels && <LabelSeries data={data.map((cell, index) => ({
        ...geoCenter(cell.vertices),
        label: `${getLabel ? getLabel(cell) : cell.value}`,
        style: {
          textAnchor: 'middle',
          alignmentBaseline: 'middle',
          fontFamily: 'GillSans'
        }
      }))} />}
      {showAxisLabels && <LabelSeries
        data={data.slice(0, dataWidth).map((cell, index) => {
          const {x} = geoCenter(cell.vertices);
          return ({
            x,
            y: -0.01,
            label: `${xLabels[index]}`,
            style: {
              textAnchor: 'middle',
              alignmentBaseline: 'middle',
              fontSize: 11,
              fontFamily: 'GillSans'
            }
          });
        })} />}
      {showAxisLabels && <LabelSeries
          data={data.filter((d, idx) => !(idx % dataWidth)).map((cell, index) => {
            const {y} = geoCenter(cell.vertices);
            return ({
              x: -0.01,
              y,
              label: `${yLabels[index]}`,
              style: {
                textAnchor: 'end',
                alignmentBaseline: 'middle',
                fontSize: 11,
                fontFamily: 'GillSans'
              }
            });
          })} />
      }

      {showLabels && (!getLabel || getSubLabel) && <LabelSeries data={data.map((cell, index) => {
        const label = getSubLabel ? getSubLabel(cell) : `${round(area(cell.vertices), Math.pow(10, 6))}`;
        return {
          ...geoCenter(cell.vertices),
          label,
          style: {
            transform: 'translate(0, 15)',
            textAnchor: 'middle',
            alignmentBaseline: 'middle',
            fontFamily: 'GillSans'
          }
        };
      })} />}
    </XYPlot>
  );
}

export default function cartogramPlot(props) {
  if (!props.rugMode) {
    return plot(props);
  }

  return (<div style={{display: 'flex', flexDirection: 'column'}}>
    <div style={{display: 'flex'}}>
      {plot(props, true, false, false)}
      {plot(props, true, true, false)}
    </div>
    <div style={{display: 'flex'}}>
      {plot(props, true, false, true)}
      {plot(props, true, true, true)}
    </div>
  </div>);
}
