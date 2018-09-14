import React from 'react';

import {interpolateInferno, interpolateReds} from 'd3-scale-chromatic';

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
  computeErrors,
  round,
  geoCenter
} from '../../iterative-methods/utils';

import {RV_COLORS} from '../colors';

const CONVERGENCE_THRESHOLD = 10;

function decorateGonsWithErrors(data, gons, accessor) {
  const tableSum = data.reduce((acc, row) => acc + row.reduce((mem, cell) => mem + accessor(cell), 0), 0);
  const expectedAreas = data.map(row => row.map(cell => accessor(cell) / tableSum));
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
          key={`quad-${index}`}
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
        label: `${cell.value}`,
        style: {
          textAnchor: 'middle',
          alignmentBaseline: 'middle'
        }
      }))} />}

      {showLabels && <LabelSeries data={gons.map((cell, index) => {
        return {
          ...geoCenter(cell.vertices),
          label: `${round(area(cell.vertices), Math.pow(10, 6))}`,
          style: {
            transform: 'translate(0, 15)',
            textAnchor: 'middle',
            alignmentBaseline: 'middle'
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
    maxError: NaN,
    fillMode: 'periodicColors',
    showLabels: true,
    runningMode: 'running'
  }

  componentDidMount() {
    switch (this.props.computeMode) {
    case 'adaptive':
      this.adaptiveBuild();
      break;
    case 'iterative':
      this.iterativeBuild();
      break;
    default:
    case 'direct':
      this.directBuild();
      break;
    }
  }

  adaptiveBuild() {
    const {data, accessor = d => d} = this.props;
    const startTime = (new Date()).getTime();
    const {gons, error, stepsTaken, maxError} = tableCartogramAdaptive({data});
    const endTime = (new Date()).getTime();
    this.setState({
      gons: decorateGonsWithErrors(data, gons, accessor),
      error,
      startTime,
      endTime,
      loaded: true,
      stepsTaken,
      runningMode: 'finished',
      maxError
    });
  }

  iterativeBuild() {
    const {data, technique, stepSize, accessor = d => d} = this.props;
    const cartogram = tableCartogramWithUpdate(data, technique, accessor, 'pickBest');
    const startTime = (new Date()).getTime();
    const ticker = setInterval(() => {
      const gons = cartogram(this.state.stepsTaken ? stepSize : 0);
      const endTime = (new Date()).getTime();
      const {error, maxError} = computeErrors(data, gons, accessor);
      const previousValueAndCount = this.state.previousValueAndCount;
      if (previousValueAndCount.value !== error) {
        previousValueAndCount.count = 0;
        previousValueAndCount.value = error;
      } else {
        previousValueAndCount.count += 1;
      }
      this.setState({
        gons: decorateGonsWithErrors(data, gons, accessor),
        error,
        maxError,
        startTime,
        endTime,
        loaded: true,
        stepsTaken: this.state.stepsTaken + stepSize,
        errorLog: this.state.errorLog.concat([{x: this.state.stepsTaken, y: error, z: maxError}]),
        previousValueAndCount
      });
      const converged = previousValueAndCount.value < 0.001;
      const halted = previousValueAndCount.count > CONVERGENCE_THRESHOLD;
      const errored = isNaN(error);
      if (this.state.runningMode !== 'running' || halted || converged || errored) {
        clearInterval(ticker);
        this.setState({
          runningMode: converged ? 'converged' :
            (halted ? 'stopped' : (errored ? 'errored' : this.state.runningMode))
        });
      }
    }, 100);
  }

  directBuild() {
    const {data, iterations, technique, accessor = d => d} = this.props;
    Promise.resolve()
      .then(() => {
        const startTime = (new Date()).getTime();
        const gons = tableCartogram(data, technique, 'pickBest', iterations);
        const endTime = (new Date()).getTime();
        const {error, maxError} = computeErrors(data, gons, accessor);
        this.setState({
          gons: decorateGonsWithErrors(data, gons, accessor),
          error,
          startTime,
          endTime,
          maxError,
          runningMode: 'finished',
          loaded: true,
          stepsTaken: iterations
        });
      });
  }

  displayReadout() {
    const {computeMode, technique} = this.props;
    const {errorLog, error, maxError, endTime, startTime, stepsTaken, runningMode, fillMode} = this.state;
    return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <p>
          {`${technique.toUpperCase()} - ${runningMode.toUpperCase()}`} <br/>
          {`COMPUTE MODE: ${computeMode.toUpperCase()}`} <br/>
          {`Steps taken ${stepsTaken}`} <br/>
          {`AVERAGE ERROR ${Math.floor(error * Math.pow(10, 7)) / Math.pow(10, 5)} %`} <br/>
          {`MAX ERROR ${Math.floor(maxError * Math.pow(10, 7)) / Math.pow(10, 5)} %`} <br/>
          {`COMPUTATION TIME ${(endTime - startTime) / 1000} seconds`} <br/>
        </p>
        {(errorLog.length > 0) && computeMode === 'iterative' && <XYPlot
          yDomain={[0, errorLog[0].y]}
          width={300} height={300}>
          <LineSeries data={errorLog}/>
          <LineSeries data={errorLog} getY={d => d.z}/>
          <XAxis title="Steps"/>
          <YAxis title="Error" tickFormat={d => `${d * 100}%`}/>
        </XYPlot>}
        {computeMode === 'iterative' && <DiscreteColorLegend
          orientation="horizontal"
          width={300}
          items={['AVG', 'MAX']} />}
        <button onClick={() => {
          const colorModes = ['errorHeat', 'byValue', 'periodicColors'];
          const fillIndex = colorModes.findIndex(d => d === fillMode);
          this.setState({
            fillMode: colorModes[(fillIndex + 1) % colorModes.length]
          });
        }}>{`CHANGE COLOR MODE (current ${fillMode})`}</button>
        <button onClick={() => this.setState({showLabels: !this.state.showLabels})}>TOGGLE LABELS</button>
        <button onClick={() => this.setState({runningMode: 'stopped'})}>STOP</button>
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
