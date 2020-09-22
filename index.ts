import {OptimizationParams, DataTable, Gon, LayoutType, Getter} from './types';
import {buildIterativeCartogram} from './src/optimization';
import {prepareRects, computeErrors, error, log} from './src/utils';

const defaultOptimzationParams: OptimizationParams = {
  lineSearchSteps: 30,
  useAnalytic: false,
  stepSize: 0.01,
  nonDeterministic: false,
  useGreedy: true,
  orderPenalty: 1,
  borderPenalty: 1,
  overlapPenalty: 4,
};

const inputTableIsInvalid = (table: DataTable): boolean => {
  const someValuesAreBad = !table.every((row) => row && row.every((cell) => cell));

  const width = table[0].length;
  const irregularShape = !table.every((row) => row.length === width);
  return someValuesAreBad || irregularShape;
};

const MAX_ITERATIONS = 3000;

interface Params {
  data: any[][];
  layout: LayoutType;
  iterations: number;
  accessor: Getter;
  height?: number;
  width?: number;
  optimizationParams?: OptimizationParams;
}
export function tableCartogram(params: Params): Gon[] {
  const {
    data,
    layout = 'pickBest',
    iterations = MAX_ITERATIONS,
    accessor = (d: any): number => d,
    height = 1,
    width = 1,
  } = params;
  const optimizationParams = {
    ...defaultOptimzationParams,
    ...params.optimizationParams,
  };
  const localTable = data.map((row) => row.map((cell) => accessor(cell)));
  if (inputTableIsInvalid(localTable)) {
    error('INVALID INPUT TABLE', data);
    return [];
  }
  const updateFunction = buildIterativeCartogram(localTable, layout, {height, width}, optimizationParams);
  return prepareRects(updateFunction(iterations), data, accessor);
}

interface WithUpdateParams {
  accessor: Getter;
  data: any[][];
  height?: number;
  layout: LayoutType;
  optimizationParams?: OptimizationParams;
  width?: number;
}
/**
 * Build table cartogram with triggerable update hook
 */
export function tableCartogramWithUpdate(params: WithUpdateParams): Gon[] | ((x: number) => Gon[]) {
  const {data, accessor = (d): number => d, layout = 'pickBest', height = 1, width = 1} = params;
  const optimizationParams = {
    ...defaultOptimzationParams,
    ...params.optimizationParams,
  };
  const localTable = data.map((row) => row.map((cell) => accessor(cell)));
  if (inputTableIsInvalid(data)) {
    error('INVALID INPUT TABLE', data);
    return [] as Gon[];
  }
  const updateFunction = buildIterativeCartogram(localTable, layout, {height, width}, optimizationParams);
  return (numIterations): Gon[] => prepareRects(updateFunction(numIterations), data, accessor);
}
interface AdapativeParams {
  accessor: Getter;
  data: any[][];
  height?: number;
  iterationStepSize?: number;
  layout?: LayoutType;
  logging?: boolean;
  maxNumberOfSteps?: number;
  optimizationParams?: OptimizationParams;
  targetAccuracy?: number;
  width?: number;
}
interface AdaptiveReturn {
  gons: Gon[];
  error: number;
  maxError: number;
  stepsTaken: number;
}
/**
 * Build a table cartogram with automatic adapation
 */
export function tableCartogramAdaptive(params: AdapativeParams): AdaptiveReturn {
  const {
    data,
    maxNumberOfSteps = 1000,
    targetAccuracy = 0.01,
    iterationStepSize = 10,
    layout = 'pickBest',
    accessor = (d): number => d,
    logging = false,
    height = 1,
    width = 1,
  } = params;
  const optimizationParams = {
    ...defaultOptimzationParams,
    ...params.optimizationParams,
  };
  if (inputTableIsInvalid(data)) {
    error('INVALID INPUT TABLE', data);
    return {
      gons: [],
      error: Infinity,
      maxError: Infinity,
      stepsTaken: 0,
    };
  }
  const localTable = data.map((row) => row.map((cell) => accessor(cell)));
  const updateFunction = buildIterativeCartogram(localTable, layout, {height, width}, optimizationParams);
  const boundUpdate = (iterations: number): Gon[] => prepareRects(updateFunction(iterations), data, accessor);

  let stillRunning = true;
  let currentLayout = null;
  let stepsTaken = 0;
  let currentScore = {error: null as number, maxError: null as number};
  if (logging) {
    log('Entering Loop');
  }
  while (stillRunning) {
    currentLayout = boundUpdate(iterationStepSize);
    currentScore = computeErrors(data, currentLayout, accessor, {height, width});
    stepsTaken += iterationStepSize;
    if (logging) {
      log(`Current avg err ${currentScore.error}, Steps taken ${stepsTaken}`);
    }

    if (stepsTaken > maxNumberOfSteps || currentScore.error < targetAccuracy) {
      stillRunning = false;
    }
  }
  if (logging) {
    log('Exiting loop');
  }
  return {
    gons: currentLayout,
    error: currentScore.error,
    maxError: currentScore.maxError,
    stepsTaken,
  };
}
