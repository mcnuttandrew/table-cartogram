import {norm} from 'mathjs';
import {norm2} from '../math';
import {
  translateVectorToTable,
  translateTableToVector,
  getIndicesInVectorOfInterest,
  phaseShuffle
} from '../utils';
import {
  finiteDiferenceForIndices,
  finiteDiference
} from '../math.js';
import {
  buildErrorGradient
} from '../objective-function';

/**
 * Execute a search for the best stepSize for a given position and objective Function
 * @param  {Func} objFunc - the function to be minimized
 * @param  {Float} stepSize - the initial trial step size
 * @param  {Array of Floats} currentVec - the current position
 * @param  {Float} localNorm - norm of the gradient at that position
 * @param  {Array of Floats} dx - the gradient at that position
 * @param  {Array of Indices} searchIndices - the portion of the total indices being search over
 * @param  {Int} lineSearchSteps - maximum number of sizes to check
 * @return {Float} The optimal step size
 */
function lineSearch({objFunc, stepSize, currentVec, localNorm, dx, searchIndices, lineSearchSteps}) {
  if (!lineSearchSteps) {
    return stepSize;
  }
  let trialStepSize = stepSize;
  let bestStepSize = stepSize;
  let bestScore = objFunc(currentVec);
  // TODO should this be done using bisection, ala NOCEDAL?
  for (let i = 0; i < lineSearchSteps; i++) {
    const tempVec = currentVec.slice();
    for (let jdx = 0; jdx < dx.length; jdx++) {
      if (dx[jdx] && localNorm) {
        tempVec[searchIndices[jdx]] += -dx[jdx] / localNorm * trialStepSize;
      }
    }
    const newScore = objFunc(tempVec);
    if (newScore < bestScore) {
      bestScore = newScore;
      bestStepSize = trialStepSize;
    }
    trialStepSize *= 0.4;
  }
  return bestStepSize;
}

export function coordinateDescentInnerLoop(objFunc, currentVec, stepSize, table, dims, lineSearchSteps) {
  // const stepSize = Math.min(0.001, objFunc(currentVec));
  const phases = phaseShuffle();
  for (let phase = 0; phase < 4; phase++) {
    const currTable = translateVectorToTable(currentVec, table, dims.height, dims.width);
    const searchIndices = getIndicesInVectorOfInterest(currTable, phases[phase]);
    // const xdx = finiteDiferenceForIndices(objFunc, currentVec, stepSize / 10, searchIndices, true);
    // const newPen = buildErrorGradient(currentVec, table, dims, searchIndices, true);
    // if (xdx.some((v, idx) => newPen[idx] !== v)) {
    //   console.log(searchIndices)
    //   console.log('old', xdx)
    //   console.log('new', newPen)
    //   console.log(currentVec)
    // }
    // const dx = buildErrorGradient(currentVec, table, dims, searchIndices);
    const dx = finiteDiferenceForIndices(objFunc, currentVec, stepSize / 10, searchIndices);
    // const dx =
    const localNorm = norm2(dx);
    // console.log(localNorm, translateTableToVector(buildErrorGradient(currentVec, table, dims)))
    const bestStepSize = lineSearch(
      {objFunc, stepSize, currentVec, localNorm, dx, searchIndices, lineSearchSteps});
    for (let jdx = 0; jdx < dx.length; jdx++) {
      if (dx[jdx] && localNorm) {
        currentVec[searchIndices[jdx]] += -dx[jdx] / localNorm * bestStepSize;
      }
    }
  }
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
 * @param  {Array of Array of Numbers} table - The input data
 * @param  {{height: Number, width: Number}} dims - The size of the output layout
 * @return {Array of Numbers} The optimized vector
 */
export function coordinateDescent(objFunc, candidateVector, numIterations, table, dims) {
  const currentVec = candidateVector.slice();
  /* eslint-disable max-depth */
  for (let i = 0; i < numIterations; i++) {
    // janky adaptive step
    const phases = phaseShuffle();
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
  return currentVec;
}

/**
 * Just like the coordinate descent above but it runs line search to select the best
 * step size after taking the gradient
 *
 * @param  {Function} objFunc - The objective function for executing the optimization
 * @param  {Array of Numbers} candidateVector - The vector to optimize against the objective function
 * @param  {Number} numIterations - The number of iterations in the optimization process
 * @param  {Array of Array of Numbers} table - The input data
 * @param  {{height: Number, width: Number}} dims - The size of the output layout
 * @return {Array of Numbers} The optimized vector
 */
export function coordinateDescentWithLineSearch(objFunc, candidateVector, numIterations, table, dims) {
  const currentVec = candidateVector.slice();
  /* eslint-disable max-depth */
  for (let i = 0; i < numIterations; i++) {
    // TODO MAGIC NUMBER
    const stepSize = Math.min(0.01);
    // , objFunc(currentVec));
    coordinateDescentInnerLoop(objFunc, currentVec, stepSize, table, dims, 15);
  }
  /* eslint-enable max-depth */
  return currentVec;
}
