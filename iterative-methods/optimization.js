import {inv, multiply, add, norm} from 'mathjs';
import {gradientDescentLineSearch, norm2, dot} from './imported-gradient';
import {objectiveFunction} from './objective-function';
import {generateInitialTable} from './layouts';
import {
  translateVectorToTable,
  translateTableToVector,
  getIndicesInVectorOfInterest,
  phaseShuffle
} from './utils';
import {
  finiteDiference,
  finiteDiferenceForIndices,
  diff,
  computeHessian,
  computeHessianForIndices,
  invDiagon
} from './math.js';

/**
 * Execute a monte carlo step
 * @param  {Array of Numbers} vector - vector to modify
 * @param  {Number} [stepSize=Math.pow(10, -2] - The size of the monte carlo perturbation
 * @return {Array of Numbers} Vector stepped in a monte carlo direction
 */
function monteCarloPerturb(vector, stepSize = Math.pow(10, -2)) {
  return vector.map(cell => cell + (Math.random() - 0.5) * stepSize);
}

/**
 * Execute Monte Carlo optimization for target objective function
 * General technique for any vector and objective function
 *
 * @param  {Function} objFunc - The objective function for executing the optimization
 * @param  {Array of Numbers} candidateVector - The vector to optimize against the objective function
 * @param  {Number} numIterations - The number of iterations in the optimization process
 * @return {Array of Numbers} The optimized vector
 */
function monteCarloOptimization(objFunc, candidateVector, numIterations) {
  let iteratVector = candidateVector.slice(0);
  let oldScore = objFunc(candidateVector);
  for (let i = 0; i < numIterations; i++) {
    // const stepSize = Math.pow(10, -(i / numIterations * 4 + 2));
    const stepSize = Math.pow(10, -2);
    const newVector = monteCarloPerturb(iteratVector, stepSize);
    const newScore = objFunc(newVector);
    if (newScore < oldScore) {
      iteratVector = newVector;
      oldScore = newScore;
    }
  }
  return iteratVector;
}

/**
 * Execute Coordinate Descent optimization for target objective function
 * This method is specifically tuned for the table cartogram problem,
 * It breaks the computation into four phase at each iteration,
 * one for each corner of a representative maximizing set.
 * Uses a centered finite difference for computation.
 *
 * @param  {Function} objFunc - The objective function for executing the optimization
 * @param  {Array of Numbers} candidateVector - The vector to optimize against the objective function
 * @param  {Number} numIterations - The number of iterations in the optimization process
 * TODO UPDATE
 * @return {Array of Numbers} The optimized vector
 */
function coordinateDescent(objFunc, candidateVector, numIterations, table, dims) {
  const currentVec = candidateVector.slice();
  /* eslint-disable max-depth */
  for (let i = 0; i < numIterations; i++) {
    const phases = phaseShuffle();
    // janky adaptive step
    const stepSize = Math.min(0.001, objFunc(currentVec));
    for (let phase = 0; phase < 4; phase++) {
      const currTable = translateVectorToTable(currentVec, table, dims.height, dims.width);
      const searchIndices = getIndicesInVectorOfInterest(currTable, phases[phase]);
      const dx = finiteDiferenceForIndices(objFunc, currentVec, stepSize / 10, searchIndices);
      const computednorm = norm2(dx);
      for (let jdx = 0; jdx < dx.length; jdx++) {
        if (dx[jdx] && norm) {
          currentVec[searchIndices[jdx]] += -dx[jdx] / computednorm * stepSize;
        }
      }
    }
  }
  /* eslint-enable max-depth */
  console.log(objFunc(currentVec))
  return currentVec;
}


function coordinateDescentInnerLoop(objFunc, currentVec, stepSize, table, dims) {
  // const stepSize = Math.min(0.001, objFunc(currentVec));
  const phases = phaseShuffle();
  for (let phase = 0; phase < 4; phase++) {
    const currTable = translateVectorToTable(currentVec, table, dims.height, dims.width);
    const searchIndices = getIndicesInVectorOfInterest(currTable, phases[phase]);
    const dx = finiteDiferenceForIndices(objFunc, currentVec, stepSize / 10, searchIndices);
    const localNorm = norm2(dx);
    for (let jdx = 0; jdx < dx.length; jdx++) {
      if (dx[jdx] && localNorm) {
        currentVec[searchIndices[jdx]] += -dx[jdx] / localNorm * stepSize;
      }
    }
  }
}

