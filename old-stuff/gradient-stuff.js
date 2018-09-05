// https://github.com/optimization-js/optimization-js/blob/master/src/optimization.js
/**
 * Shuffles indicies of arrray.
 * @ignore
 * @param {Array} array Array to shuffle.
 */
function shuffleIndiciesOf(array) {
  const idx = [];
  for (let i = 0; i < array.length; i++) {
    idx.push(i);
  }
  for (let i = 0; i < array.length; i++) {
    const j = Math.floor(Math.random() * i);
    const tmp = idx[i];
    idx[i] = idx[j];
    idx[j] = tmp;
  }
  return idx;
}

/**
 * Minimize an unconstrained function using zero order Powell algorithm.
 * @param {function} objectiveFunction Function to be minimized. This function takes
 * array of size N as an input, and returns a scalar value as output,
 * which is to be minimized.
 * @param {Array} x0 An array of values of size N, which is an initialization
 *  to the minimization algorithm.
 * @return {Object} An object instance with two fields: argument, which
 * denotes the best argument found thus far, and fncvalue, which is a
 * value of the function at the best found argument.
*/
const ADJUSTMENT_EPISLON = 1e-6;
const CONVERGENCE_EPSILON = 1e-2;
export function minimizePowell(objectiveFunction, inputVec) {

  let convergence = false;
  // make a copy of the initial vector
  const candidateVec = inputVec.slice();
  // scaling factor
  let alpha = 0.001;

  let pfx = Math.exp(10);
  let fx = objectiveFunction(candidateVec);
  // let pidx = 1;
  let counter = 0;
  while (counter < 10000 && !convergence) {
    const indicies = shuffleIndiciesOf(candidateVec);
    convergence = true;

    // Perform update over all of the constiables in random order
    for (let i = 0; i < indicies.length; i++) {
      // this seems clumsy
      candidateVec[indicies[i]] += ADJUSTMENT_EPISLON;
      const fxi = objectiveFunction(candidateVec);
      candidateVec[indicies[i]] -= ADJUSTMENT_EPISLON;
      const dx = (fxi - fx) / ADJUSTMENT_EPISLON;

      if (Math.abs(dx) > CONVERGENCE_EPSILON) {
        convergence = false;
      }

      candidateVec[indicies[i]] = candidateVec[indicies[i]] - alpha * dx;
      fx = objectiveFunction(candidateVec);

    }

    // a simple step size selection rule. Near x function acts linear
    // (this is assumed at least) and thus very small values of alpha
    // should lead to (small) improvement. Increasing alpha would
    // yield better improvement up to certain alpha size.

    alpha = pfx > fx ? alpha * 1.1 : alpha * 0.7;
    pfx = fx;
    counter++;
  }

  return candidateVec;
}
