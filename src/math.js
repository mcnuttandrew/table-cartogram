/**
 * Compute the gradient for an objective function
 * Uses a centered finite difference for computation
 *
 * @param  {Function} objFunc The function to take the gradient of
 * @param  {Array of Numbers} currentPos - position of gradient interest
 * @param  {Number} stepSize - The size of the gradient step
 * @return {Array of Numbers} - The gradient of objFunc at currentPos
 */
export function finiteDiference(objFunc, currentPos, stepSize) {
  return currentPos.map((d, i) => {
    // currentPos[i] += stepSize;
    // const forward = objFunc(currentPos);
    // currentPos[i] -= 2 * stepSize;
    // const backward = objFunc(currentPos);
    // currentPos[i] += stepSize;
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
export function finiteDiferenceForIndices(objFunc, currentPos, stepSize, indices, onlyShowPenalty) {
  return indices.map(i => {
    // TODO make this faster by not mapping over the whole vector, just change the required item
    // MUTATIONS I GUESS!?!?!?
    // currentPos[i] += stepSize;
    // const forward = objFunc(currentPos);
    // currentPos[i] -= 2 * stepSize;
    // const backward = objFunc(currentPos);
    // currentPos[i] += stepSize;
    const forward = objFunc(currentPos.map((row, idx) => row + (idx === i ? stepSize : 0)), onlyShowPenalty);
    const backward = objFunc(currentPos.map((row, idx) => row - (idx === i ? stepSize : 0)), onlyShowPenalty);
    return (forward - backward) / (2 * stepSize);
  });
}

export function dot(a, b) {
  let ret = 0;
  for (let i = 0; i < a.length; ++i) {
    ret += a[i] * b[i];
  }
  return ret;
}

export function norm2(a) {
  return Math.sqrt(dot(a, a));
}