// not very good, often fails
function coordinateDescentWithAdaptiveStep(objFunc, candidateVector, numIterations, table, dims) {
  const currentVec = candidateVector.slice();
  /* eslint-disable max-depth */
  let prevStep = null;
  for (let i = 0; i < numIterations; i++) {
    // janky adaptive step
    const phi0 = objFunc(currentVec);
    const stepSize = Math.min(1, phi0);
    const phiPrime0 = norm2(finiteDiference(objFunc, currentVec, (prevStep || stepSize) / 10));
    const tempVec = currentVec.slice();
    coordinateDescentInnerLoop(objFunc, tempVec, stepSize, table, dims);
    const phi1 = objFunc(tempVec);
    const stepSize1 = -(stepSize * stepSize) / (2 * (phi1 - phi0 - stepSize * phiPrime0)) * 10;
    coordinateDescentInnerLoop(objFunc, currentVec, Math.abs(stepSize1), table, dims);
    prevStep = stepSize1;
  }
  /* eslint-enable max-depth */
  return currentVec;
}

function newtonStep(objFunc, candidateVector, numIterations, table, dims) {
  const currentVec = candidateVector.slice();

  for (let i = 0; i < numIterations; i++) {
    const stepSize = Math.min(0.001, objFunc(currentVec) * 10);
    newtonInnerLoop(objFunc, currentVec, stepSize, table, dims);
  }
  return currentVec;
}

function trace(mat) {
  let ret = 0;
  for (let i = 0; i < mat.length; i++) {
    ret += Math.abs(mat[i][i]);
  }
  return ret;
}

function newtonInnerLoop(objFunc, currentVec, stepSize, table, dims) {
  const phases = phaseShuffle();
  for (let phase = 0; phase < 4; phase++) {
    const objVal = objFunc(currentVec);
    const currTable = translateVectorToTable(currentVec, table, dims.height, dims.width);
    const searchIndices = getIndicesInVectorOfInterest(currTable, phases[phase]);
    if (!searchIndices.length) {
      continue;
    }
    const gradient = finiteDiferenceForIndices(objFunc, currentVec, stepSize, searchIndices);
    const hessian = computeHessianForIndices(objFunc, currentVec, stepSize, searchIndices);
    const invHessian = invDiagon(hessian);
    const scaleInvHessian = multiply(invHessian, objVal);
    let step = multiply(scaleInvHessian, gradient);
    const stepNorm = norm(step);
    // const tr = trace(invHessian);
    // console.log(tr / norm(gradient))
    // const derivStep = tr / norm(gradient);
    step = multiply(step, 1 / stepNorm * Math.min(stepNorm, stepSize * 1.5));
    // step = multiply(step, 1 / stepNorm * derivStep);
    for (let jdx = 0; jdx < step.length; jdx++) {
      currentVec[searchIndices[jdx]] -= step[jdx] ? step[jdx] : 0;
    }
  }
}

function newtonStepBoth(objFunc, candidateVector, numIterations, table, dims) {
  let currentVec = candidateVector.slice();
  for (let i = 0; i < numIterations; i++) {
    const coordStepSize = Math.min(0.01, objFunc(currentVec));
    const coordDescentVec = currentVec.slice();
    coordinateDescentInnerLoop(objFunc, coordDescentVec, coordStepSize, table, dims);
    const coordScore = objFunc(coordDescentVec);

    // const newtonStepSize = Math.max(Math.min(0.05, objFunc(currentVec)), 0.01);
    const newtonStepSize = 0.01;
    const newtonVec = currentVec.slice();
    newtonInnerLoop(objFunc, newtonVec, newtonStepSize, table, dims);
    const newtonScore = objFunc(newtonVec);
    console.log(newtonScore < coordScore ? 'newton' : 'coord')
    currentVec = (newtonScore < coordScore) ? newtonVec : coordDescentVec;
  }
  return currentVec;
}

/**
 * Execute gradient optimization for target objective function
 * General technique for any vector and objective function,
 * uses centered finite difference for gradient
 *
 * @param  {Function} objFunc - The objective function for executing the optimization
 * @param  {Array of Numbers} candidateVector - The vector to optimize against the objective function
 * @param  {Number} numIterations - The number of iterations in the optimization process
 * @return {Array of Numbers} The optimized vector
 */
