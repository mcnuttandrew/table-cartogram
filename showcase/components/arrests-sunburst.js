import React from 'react';
import {Sunburst} from 'react-vis';

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
  const data = require('../../examples/large-examples/chicago-arrests').SUNBURST_DATA;
  labelData(data);
  return (
    <Sunburst
      data={data}
      hideRootNode
      style={{
        stroke: 'white',
        strokeOpacity: 1,
        strokeWidth: '0.8'
      }}
      colorType="literal"
      getLabel={d => {
        // console.log(d)
        if (!d.title && d.radius0) {
          return '';
          // d.rotation = 0;
          // d.radius0 += 40;
          // switch (d.depth) {
          // case 3:
          //   return 'ARRESTED';
          // case 2:
          //   return 'DOMESTIC';
          // case 1:
          //   return 'REGION';
          // default:
          // case 0:
          //   return '!!';
          // }
        }
        return `${Math.round(d.title / 1000)}k`;
      }}
      width={500}
      height={500}/>
  );
}
