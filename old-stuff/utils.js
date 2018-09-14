const pointAdd = (l, r) => (l.x * r.y - r.x * l.y);

/**
 * Generate a number of equally spaced points along a linear path between two points
 * @param {object} left - point where interpolation is begun, of format {x: NUMBER, y: NUMBER}
 * @param {object} left - point where interpolation is ended, of format {x: NUMBER, y: NUMBER}
 * @param {number} numberOfPoints - the number of stops in the inteprolation
 * @returns {Array} array of interpolated points
 */
export function findEquidistantPoints(left, right, numberOfPoints) {
  if (numberOfPoints === 1) {
    return [left];
  }
  const slope = (right.y - left.y) / (right.x - left.x);
  const offset = left.y - slope * left.x;
  const xRange = right.x - left.x;
  const yRange = right.y - left.y;
  const slopeIsVertical = Number.isNaN(slope) || Math.abs(slope) === Infinity;

  const points = [];
  for (let i = 0; i < numberOfPoints; i++) {
    const fraction = i / (numberOfPoints - 1);
    const xVal = fraction * xRange + left.x;
    const newPoint = {
      x: slopeIsVertical ? left.x : xVal,
      y: slopeIsVertical ? fraction * yRange + left.y : (slope * xVal + offset)
    };
    points.push(newPoint);
  }
  return points;
}

/** Compute the area for a polygon with no holes
 * @param {array} points - array of objects formatted {x, y}
 * @returns {Number} the computed area
 */
export function area(points) {
  // double the signed area for the polygon
  // TODO THIS FUNCTION IS LIABLE TO NUMERICAL DISTORTION, WATCHOUT
  const segmentSum = points
  .reduce((acc, row, index) => {
    const nextRow = points[(index + 1) % points.length];
    return acc + (row.x * nextRow.y - nextRow.x * row.y);
  }, 0);
  return 0.5 * Math.abs(segmentSum);
}

/** Helper function for partitionTriangle, generates constants
 * @param {object} v0 - left vertex of triangle
 * @param {object} v1 - right vertex of triangle
 * @param {number} area  - the value associated with this subsection
 * @returns {object} the relavant constants
 */
function getConsts(v0, v1, area) {
  const A = v1.x - v0.x;
  const B = v1.y - v0.y;
  const C = 2 * area - pointAdd(v0, v1);
  const Cm = -2 * area - pointAdd(v0, v1);
  // const C = 2 * area + A * v0.y - B * v0.x;
  // const Cm = -2 * area + A * v0.y - B * v0.x;
  return {A, B, C, Cm};
}

/** Parition a triangle into 3 unequally weight sections
 * ADD EXPLANATION OF PICKING ALGORITHM
 * having generated these lines, we drop them into a 2x2 matrix
 * and take the inverse to solve the system, which has as it's solution
 * the partition point p that we sought
 * @param {array} points - points {x, y} defining edge of triangle
 * @param {object} areas - {alpha, beta, gamma}
 * @returns {object} the partitions for each of the areas
 */
export function partitionTriangle(points, {alpha, beta, gamma}) {
  const [pointA, pointB, pointC] = points;
  const alphas = getConsts(pointB, pointC, alpha);
  const gammas = getConsts(pointA, pointB, gamma);
  const knownArea = alpha + beta + gamma;

  let det = 1 / (gammas.A * alphas.B - gammas.B * alphas.A);
  det = !isFinite(det) ? 0 : det;
  // need to check all of the Plus Minus combos, bc of abs value
  const result = [
    {gammaC: gammas.C, alphaC: alphas.C},
    {gammaC: gammas.Cm, alphaC: alphas.C},
    {gammaC: gammas.C, alphaC: alphas.Cm},
    {gammaC: gammas.Cm, alphaC: alphas.Cm}
  ].reduce((solution, combo) => {
    const {gammaC, alphaC} = combo;
    const partition = {
      x: det * (alphas.A * gammaC - gammas.A * alphaC),
      y: det * (alphas.B * gammaC - gammas.B * alphaC)
    };

    const trialSolution = {
      alpha: [partition, pointB, pointC],
      beta: [pointA, pointC, partition],
      gamma: [pointA, partition, pointB]
    };

    const solutionArea = area(trialSolution.alpha) + area(trialSolution.beta) + area(trialSolution.gamma);
    const solutionScore = Math.abs(solutionArea - knownArea);
    return {
      score: solutionScore < solution.score ? solutionScore : solution.score,
      solution: solutionScore < solution.score ? trialSolution : solution.solution
    };
  }, {score: Infinity, solution: false});

  return {
    ...result.solution,
    partition: result.solution.alpha[0]
  };
}

