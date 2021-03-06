import React, {useState} from 'react';
import {
  Treemap,
  RadialChart,
  XYPlot,
  PolygonSeries,
  LabelSeries,
  VerticalBarSeries,
  XAxis,
  YAxis,
} from 'react-vis';

const data = [
  {label: 'Midwest', angle: 38042, color: '#19CDD7'},
  {label: 'Canada', angle: 429, color: '#DDB27C'},
  {label: 'South', angle: 68307, color: '#88572C'},
  {label: 'West', angle: 39481, color: '#FF991F'},
  {label: 'Northeast', angle: 30142, color: '#F15C17'},
  {label: 'US Islands', angle: 5111, color: '#223F9A'},
];

let offset = 0;
const barData = data.map((d) => {
  const newObj = {
    ...d,
    y: 0,
    x: offset,
    x0: offset + d.angle,
  };
  offset += d.angle;
  return newObj;
});

export default function PolygramAlts(): JSX.Element {
  const [alt, setAlt] = useState('tree');
  return (
    <div>
      <select value={alt} onChange={(x): any => setAlt(x.target.value)}>
        {['tree', 'radial', 'stacked', 'bar'].map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
      {alt === 'tree' && (
        <Treemap
          data={
            {
              children: data.map((x) => ({...x, size: x.angle})),
            } as any
          }
          mode="resquarify"
          renderMode="SVG"
          hideRootNode
          style={{
            stroke: 'white',
            strokeOpacity: 1,
            strokeWidth: '0.8',
          }}
          margin={0}
          colorType="literal"
          padding={0}
          width={500}
          height={500}
        />
      )}
      {alt === 'radial' && (
        <RadialChart
          margin={50}
          showLabels
          colorType="literal"
          data={data.map((d) => ({
            ...d,
            subLabel: `${Math.floor(d.angle / 100) / 10}k`,
          }))}
          width={400}
          height={400}
        />
      )}
      {alt === 'stacked' && (
        <XYPlot yType="category" width={500} height={100}>
          {barData.map(({x, x0, y, color}) => (
            <PolygonSeries
              colorType="literal"
              color={color}
              key={color}
              data={[
                {y: y - 1, x},
                {y: y - 1, x: x0},
                {y, x: x0},
                {y, x},
              ]}
            />
          ))}
          <LabelSeries
            data={barData.map((d) => ({
              ...d,
              style: {
                textAnchor: 'middle',
                alignmentBaseline: 'middle',
              },
              label: `${d.label}: ${Math.floor(d.angle / 100) / 10}k`,
            }))}
          />
        </XYPlot>
      )}
      {alt === 'bar' && (
        <XYPlot
          margin={{
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
          }}
          xDomain={data.map((d) => d.label)}
          width={500}
          height={300}
          xType="ordinal"
          colorType="literal"
        >
          <VerticalBarSeries
            data={data.map((d) => ({
              ...d,
              x: d.label,
              y: d.angle,
            }))}
          />
          <XAxis />
          <YAxis tickFormat={(d) => `${Math.floor(d / 100) / 10}k`} />
        </XYPlot>
      )}
    </div>
  );
}
