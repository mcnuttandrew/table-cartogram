import React from 'react';
import {Sunburst} from 'react-vis';

export default function ArrestsSunburst() {
  const data = require('../../examples/large-examples/chicago-arrests').SUNBURST_DATA;

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
      width={500}
      height={500}/>
  );
}
