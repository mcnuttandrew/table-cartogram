import React from 'react';
import {Gon, ComputeMode, Getter, LayoutType, Dimensions, OptimizationParams, DataTable} from '../../types';
import {XYPlot, LineSeries, XAxis, YAxis, DiscreteColorLegend} from 'react-vis';

import {tableCartogram, tableCartogramWithUpdate, tableCartogramAdaptive} from '../..';

import {area, computeErrors, fusePolygons} from '../../src/utils';
import {COLOR_MODES} from '../colors';
import CartogramPlot from './table-cartogram';

const CONVERGENCE_THRESHOLD = 10;
const CONVERGENCE_BARRIER = 0.0001;

function decorateGonsWithErrors(data: DataTable, gons: Gon[], accessor: Getter, dims: Dimensions): any[] {
  const tableSum = data.reduce((acc, row) => acc + row.reduce((mem, cell) => mem + accessor(cell), 0), 0);
  const expectedAreas = data.map((row) => row.map((cell) => accessor(cell) / tableSum));
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

type RunningMode = 'running' | 'finished' | 'converged' | 'stopped' | 'errored';

interface Props {
  accessor: Getter;
  computeAnnotationBoxBy: boolean | Getter;
  computeMode: ComputeMode;
  data: any[][];
  defaultColor?: string;
  dims: Dimensions;
  getLabel?: (x: any) => string;
  getSubLabel?: (x: any) => string;
  hideControls?: number;
  iterations?: number;
  layout: LayoutType;
  optimizationParams: OptimizationParams;
  showAxisLabels?: boolean;
  showLabelsByDefault?: boolean;
  stepSize?: number;
  xLabels?: (string | number)[];
  yLabels?: (string | number)[];
}
interface State {
  annotationBoxes?: any[];
  endTime?: number;
  error?: any;
  errorLog: any[];
  fillMode: string;
  gons: Gon[];
  loaded: boolean;
  maxError: any;
  previousValueAndCount: {value?: any; count: number};
  runningMode: RunningMode;
  showLabels: boolean;
  startTime?: number;
  stepsTaken: number;
}

export default class IterativeDisplay extends React.Component<Props, State> {
  state = {
    loaded: false,
    // error: null,
    errorLog: [] as any[],
    gons: [] as Gon[],
    stepsTaken: 0,
    previousValueAndCount: {count: 0, value: null as any},
    maxError: NaN,
    fillMode: 'errorHeat',
    showLabels: false,
    runningMode: 'running' as RunningMode,
  };

  componentDidMount(): void {
    if (this.props.defaultColor || this.props.showLabelsByDefault) {
      this.setState({
        fillMode: this.props.defaultColor,
        showLabels: this.props.showLabelsByDefault,
      });
    }
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

  adaptiveBuild(): void {
    const {
      data,
      accessor = (d) => d,
      layout,
      dims = {height: 1, width: 1},
      optimizationParams,
      computeAnnotationBoxBy = false,
    } = this.props;
    const startTime = new Date().getTime();
    const {gons, error, stepsTaken, maxError} = tableCartogramAdaptive({
      accessor,
      data,
      layout,
      targetAccuracy: CONVERGENCE_BARRIER,
      logging: false,
      maxNumberOfSteps: Infinity,
      optimizationParams,
      ...dims,
    });
    const endTime = new Date().getTime();
    this.setState({
      gons: decorateGonsWithErrors(data, gons, accessor, dims),
      error,
      startTime,
      endTime,
      loaded: true,
      stepsTaken,
      runningMode: 'finished',
      maxError,
      annotationBoxes: computeAnnotationBoxBy && fusePolygons(gons, computeAnnotationBoxBy as Getter),
    });
  }

  iterativeBuild(): void {
    const {
      data,
      stepSize,
      accessor = (d) => d,
      layout,
      dims = {height: 1, width: 1},
      optimizationParams,
      computeAnnotationBoxBy = false,
    } = this.props;
    const cartogram = tableCartogramWithUpdate({
      accessor,
      data,
      layout,
      optimizationParams,
      ...dims,
    });
    const startTime = new Date().getTime();
    const ticker = setInterval(() => {
      const gons = (cartogram as (x: number) => Gon[])(this.state.stepsTaken ? stepSize : 0);
      const endTime = new Date().getTime();
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
        annotationBoxes: computeAnnotationBoxBy && fusePolygons(gons, computeAnnotationBoxBy as Getter),
      });
      const converged = previousValueAndCount.value < CONVERGENCE_BARRIER;
      const halted = previousValueAndCount.count > CONVERGENCE_THRESHOLD;
      const errored = isNaN(error);
      if (this.state.runningMode !== 'running' || halted || converged || errored) {
        clearInterval(ticker);
        this.setState({
          runningMode: converged
            ? 'converged'
            : halted
            ? 'stopped'
            : errored
            ? 'errored'
            : this.state.runningMode,
        });
      }
    }, 100);
  }

  directBuild(): void {
    const {
      data,
      iterations,
      accessor = (d) => d,
      layout,
      dims = {height: 1, width: 1},
      optimizationParams,
      computeAnnotationBoxBy,
    } = this.props;
    Promise.resolve().then(() => {
      const startTime = new Date().getTime();
      const gons = tableCartogram({
        accessor,
        data,
        iterations,
        layout,
        optimizationParams,
        ...dims,
      });
      const endTime = new Date().getTime();
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
        annotationBoxes: computeAnnotationBoxBy && fusePolygons(gons, computeAnnotationBoxBy as Getter),
      });
    });
  }

  displayReadout(): JSX.Element {
    const {computeMode, hideControls} = this.props;
    const {errorLog, error, maxError, endTime, startTime, stepsTaken, runningMode, fillMode} = this
      .state as State;
    return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <p>
          {`${runningMode.toUpperCase()}`} <br />
          {`COMPUTE MODE: ${computeMode.toUpperCase()}`} <br />
          {`Steps taken ${stepsTaken}`} <br />
          {`AVERAGE ERROR ${Math.floor(error * Math.pow(10, 7)) / Math.pow(10, 5)} %`} <br />
          {`MAX ERROR ${Math.floor(maxError * Math.pow(10, 7)) / Math.pow(10, 5)} %`} <br />
          {`COMPUTATION TIME ${(endTime - startTime) / 1000} seconds`} <br />
        </p>
        {errorLog.length > 0 && computeMode === 'iterative' && (
          <XYPlot yDomain={[0, errorLog[0].y]} width={300} height={300}>
            <LineSeries data={errorLog} />
            <LineSeries data={errorLog} getY={(d: any) => d.z} />
            <XAxis title="Steps" />
            <YAxis title="Error" tickFormat={(d: any) => `${d * 100}%`} />
          </XYPlot>
        )}
        {computeMode === 'iterative' && (
          <DiscreteColorLegend orientation="horizontal" width={300} items={['AVG', 'MAX']} />
        )}
        {!hideControls && (
          <div style={{display: 'flex'}}>
            <select onChange={({target: {value}}) => this.setState({fillMode: value})} value={fillMode}>
              {Object.keys(COLOR_MODES).map((d) => (
                <option value={d} key={d}>
                  {d}
                </option>
              ))}
            </select>
            <button onClick={() => this.setState({showLabels: !this.state.showLabels})}>TOGGLE LABELS</button>
            <button onClick={() => this.setState({runningMode: 'stopped'})}>STOP</button>
          </div>
        )}
      </div>
    );
  }

  render() {
    const {gons, loaded, fillMode, showLabels, annotationBoxes = []} = this.state as State;
    const {
      showAxisLabels = false,
      xLabels = [],
      yLabels = [],
      getLabel = false,
      getSubLabel = false,
    } = this.props;
    return (
      <div style={{display: 'flex', alignItems: 'center'}}>
        {loaded && (
          <CartogramPlot
            data={gons}
            fillMode={fillMode}
            showLabels={showLabels}
            xLabels={xLabels}
            yLabels={yLabels}
            showAxisLabels={showAxisLabels}
            getLabel={getLabel}
            getSubLabel={getSubLabel}
            annotationBoxes={annotationBoxes}
          />
        )}
        {loaded && this.displayReadout()}
      </div>
    );
  }
}
