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
  tableCartogramWithUpdate,
  tableCartogramAdaptive
} from '../../';

import {
  area,
  round,
  geoCenter
} from '../../old-stuff/utils';
import {computeErrors} from '../test-app-utils';

import {RV_COLORS} from '../colors';

const CONVERGENCE_THRESHOLD = 10;

function cartogramPlot(gons) {
  const labelsOn = true;
  return (
    <XYPlot
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
            // fill: RV_COLORS[(cell.value) % RV_COLORS.length]
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
      {labelsOn && <LabelSeries data={gons.map((cell, index) => ({
        ...geoCenter(cell.vertices),
        label: `${cell.value}`
      }))} />}

      {labelsOn && <LabelSeries data={gons.map((cell, index) => {
        return {
          ...geoCenter(cell.vertices),
          label: `${round(area(cell.vertices), Math.pow(10, 6))}`,
          style: {
            transform: 'translate(0, 15)'
          }
        };
      })} />}
    </XYPlot>
  );
}

export default class IterativeDisplay extends React.Component {
  state = {
    loaded: false,
    error: null,
    errorLog: [],
    gons: [],
    stepsTaken: 0,
    previousValueAndCount: {value: null, count: 0},
    converged: false
  }

  componentDidMount() {
    const {data, iterations, technique, withUpdate, stepSize = 100, adaptive} = this.props;

    if (adaptive) {
      const startTime = (new Date()).getTime();
      const {gons, error, stepsTaken} = tableCartogramAdaptive({data});
      const endTime = (new Date()).getTime();
      this.setState({
        gons,
        error,
        startTime,
        endTime,
        loaded: true,
        stepsTaken
      });
      return;
    }

    if (!withUpdate) {
      new Promise((resolve, reject) => {
        const startTime = (new Date()).getTime();
        const gons = tableCartogram(data, iterations, technique);
        const endTime = (new Date()).getTime();
        const error = computeErrors(data, gons);
        resolve({gons, error, startTime, endTime});
      }).then(state => this.setState({...state, loaded: true, stepsTaken: iterations}));
      return;
    }

    const cartogram = tableCartogramWithUpdate(data, technique);
    const startTime = (new Date()).getTime();
    const ticker = setInterval(() => {
      const gons = cartogram(this.state.stepsTaken ? stepSize : 0);
      const endTime = (new Date()).getTime();
      const error = computeErrors(data, gons);
      const previousValueAndCount = this.state.previousValueAndCount;
      if (previousValueAndCount.value !== error) {
        previousValueAndCount.count = 0;
        previousValueAndCount.value = error;
      } else {
        previousValueAndCount.count += 1;
      }
      this.setState({
        gons,
        error,
        startTime,
        endTime,
        loaded: true,
        stepsTaken: this.state.stepsTaken + stepSize,
        errorLog: this.state.errorLog.concat([{x: this.state.stepsTaken, y: error}]),
        previousValueAndCount
      });
      if (
        this.state.converged ||
        (previousValueAndCount.count > CONVERGENCE_THRESHOLD) ||
        previousValueAndCount.value < 0.001
      ) {
        clearInterval(ticker);
        this.setState({converged: true});
      }
    }, 500);
  }

  displayReadout() {
    const {technique} = this.props;
    const {errorLog, error, endTime, startTime, stepsTaken, converged} = this.state;
    return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <p>
          {technique.toUpperCase()} <br/>
          {`Steps taken ${stepsTaken}`} <br/>
          {`AVERAGE ERROR ${round(error, Math.pow(10, 6)) * 100} %`} <br/>
          {`COMPUTATION TIME ${(endTime - startTime) / 1000} seconds`} <br/>
          {converged ? 'converged' : ''}
        </p>
        {(errorLog.length > 0) && <XYPlot
          yDomain={[0, errorLog[0].y]}
          width={300} height={300}>
          <LineSeries data={errorLog}/>
          <XAxis />
          <YAxis />
        </XYPlot>}
        <button onClick={() => this.setState({converged: true})}>STOP</button>
      </div>
    );
  }

  render() {
    const {gons, loaded} = this.state;
    return (
      <div style={{display: 'flex', alignItems: 'center'}}>
        {loaded && cartogramPlot(gons)}
        {loaded && this.displayReadout()}
      </div>
    );
  }
}
