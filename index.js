import {buildIterativeCartogram} from './iterative-methods/optimization';
import {prepareRects, computeErrors} from './iterative-methods/utils';

const inputTableIsInvalid = table => {
  const someValuesAreBad = !table.every(row => row && row.every(cell => cell));

  const width = table[0].length;
  const irregularShape = !table.every(row => row.length === width);
  return someValuesAreBad || irregularShape;
};

const MAX_ITERATIONS = 3000;

/**
 * Basic table cartogram function
 * @param  {Array of Arrays of Numbers} table the matrix to execute a table cartogram against
 * @param  {Number} numIterations the maximum number of iterations to run
 * @param  {String} technique which computation technique to use
 * @return {Array of Array of polygons} the polygons consituting the final layout
 */
export function tableCartogram(params) {
  const {
    data,
    technique,
    layout = 'pickBest',
    iterations = MAX_ITERATIONS,
    accessor = d => d
  } = params;
  const localTable = data.map(row => row.map(cell => accessor(cell)));
  if (inputTableIsInvalid(localTable)) {
    console.error('INVALID INPUT TABLE', data)
    return [];
  }
  const updateFunction = buildIterativeCartogram(localTable, technique, layout);
  return prepareRects(updateFunction(iterations), data, accessor);
}

/**
 * Build table cartogram with triggerable update hook
 * @param  {Array of Arrays of Numbers} table the matrix to execute a table cartogram against
 * @param  {String} technique which computation technique to use
 * @return {Function}         call back to trigger additional computation, returns array of polygons
 */
export function tableCartogramWithUpdate(params) {
  const {
    data,
    technique,
    accessor = d => d,
    layout = 'pickBest'
  } = params;
  const localTable = data.map(row => row.map(cell => accessor(cell)));
  if (inputTableIsInvalid(data)) {
    console.error('INVALID INPUT TABLE', data)
    return [];
  }
  const updateFunction = buildIterativeCartogram(localTable, technique, layout);
  return numIterations => prepareRects(updateFunction(numIterations), data, accessor);
}

/**
 * Build a table cartogram with automatic adapation
 * @param  {Object} params [description]
 * @return {Object}        [description]
 */
export function tableCartogramAdaptive(params) {
  const {
    data,
    technique = 'newtonStep',
    maxNumberOfSteps = 1000,
    targetAccuracy = 0.01,
    iterationStepSize = 10,
    layout = 'pickBest',
    accessor = d => d,
    logging = false
  } = params;
  if (inputTableIsInvalid(data)) {
    console.error('INVALID INPUT TABLE', data)
    return {
      gons: [],
      error: Infinity,
      maxError: Infinity,
      stepsTaken: 0
    };
  }
  const localTable = data.map(row => row.map(cell => accessor(cell)));
  const updateFunction = buildIterativeCartogram(localTable, technique, layout);
  const boundUpdate = numIterations => prepareRects(updateFunction(numIterations), data, accessor);

  let stillRunning = true;
  let currentLayout = null;
  let stepsTaken = 0;
  let currentScore = Infinity;
  if (logging) {
    console.log('Entering Loop')
  }
  while (stillRunning) {
    currentLayout = boundUpdate(iterationStepSize);
    currentScore = computeErrors(data, currentLayout, accessor);
    stepsTaken += iterationStepSize;
    if (logging) {
      console.log(`Current avg err ${currentScore.error}, Steps taken ${stepsTaken}`)
    }

    if ((stepsTaken > maxNumberOfSteps) || currentScore.error < targetAccuracy) {
      stillRunning = false;
    }
  }
  if (logging) {
    console.log('Exiting loop')
  }
  return {
    gons: currentLayout,
    error: currentScore.error,
    maxError: currentScore.maxError,
    stepsTaken
  };
}
