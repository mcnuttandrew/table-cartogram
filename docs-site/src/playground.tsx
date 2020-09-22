import React, {useState, useEffect} from 'react';
import Switch from 'react-switch';
import Tooltip from 'rc-tooltip';
import CartogramPlot from './cartogram-plot';
import {tableCartogramWithUpdate} from '../..';
import {area, computeErrors} from '../../src/utils';
import {Gon, Getter, LayoutType, Dimensions, OptimizationParams, DataTable} from '../../types';
import {layouts} from '../../src/layouts';
import {XYPlot, LineSeries, XAxis, YAxis, DiscreteColorLegend} from 'react-vis';
import EXAMPLES from './examples';

type RunningMode = 'running' | 'finished' | 'converged' | 'stopped' | 'errored';
import {COLOR_MODES} from '../../showcase/colors';

const CONVERGENCE_THRESHOLD = 10;
const CONVERGENCE_BARRIER = 0.0001;

function decorateGonsWithErrors(data: DataTable, gons: Gon[], accessor: Getter, dims: Dimensions): any[] {
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
interface DropDownProps {
  label: string;
  onChange: (x: string) => any;
  keys: string[];
  current?: any;
}
function DropDownWithLabel(props: DropDownProps): JSX.Element {
  const {label, onChange, keys, current} = props;
  return (
    <div className="flex-down">
      <span>{label}</span>
      <select onChange={({target: {value}}): any => onChange(value)} value={current}>
        {keys.map(d => (
          <option value={d} key={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
}

interface DisplayReadoutProps {
  errorLog: any[];
  error?: any;
  maxError: any;
  endTime?: number;
  startTime?: number;
  stepsTaken: number;
}

function DisplayReadout(props: DisplayReadoutProps): JSX.Element {
  const {errorLog, error, maxError, endTime, startTime, stepsTaken} = props;
  return (
    <div className="flex-down">
      <h5>COMPUTATION STATUS</h5>
      <div>
        {`Steps taken ${stepsTaken}`} <br />
        {`Avg Error ${Math.floor(error * Math.pow(10, 7)) / Math.pow(10, 5)} %`} <br />
        {`Max Error ${Math.floor(maxError * Math.pow(10, 7)) / Math.pow(10, 5)} %`} <br />
        {`Computation Time ${(endTime - startTime) / 1000} seconds`} <br />
      </div>

      {errorLog.length > 0 && (
        <XYPlot yDomain={[0, errorLog[0].y]} width={300} height={300}>
          <LineSeries data={errorLog} />
          <LineSeries data={errorLog} getY={(d: any) => d.z} />
          <XAxis title="Steps" />
          <YAxis title="Error" tickFormat={(d: any) => `${d * 100}%`} />
        </XYPlot>
      )}
      <DiscreteColorLegend orientation="horizontal" width={300} items={['AVG', 'MAX']} />
    </div>
  );
}

export default function Playground(): JSX.Element {
  const accessor = (x: number): number => x;
  const dims = {height: 1, width: 1};
  const [gons, setGons] = useState([]);
  const stepSize = 10;
  const [optimizationParams, setOptimizationParams] = useState({
    lineSearchSteps: 30,
    useAnalytic: false,
    stepSize: Math.min(0.01),
    nonDeterministic: false,
    useGreedy: true,
    orderPenalty: 1,
    borderPenalty: 1,
    overlapPenalty: 4,
  } as OptimizationParams);
  const [layout, setLayout] = useState('pickBest' as LayoutType);
  const [data, setData] = useState([
    [1, 10, 1],
    [1, 1, 1],
    [1, 10, 1],
  ]);
  const [fillMode, setFillMode] = useState('errorHeat');
  const [runningMode, setRunningMode] = useState('running' as RunningMode);
  const [{startTime, endTime, error, maxError, stepsTaken, errorLog}, setScalars] = useState({
    startTime: new Date().getTime(),
    endTime: new Date().getTime(),
    error: 0,
    maxError: 0,
    stepsTaken: 0,
    errorLog: [],
    errorStep: null,
  });
  const triggerReRun = (...args: any): any => setRunningMode(`running-${Math.random()}` as RunningMode);
  useEffect(() => {
    if (!runningMode.includes('running')) {
      return;
    }
    const cartogram = tableCartogramWithUpdate({
      accessor,
      data,
      layout,
      optimizationParams,
      ...dims,
    });
    const localErrorLog = [] as any[];
    let steps = 0;
    const previousValueAndCount = {value: Infinity, count: 0};
    const ticker = setInterval(() => {
      const gons = (cartogram as (x: number) => Gon[])(stepSize);
      const errorCompute = computeErrors(data, gons, accessor, dims);
      if (previousValueAndCount.value !== errorCompute.error) {
        previousValueAndCount.count = 0;
        previousValueAndCount.value = errorCompute.error;
      } else {
        previousValueAndCount.count += 1;
      }
      localErrorLog.push({x: steps, y: errorCompute.error, z: errorCompute.maxError});
      steps += stepSize;
      setGons(decorateGonsWithErrors(data, gons, accessor, dims));

      const converged = previousValueAndCount.value < CONVERGENCE_BARRIER;
      const halted = previousValueAndCount.count > CONVERGENCE_THRESHOLD;
      const inError = isNaN(errorCompute.error);
      if (halted || converged || inError) {
        clearInterval(ticker);
        setRunningMode(converged ? 'converged' : halted ? 'stopped' : inError ? 'errored' : runningMode);
      }
      setScalars({
        startTime,
        endTime: new Date().getTime(),
        error: errorCompute.error,
        maxError: errorCompute.maxError,
        stepsTaken: steps,
        errorLog: localErrorLog,
        errorStep: null,
      });
    }, 100);
    return (): any => clearInterval(ticker);
  }, [runningMode, JSON.stringify(data), JSON.stringify(optimizationParams)]);

  return (
    <div className="flex" id="playground">
      <div className="flex">
        <div className="flex-down">
          <h5>DATA SET SELECTION</h5>
          <DropDownWithLabel
            label={'Predefined Datasets'}
            keys={Object.keys(EXAMPLES)}
            onChange={(value): any => triggerReRun(setData(EXAMPLES[value]))}
          />
          <div>CUSTOM SELECT TODO</div>

          <h5>PARAM SELECTION</h5>
          <div className="flex-down">
            <DropDownWithLabel
              label={'Color Scheme'}
              keys={Object.keys(COLOR_MODES)}
              onChange={setFillMode}
            />
            <DropDownWithLabel
              label={'Initial Layout'}
              keys={['pickBest', 'pickWorst', ...Object.keys(layouts)]}
              onChange={val => triggerReRun(setLayout(val as any))}
              current={layout}
            />
            {[
              {
                paramName: 'lineSearchSteps',
                type: 'number',
                description: 'The number of steps to take while computing the gradient line search.',
              },
              {
                paramName: 'useAnalytic',
                type: 'switch',
                description: 'Whether to use the analytic gradient or an automatically computed one.',
              },
              {
                paramName: 'stepSize',
                type: 'number',
                description: 'How big a step to use in computing the gradient.',
              },
              {
                paramName: 'nonDeterministic',
                type: 'switch',
                description: 'Whether to use stochastic gradient descent or just regular gradient descent.',
              },
              {
                paramName: 'useGreedy',
                type: 'switch',
                description:
                  'Whether to use a greedy strategy (bigger shapes should be corrected first) for computing the object or a normalized one (all shapes should be corrected at the same rate).',
              },
              {
                paramName: 'orderPenalty',
                type: 'number',
                description: ' How much penalty to assign to nodes that have gone out of order.',
              },
              {
                paramName: 'borderPenalty',
                type: 'number',
                description: 'How much penalty to assign to nodes that have gone out of the border.',
              },
              {
                paramName: 'overlapPenalty',
                type: 'number',
                description: 'How much penalty to assign to overlap between quads.',
              },
            ].map(({paramName, type, description}) => {
              return (
                <div key={paramName} className="flex space-between">
                  <div>
                    <span>{paramName}</span>
                    <Tooltip
                      key={type}
                      placement="bottom"
                      trigger="click"
                      overlay={<span className="tooltip-internal">{<span>{description}</span>}</span>}
                    >
                      <span className="cursor-pointer">(?)</span>
                    </Tooltip>
                  </div>
                  {type === 'switch' && (
                    <Switch
                      {...{
                        offColor: '#800000',
                        onColor: '#36425C',
                        height: 15,
                        checkedIcon: false,
                        width: 50,
                      }}
                      checked={(optimizationParams as any)[paramName]}
                      onChange={() =>
                        setOptimizationParams({
                          ...optimizationParams,
                          [paramName]: !(optimizationParams as any)[paramName],
                        })
                      }
                    />
                  )}
                  {type === 'number' && (
                    <input
                      key={paramName}
                      type="number"
                      value={(optimizationParams as any)[paramName]}
                      onChange={(event: any): any =>
                        setOptimizationParams({
                          ...optimizationParams,
                          [paramName]: event.target.value,
                        })
                      }
                    />
                  )}
                </div>
              );
            })}

            <button onClick={(): any => setRunningMode('stopped')}>STOP</button>
            <button onClick={(): any => triggerReRun()}>RESET</button>
          </div>
          <DisplayReadout
            errorLog={errorLog}
            error={error}
            maxError={maxError}
            endTime={endTime}
            startTime={startTime}
            stepsTaken={stepsTaken}
          />
        </div>
        <div className="plot-container flex-down">
          <CartogramPlot
            data={gons}
            fillMode={fillMode}
            getLabel={(x): any => x.data}
            height={800}
            width={800}
          />
          <button
            onClick={() => {
              // console.log('hi');
              const svg = document.querySelector('.plot-container svg').innerHTML;
              const blob = new Blob([svg.toString()]);
              const element = document.createElement('a');
              element.download = `table-cartogram-${new Date()}.svg`;
              element.href = window.URL.createObjectURL(blob);
              element.click();
              element.remove();
            }}
            className="download-button"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
