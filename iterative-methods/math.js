export function diff(a, b) {
  const arr = new Array(a.length);
  for (let i = 0; i < a.length; i++) {
    arr[i] = a[i] - b[i];
  }
  return arr;
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


export function computeHessian(objFunc, currentPos, stepSize) {
  const forwardEvals = currentPos.map((d, i) => {
    return objFunc(currentPos.map((row, idx) => row + (idx === i ? stepSize : 0)));
  });
  const backEvals = currentPos.map((d, i) => {
    return objFunc(currentPos.map((row, idx) => row - (idx === i ? stepSize : 0)));
  });
  const centered = objFunc(currentPos);

  const hessian = currentPos.map((y, i) => {
    return currentPos.map((x, j) => {
      // TODO assuming symmetric hessian, but whatev
      // if (j < i) {
      //   return null;
      // }

      // compute four indices mode
      // const forwardBoth = objFunc(
      //   currentPos.map((row, idx) => row + ((idx === i || idx === j) ? stepSize : 0)));
      // const forwardX = objFunc(
      //   currentPos.map((row, idx) => row + ((idx === j) ? stepSize : 0) + ((idx === i) ? -stepSize : 0)));
      // const forwardY = objFunc(
      //   currentPos.map((row, idx) => row + ((idx === i) ? stepSize : 0) + ((idx === j) ? -stepSize : 0)));
      //
      // const backBoth = objFunc(
      //   currentPos.map((row, idx) => row - ((idx === i || idx === j) ? stepSize : 0)));
      // return (forwardBoth - forwardX - forwardY + backBoth) / (4 * stepSize * stepSize);

      // use precompute mode
      const forwardBoth = objFunc(
        currentPos.map((row, idx) => row + ((idx === i || idx === j) ? stepSize : 0)));
      const forwardX = forwardEvals[i];
      const forwardY = forwardEvals[j];
      const backX = backEvals[i];
      const backY = backEvals[j];
      const backBoth = objFunc(
        currentPos.map((row, idx) => row - ((idx === i || idx === j) ? stepSize : 0)));
      const top = (forwardBoth - forwardX - forwardY + 2 * centered - backX - backY + backBoth);
      const bottom = (2 * stepSize * stepSize);
      return top / bottom;
    });
  });
  // for (let i = 1; i < currentPos.length; i++) {
  //   for (let j = 0; j < i; j++) {
  //     hessian[i][j] = hessian[j][i];
  //   }
  // }
  return hessian;
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
export function finiteDiferenceForIndices(objFunc, currentPos, stepSize, indices) {
  return indices.map(i => {
    // TODO make this faster by not mapping over the whole vector, just change the required item
    // MUTATIONS I GUESS!?!?!?
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

export function computeHessianForIndicesbackup(objFunc, currentPos, stepSize, indices) {
  const forwardEvals = indices.map(i => {
    return objFunc(currentPos.map((row, idx) => row + (idx === i ? stepSize : 0)));
  });
  const backEvals = indices.map(i => {
    return objFunc(currentPos.map((row, idx) => row - (idx === i ? stepSize : 0)));
  });
  const centered = objFunc(currentPos);

  const hessian = indices.map((i, ydx) => {
    return indices.map((j, xdx) => {
      if (i !== j) {
        return 0;
      }
      const forwardBoth = objFunc(
        currentPos.map((row, idx) => row + ((idx === i || idx === j) ? stepSize : 0)));
      const forwardX = forwardEvals[ydx];
      const forwardY = forwardEvals[xdx];
      const backX = backEvals[ydx];
      const backY = backEvals[xdx];
      const backBoth = objFunc(
        currentPos.map((row, idx) => row - ((idx === i || idx === j) ? stepSize : 0)));
      const top = (forwardBoth - forwardX - forwardY + 2 * centered - backX - backY + backBoth);
      const bottom = (2 * stepSize * stepSize);
      return top / bottom;
    });
  });

  return hessian;
}

export function computeHessianForIndices(objFunc, currentPos, stepSize, indices) {
  const forwardEvals = indices.map(i => {
    return objFunc(currentPos.map((row, idx) => row + (idx === i ? stepSize : 0)));
  });
  const backEvals = indices.map(i => {
    return objFunc(currentPos.map((row, idx) => row - (idx === i ? stepSize : 0)));
  });
  const centered = objFunc(currentPos);

  const hessian = indices.map((i, ydx) => {
    return indices.map((j, xdx) => {
      if (i !== j) {
        return 0;
      }
      const forwardBoth = objFunc(
        currentPos.map((row, idx) => row + ((idx === i || idx === j) ? stepSize : 0)));
      const forwardX = forwardEvals[ydx];
      const forwardY = forwardEvals[xdx];
      const backX = backEvals[ydx];
      const backY = backEvals[xdx];
      const backBoth = objFunc(
        currentPos.map((row, idx) => row - ((idx === i || idx === j) ? stepSize : 0)));
      const top = (forwardBoth - forwardX - forwardY + 2 * centered - backX - backY + backBoth);
      const bottom = (2 * stepSize * stepSize);
      return top / bottom;
    });
  });

  return hessian;
}

export function invDiagon(diagMatrix) {
  return diagMatrix.map((row, idx) => {
    const newRow = row.slice();
    newRow[idx] = 1 / newRow[idx];
    return newRow;
  });
}