function gradientDescent(objFunc, candidateVector, numIterations) {
  let result = candidateVector.slice();
  for (let i = 0; i < numIterations; i++) {
    const gradientResult = gradientDescentLineSearch((currentVec, fxprime, learnRate) => {
      fxprime = fxprime || candidateVector.map(d => 0);
      // Magic number for finite difference size
      const delta = finiteDiference(objFunc, currentVec, 100 * learnRate || 0.01);
      for (let idx = 0; idx < delta.length; idx++) {
        fxprime[idx] = delta[idx];
      }
      return objFunc(currentVec);
    }, result, {maxIterations: 2});
    result = gradientResult.x.slice();
  }
  return result;
}
// //
// // 0 - 1
// // |   |
// // 3 - 2
// //
// function generateSizeFromBounds(coords, table) {
//   const xOffset = coords[0].x;
//   const yOffset = coords[0].y;
//   const movesLeft = coords[1].x - coords[0].x;
//   const movesUp = coords[3].y - coords[0].y;
//   let ret = 0;
//   for (let i = 0; i < movesUp; i++) {
//     for (let j = 0; j < movesLeft; j++) {
//       ret += table[i + yOffset][j + xOffset];
//     }
//   }
//   return ret;
// }
//
// function divideTable(table) {
//   const height = table.length;
//   const width = table[0].length;
//   const lowerLeftCorner = {x: 0, y: 0};
//   const bottom = {x: Math.floor(width / 2), y: 0};
//   const lowerRightCorner = {x: 0, y: 0};
//   const left = {x: 0, y: Math.floor(height / 2)};
//   const center = {x: Math.floor(width / 2), y: Math.floor(height / 2)};
//   const right = {x: width, y: Math.floor(height / 2)};
//   const upperLeftCorner = {x: 0, y: height};
//   const top = {x: Math.floor(width / 2), y: height};
//   const upperRightCorner = {x: 0, y: height};
//
//
//   const lowerLeftBox = [lowerLeftCorner, bottom, center, left];
//   const lowerRightBox = [bottom, lowerRightCorner, right, center];
//   const upperLeftBox = [left, center, top, upperLeftCorner];
//   const upperRightBox = [center, right, upperRightCorner, center];
//
// }
//
// function multiScale(objFunc, candidateVector, numIterations, table) {
//
// }

/**
 * Router for executing optimizations
 * All optimization are executing the exact number of iterations specified,
 * adaptive control is handled at a higher level
 * @param  {Function} objFunc - The function to optimize against
 * @param  {Array of Numbers} candidateVector - The initial position
 * @param  {String} technique - the type of optimization to perform
 * @param  {Array of Array of Numbers} table - the input data
 * @param  {Number} numIterations - The number of iterations to perform
 * @param  {Object: {height: Number, width: Number}} dims
 *  - The dimensions of the table cartogram being assembled
 * @return {Array of Array of {x: Number, y: Number}} - The optimzed table of positions
 */
export function executeOptimization(objFunc, candidateVector, technique, table, numIterations, dims) {
  if (!numIterations) {
    return translateVectorToTable(candidateVector, table, dims.height, dims.width);
  }

  switch (technique) {
  case 'newtonStep':
    const newtonStepResult = newtonStepBoth(objFunc, candidateVector, numIterations, table, dims);
    return translateVectorToTable(newtonStepResult, table, dims.height, dims.width);
  case 'gradient':
    const gradientResult = gradientDescent(objFunc, candidateVector, numIterations);
    return translateVectorToTable(gradientResult, table, dims.height, dims.width);
  default:
  case 'coordinate':
    const coordinateResult = coordinateDescent(objFunc, candidateVector, numIterations, table, dims);
    return translateVectorToTable(coordinateResult, table, dims.height, dims.width);
  case 'monteCarlo':
    const monteFinalVec = monteCarloOptimization(objFunc, candidateVector, numIterations);
    return translateVectorToTable(monteFinalVec, table, dims.height, dims.width);
  }
}

const MAX_ITERATIONS = 10;
/**
 * [buildIterativeCartogram description]
 * @param  {Array of Array of Numbers} table - the input data
 * @param  {String} technique - the type of optimization to perform
 * @param  {String} [layout='pickBest'] - The initialization layout technique
 * @param  {Object: {height: Number, width: Number}} dims
 *  - The dimensions of the table cartogram being assembled
 * @return {Function(Number)} - A function to execute optimization with
 */
export function buildIterativeCartogram(table, technique, layout = 'pickBest', dims) {
  const nowCols = table[0].length;
  const numRows = table.length;

  const objFunc = vec => objectiveFunction(vec, table, technique, dims);
  const newTable = typeof layout === 'string' ?
    generateInitialTable(numRows, nowCols, table, objFunc, layout, dims) :
    layout;
  let candidateVector = translateTableToVector(newTable);

  return (numIterations = MAX_ITERATIONS) => {
    if (!numIterations) {
      return translateVectorToTable(candidateVector, table, dims.height, dims.width);
    }
    const resultTable = executeOptimization(objFunc, candidateVector, technique, table, numIterations, dims);
    candidateVector = translateTableToVector(resultTable);
    return resultTable;
  };
}
