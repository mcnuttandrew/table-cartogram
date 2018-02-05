import React from 'react';

import {
  XYPlot,
  PolygonSeries,
  LabelSeries
} from 'react-vis';

import {partitionQuadrangle, geoCenter, area, round} from '../../utils';
import {RV_COLORS} from '../colors';

export default class PartitionPolygonExample extends React.Component {
  render() {
    const {areas, points} = this.props;

    const {alpha, beta, gamma} = partitionQuadrangle(points, [], areas, true);

    return (
      <div>
        <XYPlot
          animation
          colorType="linear"
          width={600}
          height={300} >
          {[alpha, beta, gamma].map((cell, index) => {
            return (<PolygonSeries
              key={`polygon-${index}`}
              data={cell}
              style={{
                strokeWidth: 0.5,
                strokeOpacity: 1,
                opacity: 0.5,
                // fill: cell.value
                fill: RV_COLORS[(index + 3) % RV_COLORS.length]
              }}/>);
          })}
          <LabelSeries data={[alpha, beta, gamma].map((vertices, index) => {
            return {...geoCenter(vertices), label: `${round(area(vertices))}`};
          })} />
          <PolygonSeries
            data={points}
            style={{
              fill: 'none',
              strokeOpacity: 1,
              strokeWidth: 4,
              stroke: 'black'
              // fill: cell.value
              // fill: RV_COLORS[(index + 2) % RV_COLORS.length]
            }}/>
        </XYPlot>
      </div>
    );
  }
}
