import {conjugateGradient} from 'fmin';
import minimizePowell from 'minimize-powell';

import {objectiveFunction} from './objective-function';
import {generateInitialTable} from './layouts';
import {translateVectorToTable, translateTableToVector} from './utils';

// TODO im not confident in the accuracy of this function
// NOT SURE HOW I'D WRITE A TEST FOR IT SHRUG
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

// const DELTA = 0.001;
function finiteDiference(obj, currentPos, stepSize) {
  const output = currentPos.map((d, i) => {
    const forward = obj(currentPos.map((row, idx) => row + (idx === i ? stepSize : 0)));
    const backward = obj(currentPos.map((row, idx) => row - (idx === i ? stepSize : 0)));
    return (forward - backward) / (2 * stepSize);
  });
  // console.log(output)
  return output;
}

function executeOptimization(objFunc, candidateVector, technique, table, numIterations) {
  if (!numIterations) {
    return translateVectorToTable(candidateVector, table, 1, 1);
  }
  switch (technique) {
  case 'powell':
    const powellFinalVec = minimizePowell(objFunc, candidateVector, {maxIter: numIterations});
    return translateVectorToTable(powellFinalVec, table, 1, 1);
  case 'gradient':
    // const monte = stagedMonteCarlo(objFunc, candidateVector, numIterations);
    // const gradient = minimize_L_BFGS(objFunc, x => {
    //   console.log('eval')
    //   return finiteDiference(objFunc, x.argument || x, 0.01);
    // }, candidateVector);
    const gradientResult = conjugateGradient((currentVec, fxprime) => {
      fxprime = fxprime || candidateVector.map(d => 0);
      // return finiteDiference(objFunc, x.argument || x, 0.01);
      finiteDiference(objFunc, currentVec, 0.0001).forEach((val, idx) => {
        fxprime[idx] = val;
      });
      const result = objFunc(currentVec);
      return result;
    }, candidateVector, {learnRate: 0.000001, maxIterations: numIterations});
    // console.log(gradient)
    return translateVectorToTable(gradientResult.x, table, 1, 1);
  case 'altMonteCarlo':
    const altMonteFinalVec = altMonteCarloOptimization(objFunc, candidateVector, numIterations);
    return translateVectorToTable(altMonteFinalVec, table, 1, 1);
  default:
  case 'monteCarlo':
    const monteFinalVec = monteCarloOptimization(objFunc, candidateVector, numIterations);
    // console.log(objFunc(monteFinalVec))
    return translateVectorToTable(monteFinalVec, table, 1, 1);
  case 'stagedMonteCarlo':
    const currentCandidate = stagedMonteCarlo(numIterations, candidateVector, objFunc);
    return translateVectorToTable(currentCandidate, table, 1, 1);
  }
}

const MAX_ITERATIONS = 3000;
export function buildIterativeCartogram(table, numIterations = MAX_ITERATIONS, technique) {
  // TODO need to add a mechanism for scaling
  const width = table[0].length;
  const height = table.length;

  const objFunc = vec => objectiveFunction(vec, table);
  const newTable = generateInitialTable(height, width, table, objFunc);
  const candidateVector = translateTableToVector(newTable, table);

  return executeOptimization(objFunc, candidateVector, technique, table, numIterations);
}

export function buildIterativeCartogramWithUpdate(table, technique) {
  // TODO need to add a mechanism for scaling
  const width = table[0].length;
  const height = table.length;

  const objFunc = vec => objectiveFunction(vec, table);
  const newTable = generateInitialTable(height, width, table, objFunc);
  let candidateVector = translateTableToVector(newTable, table);

  return numIterations => {
    const resultTable = executeOptimization(objFunc, candidateVector, technique, table, numIterations);
    candidateVector = translateTableToVector(resultTable, table);
    return resultTable;
  };
}
