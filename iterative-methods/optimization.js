import {gradientDescentLineSearch, norm2} from './imported-gradient';
// import {gradientDescentLineSearch} from 'fmin';
import minimizePowell from 'minimize-powell';

import {objectiveFunction} from './objective-function';
import {generateInitialTable} from './layouts';
import {translateVectorToTable, translateTableToVector, getIndicesInVectorOfInterest} from './utils';

function monteCarloPerturb(vector, stepSize = Math.pow(10, -2)) {
  return vector.map(cell => cell + (Math.random() - 0.5) * stepSize);
}

function monteCarloOptimization(objFunc, candidateVector, numIterations) {
  let iteratVector = candidateVector.slice(0);
  let oldScore = objFunc(candidateVector);
  for (let i = 0; i < numIterations; i++) {
    // const stepSize = Math.pow(10, -(i / numIterations * 4 + 2));
    const stepSize = Math.pow(10, -2);
    // everybody fucking loves adaptive step size
    const newVector = monteCarloPerturb(iteratVector, stepSize);
    const newScore = objFunc(newVector);
    if (newScore < oldScore) {
      iteratVector = newVector;
      oldScore = newScore;
    }
  }
  return iteratVector;
}

// monte carlo with adjustment on a single direction per pass
// TODO staged for deletion
function altMonteCarloOptimization(objFunc, candidateVector, numIterations) {
  let iteratVector = candidateVector.slice(0);
  let oldScore = objFunc(candidateVector);
  for (let i = 0; i < numIterations; i++) {
    const stepSize = Math.pow(10, -(i / numIterations * 4 + 2));
    // everybody fucking loves adaptive step size
    // const tempVector = monteCarloPerturb(iteratVector, stepSize);
    const vals = iteratVector.reduce((acc, _, idx) => {
      const leftVec = iteratVector.map((d, jdx) => jdx === idx ? d - stepSize : d);
      const newScoreLeft = objFunc(leftVec);
      const rightVec = iteratVector.map((d, jdx) => jdx === idx ? d + stepSize : d);
      const newScoreRight = objFunc(rightVec);
      if (newScoreLeft < acc.newScore && newScoreLeft < newScoreRight) {
        return {
          newScore: newScoreLeft,
          newVector: leftVec
        };
      }
      if (newScoreRight < acc.newScore && newScoreRight < newScoreLeft) {
        return {
          newScore: newScoreRight,
          newVector: rightVec
        };
      }

      return acc;
    }, {
      newScore: Infinity,
      newVector: iteratVector
    });
    const {newScore, newVector} = vals;
    // const newScore = objFunc(newVector);
    if (newScore < oldScore) {
      iteratVector = newVector;
      oldScore = newScore;
    }
  }
  return iteratVector;
}

// monte with a genetic algo type iteration cycle
// TODO staged for deletion
function stagedMonteCarlo(numIterations, candidateVector, objFunc) {
  const stepSize = Math.floor(numIterations / 6);
  const generationSize = 10;
  let currentCandidate = candidateVector;
  for (let i = 0; i < numIterations; i += stepSize) {
    const passes = [...new Array(generationSize)].map(d =>
        monteCarloOptimization(objFunc, currentCandidate, stepSize));
    const measurements = passes.reduce((acc, pass, idx) => {
      const newScore = objFunc(pass);
      if (acc.bestScore > newScore) {
        return {
          bestIndex: idx,
          bestScore: newScore
        };
      }
      return acc;
    }, {bestIndex: -1, bestScore: Infinity});
    console.log(`${Math.floor(i / numIterations * 100)} % done`)
    currentCandidate = passes[measurements.bestIndex];
  }
  return currentCandidate;
}

function coordinateDescent(objFunc, candidateVector, table, numIterations) {
  const currentVec = candidateVector.slice();
  for (let i = 0; i < numIterations; i++) {
    const stepSize = 0.001;
    for (let phase = 0; phase < 4; phase++) {
      const currTable = translateVectorToTable(currentVec, table, 1, 1);
      const searchIndices = getIndicesInVectorOfInterest(currTable, table, phase);
      // console.log(searchIndices)
      // const searchIndices = [phase];
      const dx = finiteDiferenceForIndices(objFunc, currentVec, 0.0001, searchIndices);
      const norm = norm2(dx);
      for (let jdx = 0; jdx < dx.length; jdx++) {
        if (dx[jdx]) {
          currentVec[searchIndices[jdx]] += -dx[jdx] / norm * stepSize;
        }
      }
    }
  }
  return currentVec;
}

