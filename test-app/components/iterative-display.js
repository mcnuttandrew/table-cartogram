import React from 'react';

import {
  XYPlot,
  PolygonSeries,
  LabelSeries,
  LineSeries,
  XAxis,
  YAxis
} from 'react-vis';

import {
  tableCartogram,
  tableCartogramWithUpdate
} from '../../';

import {
  area,
  round,
  geoCenter
} from '../../old-stuff/utils';

import {RV_COLORS} from '../colors';

function computeErrors(data, gons) {
  const tableSum = data.reduce((acc, row) => acc + row.reduce((mem, cell) => mem + cell, 0), 0);
  const expectedAreas = data.map(row => row.map(cell => cell / tableSum));
  const errors = [];
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[0].length; j++) {
      const gonArea = area(gons[i * data[0].length + j].vertices);
      const computedErr = Math.abs(gonArea - expectedAreas[i][j]) / Math.max(gonArea, expectedAreas[i][j]);
      errors.push(computedErr);
    }
  }
  let error = errors.reduce((acc, row) => acc + row, 0);
  // console.log('sum error', error, error / errors.length)
  error /= errors.length;
  return error;
}

export default class IterativeDisplay extends React.Component {
  state = {
    loaded: false,
    error: null,
    errorLog: [],
    gons: [],
    stepsTaken: 0
  }
  componentDidMount() {
    const {data, iterations, technique, withUpdate} = this.props;
    if (!withUpdate) {
      new Promise((resolve, reject) => {
        const startTime = (new Date()).getTime();
        const gons = tableCartogram(data, iterations, technique);
        const endTime = (new Date()).getTime();
        const error = computeErrors(data, gons);
        resolve({gons, error, startTime, endTime});
      }).then(state => this.setState({...state, loaded: true}));
      return;
    }

    const cartogram = tableCartogramWithUpdate(data, technique);
    const STEP_SIZE = 1000;
    const startTime = (new Date()).getTime();
    setInterval(() => {
      const gons = cartogram(STEP_SIZE);
      const endTime = (new Date()).getTime();
      const error = computeErrors(data, gons);
      this.setState({
        gons, 
        error, 
        startTime, 
        endTime, 
        loaded: true, 
        stepsTaken: this.state.stepsTaken + STEP_SIZE,
        errorLog: this.state.errorLog.concat([{x: this.state.stepsTaken, y: error}])
      });
    }, 1000)
  }
  render() {
    const {technique} = this.props;
    const {errorLog, gons, error, loaded, endTime, startTime, stepsTaken} = this.state;

    return (
      <div style={{display: 'flex', alignItems: 'center'}}>
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
                strokeWidth: 1,
                stroke: 'black',
                strokeOpacity: 1,
                opacity: 0.5,
                fill: RV_COLORS[(index + 3) % RV_COLORS.length]
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
          <LabelSeries data={gons.map((cell, index) => ({
            ...geoCenter(cell.vertices),
            label: `${cell.value}`
          }))} />

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
        <div style={{display: 'flex', flexDirection: 'column'}}>
          {loaded && <p>
            {technique.toUpperCase()} <br/>
            {`Steps taken ${stepsTaken}`} <br/>
            {`AVERAGE ERROR ${round(error, Math.pow(10, 6)) * 100} %`} <br/>
            {`COMPUTATION TIME ${(endTime - startTime) / 1000} seconds`} <br/>
          </p>}
          {(errorLog.length > 0) && <XYPlot 
            yDomain={[0, errorLog[0].y]}
            width={300} height={300}>
            <LineSeries data={errorLog}/>
            <XAxis />
            <YAxis />
          </XYPlot>}
        </div>
      </div>
    );
  }
}
