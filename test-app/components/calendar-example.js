import React from 'react';

import {interpolateReds} from 'd3-scale-chromatic';

import {
  XYPlot,
  PolygonSeries,
  LabelSeries
} from 'react-vis';

import {
  tableCartogramAdaptive
} from '../../';

import {geoCenter} from '../../iterative-methods/utils';

function decorateGonsWithData(data, gons) {
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[0].length; j++) {
      gons[i * data[0].length + j].data = data[i][j];
    }
  }
  return gons;
}

export default class CalendarDisplay extends React.Component {
  state = {
    loaded: false,
    gons: []
  }

  componentDidMount() {
    const {data} = this.props;
    Promise.resolve()
      .then(() => {
        const {gons} = tableCartogramAdaptive({
          data: data.map(row => row.map(d => d.count)),
          targetAccuracy: 0.001
        });

        this.setState({
          gons: decorateGonsWithData(data, gons),
          loaded: true,
          converged: true
        });
      });

  }

  render() {
    const {gons, loaded} = this.state;
    return (
      <div style={{display: 'flex', alignItems: 'center'}}>
        {loaded && <XYPlot
          animation
          colorType="linear"
          yDomain={[1, 0]}
          margin={25}
          width={350}
          height={350}>
          {gons.filter(d => {
            return new Date(d.data.date).getMonth() === 6;
          }).map((cell, index) => {
            return (<PolygonSeries
              key={`triangle-${index}`}
              data={cell.vertices}
              style={{
                strokeWidth: 1,
                stroke: 'black',
                strokeOpacity: 1,
                opacity: 0.5,
                fill: interpolateReds((cell.data.count - 50) / 50)
              }}/>);
          })}
          <PolygonSeries
            style={{
              fill: 'none',
              strokeOpacity: 1,
              strokeWidth: 1,
              stroke: 'black'
            }}
            data={[{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 1, y: 0}]} />
          <LabelSeries data={gons.filter(d => {
            return new Date(d.data.date).getMonth() === 6;
          }).map((cell, index) => {
            return ({
              ...geoCenter(cell.vertices),
              label: `${new Date(cell.data.date).getDate()}`
            });
          })} />
          <LabelSeries
            allowOffsetToBeReversed={false}
            labelAnchorX="middle"
            labelAnchorY="middle"
            data={gons.slice(0, 7).map((cell, index) => {
              const {x} = geoCenter(cell.vertices);
              const DAYS = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'];
              return ({
                x,
                y: -0.05,
                label: DAYS[new Date(cell.data.date).getDate() - 1]
              });
            })} />
        </XYPlot>}
      </div>
    );
  }
}
