import {objectiveFunction} from './objective-function';
import {generateInitialTable} from './layouts';
import {
  translateVectorToTable,
  translateTableToVector,
  getIndicesInVectorOfInterest,
  phaseShuffle
} from './utils';
import {norm2, finiteDiferenceForIndices} from './math';
import {buildErrorGradient} from './grad-penal';

// REDO TYPES
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

export function descentInnerLoop(objFunc, currentVec, table, dims, optimizationParams) {
  const {lineSearchSteps, useAnalytic, stepSize, nonDeterministic} = optimizationParams;
  const phases = phaseShuffle(nonDeterministic);
  for (let phase = 0; phase < 4; phase++) {
    const currTable = translateVectorToTable(currentVec, table, dims.height, dims.width);
    const searchIndices = getIndicesInVectorOfInterest(currTable, phases[phase]);
    // debugging stuff
    // const xdx = finiteDiferenceForIndices(objFunc, currentVec, stepSize / 10, searchIndices, true);
    // const newPen = buildErrorGradient(currentVec, table, dims, searchIndices, true);
    // if (xdx.some((v, idx) => newPen[idx] !== v)) {
    //   console.log('old', xdx)
    //   console.log('new', newPen)
    //   // console.log(currentVec)
    // }
    const dx = useAnalytic ?
      buildErrorGradient(currentVec, table, dims, searchIndices, optimizationParams) :
      finiteDiferenceForIndices(objFunc, currentVec, stepSize / 10, searchIndices);
    const localNorm = norm2(dx);
    const bestStepSize = lineSearch(
      {objFunc, stepSize, currentVec, localNorm, dx, searchIndices, lineSearchSteps});
    for (let jdx = 0; jdx < dx.length; jdx++) {
      if (dx[jdx] && localNorm) {
        // TODO enable perturbation?
        currentVec[searchIndices[jdx]] += -dx[jdx] / localNorm * bestStepSize;
      }
    }
  }
}

// TODO DELETE
// REDO TYPES
// export function descent(objFunc, candidateVector, iterations, table, dims) {
//   const currentVec = candidateVector.slice();
//   /* eslint-disable max-depth */
//   for (let i = 0; i < iterations; i++) {
//     // janky adaptive step
//     const phases = phaseShuffle();
//     const stepSize = Math.min(0.001, objFunc(currentVec));
//     for (let phase = 0; phase < 4; phase++) {
//       const currTable = translateVectorToTable(currentVec, table, dims.height, dims.width);
//       const searchIndices = getIndicesInVectorOfInterest(currTable, phases[phase]);
//       const dx = finiteDiferenceForIndices(objFunc, currentVec, stepSize / 10, searchIndices);
//       const computednorm = norm2(dx);
//       for (let jdx = 0; jdx < dx.length; jdx++) {
//         if (dx[jdx] && computednorm) {
//           currentVec[searchIndices[jdx]] += -dx[jdx] / computednorm * stepSize;
//         }
//       }
//     }
//   }
//   /* eslint-enable max-depth */
//   return currentVec;
// }

// REDO TYPES
export function descent(objFunc, candidateVector, table, optimizationParams, dims, iterations) {
  if (!iterations) {
    return translateVectorToTable(candidateVector, table, dims.height, dims.width);
  }
  const currentVec = candidateVector.slice();
  for (let i = 0; i < iterations; i++) {
    descentInnerLoop(objFunc, currentVec, table, dims, optimizationParams);
  }
  return translateVectorToTable(currentVec, table, dims.height, dims.width);
}

// REDO TYPES
export function buildIterativeCartogram(table, layout = 'pickBest', dims, optimizationParams) {
  const nowCols = table[0].length;
  const numRows = table.length;

  const objFunc = (vec, onlyShowPenalty) => objectiveFunction(
      vec, table, dims, onlyShowPenalty, optimizationParams);
  const newTable = typeof layout === 'string' ?
    generateInitialTable(numRows, nowCols, table, objFunc, layout, dims) :
    layout;
  let candidateVector = translateTableToVector(newTable);

  return (iterations = 10) => {
    if (!iterations) {
      return translateVectorToTable(candidateVector, table, dims.height, dims.width);
    }
    // compute resulting table for determined number of iterations
    const resultTable = descent(
      objFunc, candidateVector, table, optimizationParams, dims, iterations);
    // update the local candidate within the closure
    candidateVector = translateTableToVector(resultTable);
    // return the result table to the user
    return resultTable;
  };
}
