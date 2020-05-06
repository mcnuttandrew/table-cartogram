import React from 'react';
import TableCartogram from './table-cartogram';
import {tableCartogramAdaptive} from '../../';
import {ZION_VISITORS_WITH_ANNOTATION} from '../../examples/large-examples/zion-slice';

import ContinuousLegend from './continuous-legend';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const YEARS = ZION_VISITORS_WITH_ANNOTATION.map((d) => d[0].year);

function generateMarginFor(key, outline) {
  const counts = ZION_VISITORS_WITH_ANNOTATION.reduce((acc, row) => {
    row.forEach((cell) => {
      if (!acc[cell[key]]) {
        acc[cell[key]] = 0;
      }
      acc[cell[key]] += cell.value;
    });
    return acc;
  }, {});
  return [outline.map((cell) => ({val: counts[cell], label: cell}))];
}

export default class ZionExperiment extends React.Component {
  state = {
    loaded: false,
    gons: [],
    xLabels: [],
    yLabels: [],
  };

  componentDidMount() {
    Promise.resolve().then(() => {
      const basic = {targetAccuracy: 0.001, layout: 'psuedoCartogramLayout'};
      this.setState({
        gons: tableCartogramAdaptive({
          ...basic,
          data: ZION_VISITORS_WITH_ANNOTATION,
          targetAccuracy: 0.01,
          accessor: (d) => Number(d.value),
          height: 0.6,
          width: 1,
        }).gons,
        monthMargin: tableCartogramAdaptive({
          ...basic,
          data: generateMarginFor('month', MONTHS),
          targetAccuracy: 0.01,
          height: 0.1,
          width: 1,
          accessor: (d) => d.val,
        }).gons,
        yearMargin: tableCartogramAdaptive({
          ...basic,
          data: generateMarginFor('year', YEARS)[0].map((d) => [d]),
          targetAccuracy: 0.01,
          height: 0.6,
          width: 0.1,
          accessor: (d) => d.val,
        }).gons,
        loaded: true,
      });
    });
  }

  render() {
    const {gons, loaded, monthMargin, yearMargin} = this.state;
    const BOX_STYLE = {
      opacity: 1,
      strokeOpacity: 0,
    };
    if (loaded) {
      return (
        <div>
          <div
            style={{
              display: 'flex',
            }}
          >
            <TableCartogram
              data={yearMargin}
              showBorder={false}
              fillMode={'valueHeatRedWhiteBlue'}
              showAxisLabels={true}
              xLabels={[]}
              yLabels={YEARS.map((d) => `${d}`)}
              rectStyle={BOX_STYLE}
              clipToX
            />
            <TableCartogram
              data={gons}
              showBorder={false}
              fillMode={'valueHeatRedWhiteBlue'}
              showLabels={false}
              rectStyle={BOX_STYLE}
            />
            <ContinuousLegend d3ColorScale="interpolateRdBu" />
          </div>
          <TableCartogram
            data={monthMargin}
            showBorder={false}
            fillMode={'valueHeatRedWhiteBlue'}
            showLabels={false}
            xLabels={MONTHS}
            yLabels={[]}
            showAxisLabels={true}
            rectStyle={BOX_STYLE}
          />
        </div>
      );
    }
    return <div>loading</div>;
  }
}
