import {gradientDescentLineSearch, norm2} from './imported-gradient';
import {objectiveFunction} from './objective-function';
import {generateInitialTable} from './layouts';
import {translateVectorToTable, translateTableToVector, getIndicesInVectorOfInterest} from './utils';

function diff(a, b) {
  const arr = new Array(a.length);
  for (let i = 0; i < a.length; i++) {
    arr[i] = a[i] - b[i];
  }
  return arr;
}

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
 * @return {Array of Numbers} The optimized vector
 */
// junk coordinateDescent notes
// function coordinateDescent(objFunc, candidateVector, numIterations, table) {
//   let currentVec = candidateVector.slice();
//   /* eslint-disable max-depth */
//   const stepSizeMax = 0.1;
//   const stepSizeMin = 0.00001;
//   let stepSize = 0.01;
//   let prevDelta = 0;
//   for (let i = 0; i < numIterations; i++) {
//     // let sumNorm = 0;
//     // let energy = 0;
//     // janky adaptive step
//     // const stepSize = Math.min(0.01, objFunc(currentVec));
//
//     const oldScore = objFunc(currentVec);
//     // const newVec = currentVec.slice();
//     for (let phase = 0; phase < 4; phase++) {
//       const currTable = translateVectorToTable(currentVec, table, 1, 1);
//       const searchIndices = getIndicesInVectorOfInterest(currTable, phase);
//       const dx = finiteDiferenceForIndices(objFunc, currentVec, stepSize / 10, searchIndices);
//       // const dx = finiteDiferenceForIndices(objFunc, currentVec, stepSize, searchIndices);
//       const norm = norm2(dx);
//       // sumNorm += norm ? norm : 0;
//
//       for (let jdx = 0; jdx < dx.length; jdx++) {
//         if (dx[jdx] && norm) {
//           currentVec[searchIndices[jdx]] += -dx[jdx] / norm * (stepSize / 10);
//         }
//       }
//       const baseScore = objFunc(currentVec);
//       for (let jdx = 0; jdx < dx.length; jdx++) {
//         if (dx[jdx] && norm) {
//           // undo
//           currentVec[searchIndices[jdx]] += dx[jdx] / norm * (stepSize / 10);
//           // upScore
//           currentVec[searchIndices[jdx]] += -dx[jdx] / norm * ((stepSize * 1.5) / 10);
//         }
//       }
//       const upScore = objFunc(currentVec);
//       for (let jdx = 0; jdx < dx.length; jdx++) {
//         if (dx[jdx] && norm) {
//           // undo
//           currentVec[searchIndices[jdx]] += dx[jdx] / norm * ((stepSize * 1.5) / 10);
//           // downScore
//           currentVec[searchIndices[jdx]] += -dx[jdx] / norm * ((stepSize * 0.5) / 10);
//         }
//       }
//       const downScore = objFunc(currentVec);
//       if (downScore < upScore && downScore < baseScore) {
//         stepSize *= 1 / 2;
//       }
//       if (upScore < downScore && upScore < baseScore) {
//         stepSize *= 2;
//       }
//        // const upSizeScore
//       // console.log(norm, stepSizeMax)
//       // stepSize = norm ? stepSizeMax / norm : stepSize;
//       // const deltaVec = diff(newVec, currentVec);
//
//
//       // for (let jdx = 0; jdx < dx.length; jdx++) {
//       //   if (dx[jdx] && norm) {
//       //     energy += deltaVec[searchIndices[jdx]] * dx[jdx];
//       //   }
//       // }
//       // currentVec = newVec;
//     }
//     // console.log(sumNorm)
//     const newScore = objFunc(currentVec);
//     // const newDelta = (oldScore - newScore);
//     // // console.log(newDelta - prevDelta)
//     // if (newDelta > 0 && prevDelta > 0) {
//     //   stepSize *= 1.9;
//     //   // stepSize -= stepSizeMin;
//     // } else if (newDelta < 0 && prevDelta < 0) {
//     //   stepSize *= 0.9;
//     //   // stepSize += 5 * stepSizeMin;
//     // }
//     // if ((newDelta - prevDelta) > 5 * stepSizeMin) {
//     //   stepSize *= 1.01;
//     // }
//     // if ((prevDelta - newDelta) > 5 * stepSizeMin) {
//     //   stepSize *= 0.99;
//     // }
//     // else {
//     //   stepSize -= stepSizeMin;
//     // }
//
//     stepSize = Math.max(Math.min(newScore, stepSizeMax), stepSizeMin);
//     // prevDelta = newDelta;
//
//     // console.log(stepSize)
//     // const newScore = objFunc(newVec);
//     // console.log(stepSize, newScore - oldScore, (newScore - oldScore) > (0.3 * energy))
//     // if ((newScore - oldScore) > (0.3 * energy)) {
//     //   // /* the backtrack and opportunistic increase parameters should
//     //   //    also optimized, somehow */
//     //   // backtrack
//     //   // stepSize *= 0.5;
//     //   // pos = posLast;
//     // } else {
//     //   // currentVec = newVec;
//     //   // opportunistically increase step size
//     //   // stepSize = Math.max(Math.min(1.05 * stepSize, stepSizeMax), stepSizeMin);
//     // }
//     // const delta = finiteDiference(objFunc, currentVec, stepSize / 100);
//     // stepSize *= stepSizeMax / (10 * sumNorm);
//     // stepSize = Math.max(Math.min(stepSize, stepSizeMax), stepSizeMin);
//     // console.log(sumNorm, stepSize)
//   }
//   /* eslint-enable max-depth */
//   return currentVec;
// }