function finiteDiference(obj, currentPos, stepSize) {
  return currentPos.map((d, i) => {
    const forward = obj(currentPos.map((row, idx) => row + (idx === i ? stepSize : 0)));
    const backward = obj(currentPos.map((row, idx) => row - (idx === i ? stepSize : 0)));
    return (forward - backward) / (2 * stepSize);
  });
}

function finiteDiferenceForIndices(obj, currentPos, stepSize, indices) {
  return indices.map(i => {
    const forward = obj(currentPos.map((row, idx) => row + (idx === i ? stepSize : 0)));
    const backward = obj(currentPos.map((row, idx) => row - (idx === i ? stepSize : 0)));
    return (forward - backward) / (2 * stepSize);
  });
}

function executeOptimization(objFunc, candidateVector, technique, table, numIterations) {
  if (!numIterations) {
    return translateVectorToTable(candidateVector, table, 1, 1);
  }
  switch (technique) {
  case 'powell':
    // TODO SCHEDULED FOR DELETION
    const powellFinalVec = minimizePowell(objFunc, candidateVector, {maxIter: numIterations});
    return translateVectorToTable(powellFinalVec, table, 1, 1);
  case 'gradient':
    const gradientResult = gradientDescentLineSearch((currentVec, fxprime, learnRate) => {
      fxprime = fxprime || candidateVector.map(d => 0);
      // Magic number for finite difference size
      // console.log(learnRate)
      const delta = finiteDiference(objFunc, currentVec, 100 * learnRate || 0.01);
      for (let idx = 0; idx < delta.length; idx++) {
        fxprime[idx] = delta[idx];
      }
      return objFunc(currentVec);
    }, candidateVector, {maxIterations: numIterations});
    return translateVectorToTable(gradientResult.x, table, 1, 1);
  case 'coordinate':
    // figure out
    const coordinateResult = coordinateDescent(objFunc, candidateVector, table, numIterations);
    return translateVectorToTable(coordinateResult, table, 1, 1);
  case 'altMonteCarlo':
    const altMonteFinalVec = altMonteCarloOptimization(objFunc, candidateVector, numIterations);
    return translateVectorToTable(altMonteFinalVec, table, 1, 1);
  default:
  case 'monteCarlo':
    const monteFinalVec = monteCarloOptimization(objFunc, candidateVector, numIterations);
    return translateVectorToTable(monteFinalVec, table, 1, 1);
  case 'stagedMonteCarlo':
    const currentCandidate = stagedMonteCarlo(numIterations, candidateVector, objFunc);
    return translateVectorToTable(currentCandidate, table, 1, 1);
  }
}

const MAX_ITERATIONS = 10;
export function buildIterativeCartogram(table, numIterations = MAX_ITERATIONS, technique) {
  // // TODO need to add a mechanism for scaling
  // const width = table[0].length;
  // const height = table.length;
  //
  // const objFunc = vec => objectiveFunction(vec, table);
  // const newTable = generateInitialTable(height, width, table, objFunc);
  // const candidateVector = translateTableToVector(newTable, table);
  //
  // return executeOptimization(objFunc, candidateVector, technique, table, numIterations);
  //
  const update = buildIterativeCartogramWithUpdate(table);
  return update(numIterations, technique);
}

export function buildIterativeCartogramWithUpdate(table, layout = 'pickBest') {
  // TODO need to add a mechanism for scaling
  const width = table[0].length;
  const height = table.length;

  const objFunc = vec => objectiveFunction(vec, table);
  const newTable = generateInitialTable(height, width, table, objFunc, layout);
  let candidateVector = translateTableToVector(newTable, table);

  return (numIterations, technique) => {
    const resultTable = executeOptimization(objFunc, candidateVector, technique, table, numIterations);
    candidateVector = translateTableToVector(resultTable, table);
    return resultTable;
  };
}
