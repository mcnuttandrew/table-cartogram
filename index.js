import {
  buildIterativeCartogram,
  buildIterativeCartogramWithUpdate
} from './iterative-methods/optimization';

import {computeErrors} from './test-app/test-app-utils';

const inputTableIsInvalid = table => !table.every(row => row.every(cell => cell));

function prepareRects(outputTable, table) {
  const rects = [];
  for (let i = 0; i < outputTable.length - 1; i++) {
    for (let j = 0; j < outputTable[0].length - 1; j++) {
      const newRect = [
        outputTable[i][j],
        outputTable[i + 1][j],
        outputTable[i + 1][j + 1],
        outputTable[i][j + 1]
      ];
      const value = table[i][j];

      rects.push({vertices: newRect, value});
    }
  }
  return rects;
}

const MAX_ITERATIONS = 3000;

/**
 * Basic table cartogram function
 * @param  {Array of Arrays of Numbers} table the matrix to execute a table cartogram against
 * @param  {Number} numIterations the maximum number of iterations to run
 * @param  {String} technique which computation technique to use
 * @return {Array of Array of polygons} the polygons consituting the final layout
 */
export function tableCartogram(table, numIterations = MAX_ITERATIONS, technique) {
  if (inputTableIsInvalid(table)) {
    console.error('INVALID INPUT TABLE')
    return [];
  }
  return prepareRects(buildIterativeCartogram(table, numIterations, technique), table);
}

/**
 * Build table cartogram with triggerable update hook
 * @param  {Array of Arrays of Numbers} table the matrix to execute a table cartogram against
 * @param  {String} technique which computation technique to use
 * @return {Function}         call back to trigger additional computation, returns array of polygons
 */
export function tableCartogramWithUpdate(table, technique, layout = 'pickBest') {
  if (inputTableIsInvalid(table)) {
    console.error('INVALID INPUT TABLE')
    return [];
  }
  const updateFunction = buildIterativeCartogramWithUpdate(table, layout);
  return (numIterations, optionalSecondTechnique = technique) =>
    prepareRects(updateFunction(numIterations, optionalSecondTechnique), table);
}

/**
 * Build a table cartogram with automatic adapation
 * @param  {Object} params [description]
 * @return {Object}        [description]
 */
export function tableCartogramAdaptive(params) {
  const {
    data,
    technique = 'coordinate',
    maxNumberOfSteps = 1000,
    targetAccuracy = 0.01,
    iterationStepSize = 10,
    layout = 'pickBest'
  } = params;
  if (inputTableIsInvalid(data)) {
    console.error('INVALID INPUT TABLE')
    return {
      gons: [],
      error: Infinity,
      stepsTaken: 0
    };
  }

  const updateFunction = buildIterativeCartogramWithUpdate(data, layout);
  const boundUpdate = numIterations =>
    prepareRects(updateFunction(numIterations, technique), data);

  let stillRunning = true;
  let currentLayout = null;
  let stepsTaken = 0;
  let currentScore = Infinity;
  while (stillRunning) {
    currentLayout = boundUpdate(iterationStepSize);
    currentScore = computeErrors(data, currentLayout);
    stepsTaken += iterationStepSize;
    if ((stepsTaken > maxNumberOfSteps) || currentScore.error < targetAccuracy) {
      stillRunning = false;
    }
  }
  return {
    gons: currentLayout,
    error: currentScore,
    stepsTaken
  };
}