function coordinateDescent(objFunc, candidateVector, numIterations, table) {
  const currentVec = candidateVector.slice();
  /* eslint-disable max-depth */
  for (let i = 0; i < numIterations; i++) {
    // janky adaptive step
    const stepSize = Math.min(0.001, objFunc(currentVec));
    for (let phase = 0; phase < 4; phase++) {
      const currTable = translateVectorToTable(currentVec, table, 1, 1);
      const searchIndices = getIndicesInVectorOfInterest(currTable, phase);
      const dx = finiteDiferenceForIndices(objFunc, currentVec, stepSize / 10, searchIndices);
      const norm = norm2(dx);
      for (let jdx = 0; jdx < dx.length; jdx++) {
        if (dx[jdx] && norm) {
          currentVec[searchIndices[jdx]] += -dx[jdx] / norm * stepSize;
        }
      }
    }
  }
  /* eslint-enable max-depth */
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
      // console.log(learnRate)
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

/**
 * Compute the gradient for an objective function
 * Uses a centered finite difference for computation
 *
 * @param  {Function} objFunc The function to take the gradient of
 * @param  {Array of Numbers} currentPos - position of gradient interest
 * @param  {Number} stepSize - The size of the gradient step
 * @return {Array of Numbers} - The gradient of objFunc at currentPos
 */
function finiteDiference(objFunc, currentPos, stepSize) {
  return currentPos.map((d, i) => {
    const forward = objFunc(currentPos.map((row, idx) => row + (idx === i ? stepSize : 0)));
    const backward = objFunc(currentPos.map((row, idx) => row - (idx === i ? stepSize : 0)));
    return (forward - backward) / (2 * stepSize);
  });
}

/**
 * Compute the gradient for an objective function for PART of a particular position
 * This is an essential function for coordinate descent
 *
 * @param  {Function} objFunc The function to take the gradient of
 * @param  {Array of Numbers} currentPos - position of gradient interest
 * @param  {Number} stepSize - The size of the gradient step
 * @return {Array of Numbers} - The gradient of objFunc at currentPos
 */
function finiteDiferenceForIndices(objFunc, currentPos, stepSize, indices) {
  return indices.map(i => {
    const forward = objFunc(currentPos.map((row, idx) => row + (idx === i ? stepSize : 0)));
    const backward = objFunc(currentPos.map((row, idx) => row - (idx === i ? stepSize : 0)));
    return (forward - backward) / (2 * stepSize);
  });
}

/**
 * Router for executing optimizations
 * All optimization are executing the exact number of iterations specified,
 * adaptive control is handled at a higher level
 * @param  {Function} objFunc - The function to optimize against
 * @param  {Array of Numbers} candidateVector - The initial position
 * @param  {String} technique - the type of optimization to perform
 * @param  {Array of Array of Numbers} table - the input data
 * @param  {Number} numIterations - The number of iterations to perform
 * @return {Array of Array of {x: Number, y: Number}} - The optimzed table of positions
 */
export function executeOptimization(objFunc, candidateVector, technique, table, numIterations) {
  if (!numIterations) {
    return translateVectorToTable(candidateVector, table, 1, 1);
  }
  switch (technique) {
  case 'gradient':
    const gradientResult = gradientDescent(objFunc, candidateVector, numIterations);
    return translateVectorToTable(gradientResult, table, 1, 1);
  default:
  case 'coordinate':
    const coordinateResult = coordinateDescent(objFunc, candidateVector, numIterations, table);
    return translateVectorToTable(coordinateResult, table, 1, 1);
  case 'monteCarlo':
    const monteFinalVec = monteCarloOptimization(objFunc, candidateVector, numIterations);
    return translateVectorToTable(monteFinalVec, table, 1, 1);
  }
}

const MAX_ITERATIONS = 10;
/**
 * [buildIterativeCartogram description]
 * @param  {Array of Array of Numbers} table - the input data
 * @param  {String} technique - the type of optimization to perform
 * @param  {String} [layout='pickBest'] - The initialization layout technique
 * @return {Function(Number)} - A function to execute optimization with
 */
export function buildIterativeCartogram(table, technique, layout = 'pickBest') {
  // TODO need to add a mechanism for scaling
  const width = table[0].length;
  const height = table.length;

  const objFunc = vec => objectiveFunction(vec, table, technique);
  const newTable = generateInitialTable(height, width, table, objFunc, layout);
  let candidateVector = translateTableToVector(newTable);

  return (numIterations = MAX_ITERATIONS) => {
    const resultTable = executeOptimization(objFunc, candidateVector, technique, table, numIterations);
    candidateVector = translateTableToVector(resultTable);
    return resultTable;
  };
}
