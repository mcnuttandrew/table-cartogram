import {multiply, norm} from 'mathjs';
import {
  translateVectorToTable,
  getIndicesInVectorOfInterest,
  phaseShuffle
} from '../utils';
import {
  finiteDiferenceForIndices,
  computeHessianForIndices,
  invDiagon
} from '../math.js';

import {coordinateDescentInnerLoop} from './coordinate';

export function newtonStep(objFunc, candidateVector, numIterations, table, dims) {
  const currentVec = candidateVector.slice();

  for (let i = 0; i < numIterations; i++) {
    const stepSize = Math.min(0.001, objFunc(currentVec) * 10);
    newtonInnerLoop(objFunc, currentVec, stepSize, table, dims);
  }
  return currentVec;
}

function newtonInnerLoop(objFunc, currentVec, stepSize, table, dims) {
  const phases = phaseShuffle();
  for (let phase = 0; phase < 4; phase++) {
    const objVal = objFunc(currentVec);
    const currTable = translateVectorToTable(currentVec, table, dims.height, dims.width);
    const searchIndices = getIndicesInVectorOfInterest(currTable, phases[phase]);
    /* eslint-disable */
    if (!searchIndices.length) {
      continue;
    }
    /* eslint-enable */
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

export function newtonStepBoth(objFunc, candidateVector, numIterations, table, dims) {
  let currentVec = candidateVector.slice();
  for (let i = 0; i < numIterations; i++) {
    const coordStepSize = Math.min(0.01, objFunc(currentVec));
    const coordDescentVec = currentVec.slice();
    coordinateDescentInnerLoop(objFunc, coordDescentVec, coordStepSize, table, dims, 0);
    const coordScore = objFunc(coordDescentVec);

    // const newtonStepSize = Math.max(Math.min(0.05, objFunc(currentVec)), 0.01);
    const newtonStepSize = 0.01;
    const newtonVec = currentVec.slice();
    newtonInnerLoop(objFunc, newtonVec, newtonStepSize, table, dims);
    const newtonScore = objFunc(newtonVec);
    /* eslint-disable no-console */
    console.log(newtonScore < coordScore ? 'newton' : 'coord');
    /* eslint-enable no-console */
    currentVec = (newtonScore < coordScore) ? newtonVec : coordDescentVec;
  }
  return currentVec;
}
