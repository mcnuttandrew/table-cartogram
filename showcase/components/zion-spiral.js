import React from 'react';
import {XYPlot, LineSeries, XAxis, YAxis, DiscreteColorLegend} from 'react-vis';
import {scaleLinear} from 'd3-scale';

import {RV_COLORS} from '../colors';

import {
  ZION_VISITORS_WITH_ANNOTATION,
  ZION_VISITORS_WITH_ANNOTATION_DOMAIN,
} from '../../examples/large-examples/zion-slice';

// console.log(ZION_VISITORS_WITH_ANNOTATION_DOMAIN);

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const monthMap = MONTHS.reduce((acc, month, idx) => {
  acc[month] = (Math.PI * 2 * idx) / 12;
  return acc;
}, {});
const monthMap2 = MONTHS.reduce((acc, month, idx) => {
  acc[month] = idx;
  return acc;
}, {});

// WORK ON THIS
const rScale = scaleLinear()
  .domain([ZION_VISITORS_WITH_ANNOTATION_DOMAIN.min, ZION_VISITORS_WITH_ANNOTATION_DOMAIN.max])
  .range([0, 1]);

const processedData = ZION_VISITORS_WITH_ANNOTATION.reduce((acc, row) => {
  row.forEach((month) => {
    const angle = monthMap[month.month];
    const radius = rScale(month.value);
    acc.push({x: radius * Math.cos(angle), y: radius * Math.sin(angle)});
  });
  return acc;
}, []);
export default class ZionExperiment extends React.Component {
  render() {
    return (
      <div>
        {
          // <XYPlot
          // height={500}
          // width={500}
          // xDomain={[-1, 1]}
          // yDomain={[-1, 1]}>
          // <LineSeries data={processedData} />
          // </XYPlot>
        }
        {
          <XYPlot yDomain={[0, ZION_VISITORS_WITH_ANNOTATION_DOMAIN.max]} height={500} width={500}>
            <YAxis tickFormat={(d) => `${Math.floor(d / 1000)}k`} />
            <XAxis tickFormat={(d) => MONTHS[d]} tickValues={[...new Array(12)].map((_, idx) => idx)} />
            {ZION_VISITORS_WITH_ANNOTATION.map((year, idx) => (
              <LineSeries
                color={RV_COLORS[idx]}
                key={`line-${idx}`}
                data={year.map((d) => ({
                  x: monthMap2[d.month],
                  y: d.value,
                }))}
              />
            ))}
            <DiscreteColorLegend
              orientation="horizontal"
              items={ZION_VISITORS_WITH_ANNOTATION.map((year, idx) => {
                return {color: RV_COLORS[idx], title: `${2016 - idx}`};
              })}
            />
          </XYPlot>
        }
      </div>
    );
  }
}
