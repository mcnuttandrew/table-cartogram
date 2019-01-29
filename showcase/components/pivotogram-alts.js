import React from 'react';
import {
  Sunburst,
  XYPlot,
  VerticalBarSeries,
  XAxis,
  YAxis
} from 'react-vis';

function labelData(node) {
  if (!node.children) {
    node.title = node.size || 0;
    return node.size;
  }
  const childrenSum = node.children.reduce((acc, child) => {
    return acc + labelData(child);
  }, 0);
  node.title = childrenSum;
  return childrenSum;
}

export default function ArrestsSunburst() {
  const data = require('../../examples/large-examples/chicago-arrests').PREPPED_ZONES;
  // BAR CHART
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
  // SUNBURST
  // const data = require('../../examples/large-examples/chicago-arrests').SUNBURST_DATA;
  // labelData(data);
  // return (
  //   <Sunburst
  //     data={data}
  //     hideRootNode
  //     style={{
  //       stroke: 'white',
  //       strokeOpacity: 1,
  //       strokeWidth: '0.8'
  //     }}
  //     colorType="literal"
  //     getLabel={d => !d.title && d.radius0 ? '' : `${Math.round(d.title / 1000)}k`}
  //     width={500}
  //     height={500}/>
  // );
}
