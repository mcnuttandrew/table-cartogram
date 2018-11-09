import {
  finiteDiference,
  dot,
  norm2
} from '../math.js';

// This File is a fork of @benfred's fmin library
// The primary difference being that the learn rate is supplied to the objectiveFunction
// (also linting and sixifying)
// link https://github.com/benfred/fmin
//
// in turn his library is a pretty exact implementation of Nocedal's line search

function scale(ret, value, c) {
  for (let i = 0; i < value.length; ++i) {
    ret[i] = value[i] * c;
  }
}

function weightedSum(ret, w1, v1, w2, v2) {
  for (let j = 0; j < ret.length; ++j) {
    ret[j] = w1 * v1[j] + w2 * v2[j];
  }
}

/* eslint-disable max-params */
/**
 * Compute the next correct learning rate use wolf line search
 * searches along line 'pk' for a point that satifies the wolfe conditions
 * See 'Numerical Optimization' by Nocedal and Wright p59-60
 * @param  {Function}   f objective function
 * @param  {Array Of Numbers}   pk search direction
 * @param  {{x: Array Of Numbers, fx: Number, fxprime: Array Of Numbers}} current
 *      object containing current gradient/loss
 * @param  {{x: Array Of Numbers, fx: Number, fxprime: Array Of Numbers}} next
 *      output: contains next gradient/loss
 * @param  {Number}   [a=1]     Wolf parameter
 * @param  {Number}   [c1=1e-6] Wolf parameter
 * @param  {Number}   [c2=0.1]  Wolf parameter
 * @return {Number}             Learn rate
 */
function wolfeLineSearch(f, pk, current, next, a = 1, c1 = 1e-6, c2 = 0.1) {
  const phi0 = current.fx;
  const phiPrime0 = dot(current.fxprime, pk);
  let phi = phi0;
  let phiOld = phi0;
  let phiPrime = phiPrime0;
  let a0 = 0;

  function zoom(aLo, aHigh, phiLo) {
    // 16 is a magic number
    for (let iteration = 0; iteration < 16; ++iteration) {
      a = (aLo + aHigh) / 2;
      weightedSum(next.x, 1.0, current.x, a, pk);
      phi = next.fx = f(next.x, next.fxprime, a);
      phiPrime = dot(next.fxprime, pk);

      if ((phi > (phi0 + c1 * a * phiPrime0)) ||
          (phi >= phiLo)) {
        aHigh = a;
      } else {
        if (Math.abs(phiPrime) <= -c2 * phiPrime0) {
          return a;
        }

        if (phiPrime * (aHigh - aLo) >= 0) {
          aHigh = aLo;
        }

        aLo = a;
        phiLo = phi;
      }
    }

    return 0;
  }

  // 10 is not a magic number! Nocedal specifically cites it as a valid option
  for (let iteration = 0; iteration < 10; ++iteration) {
    weightedSum(next.x, 1.0, current.x, a, pk);
    phi = next.fx = f(next.x, next.fxprime);
    phiPrime = dot(next.fxprime, pk);
    if ((phi > (phi0 + c1 * a * phiPrime0)) ||
        (iteration && (phi >= phiOld))) {
      return zoom(a0, a, phiOld);
    }

    if (Math.abs(phiPrime) <= -c2 * phiPrime0) {
      return a;
    }

    if (phiPrime >= 0) {
      return zoom(a, a0, phi);
    }

    phiOld = phi;
    a0 = a;
    a *= 2;
  }

  return a;
}

/**
 * Compute a gradient descent step use wolf line search
 * @param  {Function} f - objective function
 * @param  {Array of Numbers} initial - the initialization vector for the step
 * @param  {Object} [params={}] - optimization params
 * @return {Array of Numbers} - The optimized vector
 */
export function gradientDescentLineSearch(f, initial, params = {}) {
  const {
    c1 = 1e-3,
    c2 = 0.1,
    maxIterations = initial.length * 100
  } = params;
  let {learnRate = 1} = params;

  let temp;
  let current = {x: initial.slice(), fx: 0, fxprime: initial.slice()};
  let next = {x: initial.slice(), fx: 0, fxprime: initial.slice()};
  const pk = initial.slice();
  current.fx = f(current.x, current.fxprime, 0.001);
  for (let i = 0; i < maxIterations; ++i) {
    scale(pk, current.fxprime, -1);
    learnRate = wolfeLineSearch(f, pk, current, next, learnRate, c1, c2);

    temp = current;
    current = next;
    next = temp;

    if ((learnRate === 0) || (norm2(current.fxprime) < 1e-5)) {
      break;
    }
  }

  return current;
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
export function gradientDescent(objFunc, candidateVector, numIterations) {
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
