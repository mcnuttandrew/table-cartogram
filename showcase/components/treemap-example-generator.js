import React from 'react';
import {Treemap} from 'react-vis';

import {RV_COLORS} from '../colors';

const style = {
  strokeWidth: 0.5,
  stroke: 'black',
  strokeOpacity: 1,
  fillOpacity: 0.5,
};

export default function ExampleTreemap({data}) {
  const treeData = {
    title: '',
    color: 'rgba(255, 255, 255, 0)',
    children: data
      .reduce((acc, row) => acc.concat(row), [])
      .map((d, i) => ({
        size: d,
        title: d,
        color: RV_COLORS[(i + 3) % RV_COLORS.length],
      })),
  };

  return (
    <Treemap data={treeData} width={500} height={500} style={style} colorType="literal" renderMode="SVG" />
  );
}
