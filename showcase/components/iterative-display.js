import React from 'react';

import {
  XYPlot,
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
  fusePolygons
} from '../../src/utils';
import {COLOR_MODES} from '../colors';
import CartogramPlot from './table-cartogram';

const CONVERGENCE_THRESHOLD = 10;
const CONVERGENCE_BARRIER = 0.001;

function decorateGonsWithErrors(data, gons, accessor, dims) {
  const tableSum = data.reduce((acc, row) => acc + row.reduce((mem, cell) => mem + accessor(cell), 0), 0);
  const expectedAreas = data.map(row => row.map(cell => accessor(cell) / tableSum));
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[0].length; j++) {
      const gonArea = area(gons[i * data[0].length + j].vertices);
      const computedArea = gonArea / (dims.height * dims.width);
      const expectedArea = expectedAreas[i][j];
      const computedErr = Math.abs(computedArea - expectedArea) / Math.max(computedArea, expectedArea);
      gons[i * data[0].length + j].individualError = computedErr;
    }
  }
  return gons;
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
    fillMode: 'errorHeat',
    showLabels: false,
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
    const {
      data,
      accessor = d => d,
      layout,
      dims = {height: 1, width: 1},
      technique,
      computeAnnotationBoxBy = false
    } = this.props;
    const startTime = (new Date()).getTime();
    const {gons, error, stepsTaken, maxError} = tableCartogramAdaptive({
      data,
      layout,
      targetAccuracy: CONVERGENCE_BARRIER,
      technique,
      logging: true,
      ...dims
    });
    const endTime = (new Date()).getTime();
    this.setState({
      gons: decorateGonsWithErrors(data, gons, accessor, dims),
      error,
      startTime,
      endTime,
      loaded: true,
      stepsTaken,
      runningMode: 'finished',
      maxError,
      annotationBoxes: computeAnnotationBoxBy && fusePolygons(gons, computeAnnotationBoxBy)
    });
  }

  iterativeBuild() {
    const {
      data,
      technique,
      stepSize,
      accessor = d => d,
      layout,
      dims = {height: 1, width: 1},
      computeAnnotationBoxBy = false
    } = this.props;
    const cartogram = tableCartogramWithUpdate({
      data,
      technique,
      accessor,
      layout,
      ...dims
    });
    const startTime = (new Date()).getTime();
    const ticker = setInterval(() => {
      const gons = cartogram(this.state.stepsTaken ? stepSize : 0);
      const endTime = (new Date()).getTime();
      const {error, maxError} = computeErrors(data, gons, accessor, dims);
      const previousValueAndCount = this.state.previousValueAndCount;
      if (previousValueAndCount.value !== error) {
        previousValueAndCount.count = 0;
        previousValueAndCount.value = error;
      } else {
        previousValueAndCount.count += 1;
      }
      this.setState({
        gons: decorateGonsWithErrors(data, gons, accessor, dims),
        error,
        maxError,
        startTime,
        endTime,
        loaded: true,
        stepsTaken: this.state.stepsTaken + stepSize,
        errorLog: this.state.errorLog.concat([{x: this.state.stepsTaken, y: error, z: maxError}]),
        previousValueAndCount,
        annotationBoxes: computeAnnotationBoxBy && fusePolygons(gons, computeAnnotationBoxBy)
      });
      const converged = previousValueAndCount.value < CONVERGENCE_BARRIER;
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
    const {
      data,
      iterations,
      technique,
      accessor = d => d,
      layout,
      dims = {height: 1, width: 1},
      computeAnnotationBoxBy
    } = this.props;
    Promise.resolve()
      .then(() => {
        const startTime = (new Date()).getTime();
        const gons = tableCartogram({
          data,
          technique,
          layout,
          iterations,
          accessor,
          ...dims
        });
        const endTime = (new Date()).getTime();
        const {error, maxError} = computeErrors(data, gons, accessor, dims);
        this.setState({
          gons: decorateGonsWithErrors(data, gons, accessor, dims),
          error,
          startTime,
          endTime,
          maxError,
          runningMode: 'finished',
          loaded: true,
          stepsTaken: iterations,
          annotationBoxes: computeAnnotationBoxBy && fusePolygons(gons, computeAnnotationBoxBy)
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
        <select
          onChange={({target: {value}}) => this.setState({fillMode: value})}
          value={fillMode}>
          {Object.keys(COLOR_MODES).map(d => <option value={d} key={d}>{d}</option>)}
        </select>
        <button onClick={() => this.setState({showLabels: !this.state.showLabels})}>TOGGLE LABELS</button>
        <button onClick={() => this.setState({runningMode: 'stopped'})}>STOP</button>
      </div>
    );
  }

  render() {
    const {
      gons,
      loaded,
      fillMode,
      showLabels,
      annotationBoxes = []
    } = this.state;
    const {
      showAxisLabels = false,
      xLabels = [],
      yLabels = [],
      getLabel = false
    } = this.props;
    return (
      <div style={{display: 'flex', alignItems: 'center'}}>
        {loaded && <CartogramPlot
          data={gons}
          fillMode={fillMode}
          showLabels={showLabels}
          xLabels={xLabels}
          yLabels={yLabels}
          showAxisLabels={showAxisLabels}
          getLabel={getLabel}
          annotationBoxes={annotationBoxes}
          />}
        {loaded && this.displayReadout()}
      </div>
    );
  }
}
