import React from 'react';

import {interpolateInferno} from 'd3-scale-chromatic';

import {
  XYPlot,
  PolygonSeries,
  LabelSeries,
  LineSeries,
  XAxis,
  YAxis,
  DiscreteColorLegend
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

function decorateGonsWithErrors(data, gons) {
  const tableSum = data.reduce((acc, row) => acc + row.reduce((mem, cell) => mem + cell, 0), 0);
  const expectedAreas = data.map(row => row.map(cell => cell / tableSum));
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[0].length; j++) {
      const gonArea = area(gons[i * data[0].length + j].vertices);
      const computedErr = Math.abs(gonArea - expectedAreas[i][j]) / Math.max(gonArea, expectedAreas[i][j]);
      gons[i * data[0].length + j].individualError = computedErr;
    }
  }
  return gons;
}

function colorCell(cell, index, fillMode) {
  switch (fillMode) {
  case 'errorHeat':
    return interpolateInferno(Math.sqrt(cell.individualError));
  case 'byValue':
    return RV_COLORS[(cell.value) % RV_COLORS.length];
  default:
  case 'periodicColors':
    return RV_COLORS[(index + 3) % RV_COLORS.length];
  }
}

function cartogramPlot(gons, fillMode, showLabels) {
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
            fill: colorCell(cell, index, fillMode)
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
      {showLabels && <LabelSeries data={gons.map((cell, index) => ({
        ...geoCenter(cell.vertices),
        label: `${cell.value}`
      }))} />}

      {showLabels && <LabelSeries data={gons.map((cell, index) => {
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
    converged: false,
    maxError: NaN,
    fillMode: 'periodicColors',
    showLabels: true
  }

  componentDidMount() {
    const {data, iterations, technique, withUpdate, stepSize = 100, adaptive} = this.props;

    if (adaptive) {
      const startTime = (new Date()).getTime();
      const {gons, error, stepsTaken} = tableCartogramAdaptive({data});
      const endTime = (new Date()).getTime();
      this.setState({
        gons: decorateGonsWithErrors(data, gons),
        error,
        startTime,
        endTime,
        loaded: true,
        stepsTaken,
        converged: true
      });
      return;
    }

    if (!withUpdate) {
      new Promise((resolve, reject) => {
        const startTime = (new Date()).getTime();
        const gons = tableCartogram(data, iterations, technique);
        const endTime = (new Date()).getTime();
        const {error, maxError} = computeErrors(data, gons);
        resolve({
          gons: decorateGonsWithErrors(data, gons),
          error,
          startTime,
          endTime,
          maxError,
          converged: true
        });
      }).then(state => this.setState({...state, loaded: true, stepsTaken: iterations}));
      return;
    }

    const cartogram = tableCartogramWithUpdate(data, technique);
    const startTime = (new Date()).getTime();
    const ticker = setInterval(() => {
      const gons = cartogram(this.state.stepsTaken ? stepSize : 0);
      // const gons = cartogram(
      //   this.state.stepsTaken ? stepSize : 0,
      //   this.state.stepsTaken > 100000 ? 'gradient' : 'monteCarlo');
      const endTime = (new Date()).getTime();
      const {error, maxError} = computeErrors(data, gons);
      const previousValueAndCount = this.state.previousValueAndCount;
      if (previousValueAndCount.value !== error) {
        previousValueAndCount.count = 0;
        previousValueAndCount.value = error;
      } else {
        previousValueAndCount.count += 1;
      }
      this.setState({
        gons: decorateGonsWithErrors(data, gons),
        error,
        maxError,
        startTime,
        endTime,
        loaded: true,
        stepsTaken: this.state.stepsTaken + stepSize,
        errorLog: this.state.errorLog.concat([{x: this.state.stepsTaken, y: error, z: maxError}]),
        previousValueAndCount
      });
      if (
        this.state.converged ||
        (previousValueAndCount.count > CONVERGENCE_THRESHOLD) ||
        previousValueAndCount.value < 0.001 ||
        isNaN(error)
      ) {
        clearInterval(ticker);
        this.setState({converged: true});
      }
    }, 100);
  }

  displayReadout() {
    const {technique} = this.props;
    const {errorLog, error, maxError, endTime, startTime, stepsTaken, converged, fillMode} = this.state;
    return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <p>
          {`${technique.toUpperCase()} - ${converged ? 'converged' : 'running'}`} <br/>
          {`Steps taken ${stepsTaken}`} <br/>
          {`AVERAGE ERROR ${Math.floor(error * Math.pow(10, 7)) / Math.pow(10, 5)} %`} <br/>
          {`MAX ERROR ${Math.floor(maxError * Math.pow(10, 7)) / Math.pow(10, 5)} %`} <br/>
          {`COMPUTATION TIME ${(endTime - startTime) / 1000} seconds`} <br/>
        </p>
        {(errorLog.length > 0) && <XYPlot
          yDomain={[0, errorLog[0].y]}
          width={300} height={300}>
          <LineSeries data={errorLog}/>
          <LineSeries data={errorLog} getY={d => d.z}/>
          <XAxis title="Steps"/>
          <YAxis title="Error" tickFormat={d => `${d * 100}%`}/>
        </XYPlot>}
        <DiscreteColorLegend
          orientation="horizontal"
          width={300}
          items={['AVG', 'MAX']} />
        <button onClick={() => {
          const colorModes = ['errorHeat', 'byValue', 'periodicColors'];
          const fillIndex = colorModes.findIndex(d => d === fillMode);
          this.setState({
            fillMode: colorModes[(fillIndex + 1) % colorModes.length]
          });
        }}>{`CHANGE COLOR MODE (current ${fillMode})`}</button>
        <button onClick={() => this.setState({showLabels: !this.state.showLabels})}>TOGGLE LABELS</button>
        <button onClick={() => this.setState({converged: true})}>STOP</button>
      </div>
    );
  }

  render() {
    const {gons, loaded, fillMode, showLabels} = this.state;
    return (
      <div style={{display: 'flex', alignItems: 'center'}}>
        {loaded && cartogramPlot(gons, fillMode, showLabels)}
        {loaded && this.displayReadout()}
      </div>
    );
  }
}
