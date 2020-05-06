import React from 'react';
import {XYPlot, HeatmapSeries, LabelSeries} from 'react-vis';

export default function ExampleHeatmap({data}) {
  const updatedData = data.reduce(
    (acc, row, y) =>
      acc.concat(
        row.map((d, x) => {
          return {x, y, color: d};
        }),
      ),
    [],
  );
  return (
    <XYPlot
      xType="ordinal"
      yType="ordinal"
      yDomain={[...new Array(data.length)].map((d, i) => i).reverse()}
      width={500}
      height={500}
    >
      <HeatmapSeries colorRange={['white', 'red']} data={updatedData} />
      <LabelSeries data={updatedData} getLabel={(d) => d.color} />
    </XYPlot>
  );
}