function getConst(pp, targArea, print) {
  const points = pp;
  points.reverse();
  let sum = 0
  for (let i = 0; i < points.length - 1; i++) {
    sum += pointAdd(points[i], points[(i + 1)])
  }

  const aa = points[points.length - 1];
  const bb = points[0];
  const left = aa.x > bb.x ? aa : bb;
  const right = aa.x < bb.x ? aa : bb;

  if (print) {

    [-2 * targArea, 2 * targArea, 0, -8 * targArea].forEach(arrrr => {
      const slope = -(right.y - left.y) / (left.x - right.x);
      const intersect = (arrrr - sum) / (left.x - right.x);
      const evalLin = (point) => ({x: point.x, y: slope * point.x + intersect})
      // console.log(evalLin(left), evalLin(right))
    });
  }

  return {
    A: 2 * targArea - sum,
    Am: -8 * targArea - sum,
    B: left.x - right.x,
    C: right.y - left.y
  };
}

/** Generate a point that is a particular fraction between two other points
 * @param {object} left - point {x, y} to interpolate from
 * @param {object} right - point {x, y} to interpolate to
 * @param {number} fraction - fraction of the distance between them to interpolate
 * @returns {object} the partitions for each of the areas
 */
export function fractionalInterpolation(left, right, fraction) {
  const slope = (right.y - left.y) / (right.x - left.x);
  const offset = left.y - slope * left.x;
  const xRange = right.x - left.x;
  const yRange = right.y - left.y;
  const slopeIsVertical = Number.isNaN(slope) || Math.abs(slope) === Infinity;

  const xVal = fraction * xRange + left.x;
  return {
    x: slopeIsVertical ? left.x : xVal,
    y: slopeIsVertical ? fraction * yRange + left.y : (slope * xVal + offset)
  };
}

/** Parition a quadrangle into 3 unequally weight sections
 * @param {array} points - points {x, y} defining edge of quadrangle
 * @param {object} areas - {alpha, beta, gamma}
 * @returns {object} the partitions for each of the areas
 */
export function partitionQuadrangle(points, intersectionPoints, {alpha, beta, gamma}, reorder) {
  // const [pointA, pointB, pointC, pointD, pointE] = points;
  // const totalArea = alpha + beta + gamma;
  // // TODO should this be 1?
  // const fractionalArea = totalArea > 0 ? (beta + gamma) / totalArea : 0;
  // // console.log('fractional area', fractionalArea)
  // const betaLeft = fractionalInterpolation(pointA, pointB, 1 - fractionalArea);
  // const gammaRight = fractionalInterpolation(pointE, pointD, 1 - fractionalArea);
  // // console.log(betaLeft, gammaRight)
  // // console.log(points)
  // // const [betaLeft, gammaRight] = intersectionPoints;
  //
  // // this use of max's assumes were right about everything else
  // // so watch out
  // const outerAlpha = area([gammaRight, pointE, pointA, betaLeft]);
  // const innerAlpha = Math.max(alpha - outerAlpha, 0);
  //
  // const outerGamma = area([pointC, pointD, gammaRight]);
  // const innerGamma = Math.max(gamma - outerGamma, 0);
  //
  // const outerBeta = area([betaLeft, pointB, pointC]);
  // const innerBeta = Math.max(beta - outerBeta, 0);
  //
  // const triangelPoints = reorder ? [pointC, gammaRight, betaLeft] : [pointC, betaLeft, gammaRight];
  //
  // const triangleSoln = partitionTriangle(
  //   triangelPoints,
  //   // [pointC, betaLeft, gammaRight],
  //   // the below is left over from finding the previous line
  //   // if you are using it, you are probably wrong
  //   // [pointC, gammaRight, betaLeft],
  //   // it is sometimes the case that these input need to be reverered???????
  //   {alpha: innerAlpha, beta: innerBeta, gamma: innerGamma}
  // );
  // // console.log({innerAlpha, innerBeta, innerGamma}, {alpha, beta, gamma})
  // // console.log('points used', JSON.stringify([pointC, betaLeft, gammaRight]))
  // // TODO MAGIC NUMBER!!
  // const partition = triangleSoln.partition;
  // // console.log('partition', partition)
  // return {
  //   alpha: [pointA, betaLeft, partition, gammaRight, pointE],
  //   beta: [partition, betaLeft, pointB, pointC],
  //   gamma: [pointC, pointD, gammaRight, partition]
  // };

  return canonSolution(points, intersectionPoints, {alpha, beta, gamma});
  // return altSolution(points, intersectionPoints, {alpha, beta, gamma});
}

