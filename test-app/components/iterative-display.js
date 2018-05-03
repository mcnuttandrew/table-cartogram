import React from 'react';

import {
  XYPlot,
  PolygonSeries,
  LabelSeries
} from 'react-vis';

import {
  tableCartogram
} from '../../iterative';

import {
  area,
  round,
  geoCenter
} from '../../utils';

import {RV_COLORS} from '../colors';

export default class IterativeDisplay extends React.Component {
  state = {
    loaded: false,
    error: null,
    gons: []
  }
  componentDidMount() {
    const {data, iterations, technique} = this.props;
    new Promise((resolve, reject) => {
      const startTime = (new Date()).getTime();
      const gons = tableCartogram(data, iterations, technique);
      const endTime = (new Date()).getTime();
      const errors = [];
      const tableSum = data.reduce((acc, row) => acc + row.reduce((mem, cell) => mem + cell, 0), 0);
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[0].length; j++) {
          const gonArea = area(gons[i * data[0].length + j].vertices);
          const expectedArea = data[i][j] / tableSum;
          errors.push(Math.abs(gonArea - expectedArea) / expectedArea);
        }
      }
      const error = errors.reduce((acc, row) => acc + row, 0) / errors.length;
      resolve({gons, error, startTime, endTime});
    }).then(state => this.setState({...state, loaded: true}));
  }
  render() {
    const {technique} = this.props;
    const {gons, error, loaded, endTime, startTime} = this.state;

    return (
      <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        {loaded && <XYPlot
          animation
          colorType="linear"
          yDomain={[1, 0]}
          width={600}
          height={600}>
          {gons.map((cell, index) => {
            return (<PolygonSeries
              key={`triangle-${index}`}
              data={cell.vertices}
              style={{
                strokeWidth: 0.5,
                // color={area(cell.vertices)}
                strokeOpacity: 1,
                opacity: 0.5,
                fill: RV_COLORS[(index + 3) % RV_COLORS.length]
              }}/>);
          })}
          {
            // gons.map((cell, index) => {
            //   return (<PolygonSeries
            //     key={`poly-${index}`}
            //     data={cell.vertices}
            //     style={{
                  // fill: 'none',
                  // strokeOpacity: 1,
                  // strokeWidth: 1,
                  // stroke: 'black'
            //     }}/>);
            // })
          }
          <PolygonSeries
            style={{
              fill: 'none',
              strokeOpacity: 1,
              strokeWidth: 1,
              stroke: 'black'
            }}
            data={[{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 1, y: 0}]} />
          <LabelSeries data={gons.map((cell, index) => {
            return {
              ...geoCenter(cell.vertices),
              label: cell.value
            };
            // return {...geoCenter(cell.vertices), label: `${round(area(cell.vertices), Math.pow(10, 6))}`};
          })} />

          <LabelSeries data={gons.map((cell, index) => {
            return {
              ...geoCenter(cell.vertices),
              label: `${round(area(cell.vertices), Math.pow(10, 6))}`,
              style: {
                transform: 'translate(0, 15)'
              }
            };
          })} />
        </XYPlot>}
        {!loaded && <h1>COMPUTING</h1>}
        {loaded && <h4>{technique.toUpperCase()}</h4>}
        {loaded && <h4>{`AVERAGE ERROR ${String(error * 100).slice(0, 5)} %`}</h4>}
        {loaded && <h4>{`COMPUTATION TIME ${(endTime - startTime) / 1000} seconds`}</h4>}
      </div>
    );
  }
}
