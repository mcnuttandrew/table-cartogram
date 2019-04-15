import React from 'react';
import {
  Treemap,
  XYPlot,
  VerticalBarSeries,
  LineSeries,
  XAxis,
  YAxis,
  HorizontalGridLines,
  LabelSeries,
  Borders
} from 'react-vis';
import {interpolateReds, interpolateViridis} from 'd3-scale-chromatic';
import {AlongTheLake} from '../../examples/large-examples/along-the-lake';
import {transposeMatrix} from '../../src/utils';
import {RV_COLORS} from '../colors';


const setColr = (value) =>
  interpolateReds(1 - Math.sqrt(1 - (value - 0) / (705000 - 0)));

const lakeDomain = AlongTheLake.reduce((acc, row) => {
  row.forEach(({value}) => {
    acc.min = Math.min(acc.min, value);
    acc.max = Math.max(acc.max, value);
  });
  return acc;
}, {min: Infinity, max: -Infinity});

const setColr3 = (({min, max}) => (value) =>
  interpolateViridis(Math.sqrt((value - Math.sqrt(min)) / (Math.sqrt(max) - Math.sqrt(min)))))(lakeDomain);

const data = {children: transposeMatrix(AlongTheLake).map(row => {
  return {
    children: row.map(({value, state}) => {
      // [
      //     'Michigan 1',
      //     'Wisconsin 1',
      //     'Illinois 1',
      //     'Indiana 1',
      //     'Michigan 2'
      //   ]
      return ({
        size: Math.sqrt(value),
        color: setColr3(Math.sqrt(value))
        // color: state === 'Michigan 1' ? setColr3(Math.sqrt(value)) : 'transparent'
      });
    })
  };
})};

function labelData(node) {
  if (!node.children) {
    node.title = node.size || 0;
    // node.title = `${Math.round(node.size / 1000)}k`;
    // node.color = setColr(node.size);
    return node.size;
  }
  const childrenSum = node.children.reduce((acc, child) => {
    return acc + labelData(child);
  }, 0);
  node.title = childrenSum;
  // node.title = '';
  // node.color = 'rgba(0, 0, 0, 0)';
  return childrenSum;
}

function barChart() {
  const data = require('../../examples/large-examples/chicago-arrests').PREPPED_ZONES;
  return (
    <div style={{display: 'flex', maxWidth: 1100, flexWrap: 'wrap'}}>
      {
        [
          {domestic: false, arrest: false},
          {domestic: false, arrest: true},
          {domestic: true, arrest: false},
          {domestic: true, arrest: true}
        ].map(({domestic, arrest}, idx) => {
          return (
            <XYPlot
              yDomain={[0, 703709]}
              key={`bar-s-${idx}`}
              xType="ordinal"
              xDomain={['CENTRAL', 'NORTH', 'SOUTH', 'WEST']}
              colorType="literal"
              getColor={d => {
                const colorMap = {
                  CENTRAL: '#88572C',
                  NORTH: '#FF991F',
                  SOUTH: '#F15C17',
                  WEST: '#19CDD7'
                };
                return colorMap[d.x];
              }}
              height={250}
              width={250}>
              <VerticalBarSeries
                data={data
                  .filter(d => d.domestic === domestic && d.arrest === arrest)
                  .map(d => ({x: d.zone, y: d.count}))
                }/>
              <XAxis />
              <YAxis tickFormat={d => `${d / 1000}k`}/>
            </XYPlot>
          );
        })
      }
    </div>
  );
}

function LineChart() {
  return (
    <XYPlot
      margin={{
        left: 100,
        right: 50,
        top: 50,
        bottom: 50
      }}
      yDomain={[300, 3700000]}
      yType="log"
      height={1000}
      width={500}>
      <HorizontalGridLines />
      {transposeMatrix(AlongTheLake).map((row, key) => {
        return (<LineSeries
          color={RV_COLORS[(key + 4) % RV_COLORS.length]}
          data={row.map(({year, value}) => ({
            x: Number(year),
            y: (Number(value))
          }))}
          key={key}/>);
      })}
      <Borders style={{
        bottom: {fill: '#fff', opacity: 0.8},
        left: {fill: '#fff'},
        right: {fill: '#fff'},
        top: {fill: '#fff'}
      }}/>
      <LabelSeries
        data={
          transposeMatrix(AlongTheLake).map((row, key) => {
            const cell = row[row.length - 1];
            return {
              x: Number(cell.year),
              y: (Number(cell.value)),
              label: cell.name,
              style: {
                fill: RV_COLORS[(key + 4) % RV_COLORS.length],
                fontSize: 10,
                textAnchor: 'start',
                alignmentBaseline: 'bottom'
              }
            };
          })
        } />

      <XAxis tickFormat={d => d}/>
      <YAxis tickFormat={d => `${d / 1000}k`}/>
    </XYPlot>
  );
}

function sunburst() {
  // const data = require('../../examples/large-examples/chicago-arrests').SUNBURST_DATA;
  // labelData(data);
  // const data = {children: [...new Array(10)]
  //   .map((_, idx) => {
  //     return {
  //       children: [...new Array(10)].map((__, jdx) => ({
  //         size: idx * jdx, children: [], color: setColr2(idx * jdx)}))
  //     }
  //   })};
  return (
    <Treemap
    data={data}
    mode="slicedice"
    renderMode="SVG"
    hideRootNode
    style={{
      stroke: 'white',
      strokeOpacity: 1,
      strokeWidth: '0.8'
    }}
    margin={0}
    colorType="literal"
    padding={0}
    getLabel={d => !d.title && d.radius0 ? '' : `${Math.round(d.title / 1000)}k`}
    width={500}
    height={250}/>
  );
}

export default function PivotogramAlts() {

  // BAR CHART
  // return barChart();
  // SUNBURST
  // return sunburst();
  // LINE MAN FOR THE COUNTY
  return LineChart();
}
