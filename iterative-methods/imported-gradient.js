// This File is a fork of @benfred's fmin library
// The primary difference being that the learn rate is supplied to the objectiveFunction
// (also linting and sixifying)
// link https://github.com/benfred/fmin
//
// in turn his library is a pretty exact implementation of Nocedal's line search

// need some basic operations on vectors, rather than adding a dependency,
// just define here

function dot(a, b) {
  let ret = 0;
  for (let i = 0; i < a.length; ++i) {
    ret += a[i] * b[i];
  }
  return ret;
}

export function norm2(a) {
  return Math.sqrt(dot(a, a));
}

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

// searches along line 'pk' for a point that satifies the wolfe conditions
// See 'Numerical Optimization' by Nocedal and Wright p59-60
// f : objective function
// pk : search direction
// current: object containing current gradient/loss
// next: output: contains next gradient/loss
// returns a: step size taken
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
  current.fx = f(current.x, current.fxprime);
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