function canonSolution(points, intersectionPoints, {alpha, beta, gamma}) {
  const [pointA, pointB, pointC, pointD, pointE] = points;
  const [betaLeft, gammaRight] = intersectionPoints;

  const outerAlpha = area([gammaRight, pointE, pointA, betaLeft]);
  const innerAlpha = alpha - outerAlpha;

  const outerGamma = area([pointC, pointD, gammaRight]);
  const innerGamma = gamma - outerGamma;

  const outerBeta = area([betaLeft, pointB, pointC]);
  const innerBeta = beta - outerBeta;

  const triangleSoln = partitionTriangle(
    [pointC, betaLeft, gammaRight],
    // [pointC, gammaRight, betaLeft],
    {alpha: innerAlpha, beta: innerBeta, gamma: innerGamma}
  );
  // console.log({innerAlpha, innerBeta, innerGamma}, {alpha, beta, gamma})
  // TODO MAGIC NUMBER!!
  const partition = triangleSoln.alpha[0];
  // console.log('partition', partition)
  return {
    alpha: [pointA, betaLeft, partition, gammaRight, pointE],
    beta: [partition, betaLeft, pointB, pointC],
    gamma: [pointC, pointD, gammaRight, partition]
  };
}

function altSolution(points, intersectionPoints, {alpha, beta, gamma}) {
  const [pointA, pointB, pointC, pointD, pointE] = points;
  const [betaLeft, gammaRight] = intersectionPoints;
  // const alphas = getConst([gammaRight, pointE, pointA, betaLeft], alpha);
  const alphas = getConst([gammaRight, pointD, pointC], gamma, true);
  const betas = getConst([betaLeft, pointB, pointC], beta);

  const knownArea = alpha + beta + gamma;
  // const knownArea = area(points);
  // console.log(knownArea, alpha, beta, gamma)
  const Amatrix = [[betas.C, betas.B], [alphas.C, alphas.B]];

  // need to check all of the Plus Minus combos, bc of abs value
  const result = [
    [betas.A, alphas.A],
    [betas.Am, alphas.A],
    [betas.A, alphas.Am],
    [betas.Am, alphas.Am]
  ].reduce((solution, Bvec) => {
    const partition = getXYforAB(Amatrix, Bvec);
    const trialSolution = {
      alpha: [pointA, betaLeft, partition, gammaRight, pointE],
      beta: [partition, betaLeft, pointB, pointC],
      gamma: [pointC, pointD, gammaRight, partition]
    };
    // console.log(alpha, area(trialSolution.alpha), beta, area(trialSolution.beta), gamma, area(trialSolution.gamma))
    const solutionArea = area(trialSolution.alpha) + area(trialSolution.beta) + area(trialSolution.gamma);
    // console.log('target', knownArea, solutionArea)
    const solutionScore = Math.abs(solutionArea - knownArea);
    // console.log(checkIfInside(points, partition))
    return {
      score: solutionScore < solution.score ? solutionScore : solution.score,
      solution: solutionScore < solution.score ? trialSolution : solution.solution
    };
  }, {score: Infinity, solution: false});

  return result.solution;
}

function getXYforAB(A, b) {
  const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
  return {
    x: (A[1][1] * b[0] - A[0][1] * b[1]) / det,
    y: (-A[1][0] * b[0] + A[0][0] * b[1]) / det
  };
}

/** Generate a polygon
 * @param {number} number - the number of sides in the polygon
 * @param {number} radius - the radius of the polygon
 * @param {object} offset - the offset of the polygon from zero, {x, y}
 * @returns {array} list of points in polygon
 */
export function generatePolygon(numberOfSides, radius, offset) {
  return new Array(numberOfSides).fill(0).map((point, index) => {
    const angle = Math.PI * 2 * index / numberOfSides + Math.PI / 3;
    return {x: radius * Math.cos(angle) + offset.x, y: radius * Math.sin(angle) + offset.y};
  });
}

export function deepCopyTable(table) {
  return table.reduce((acc, row) => acc.concat([row.slice(0)]), []);
}
