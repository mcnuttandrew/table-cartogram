/**
 * Generate a number of equally spaced points along a linear path between two points
 * @param {object} left - point where interpolation is begun, of format {x: NUMBER, y: NUMBER}
 * @param {object} left - point where interpolation is ended, of format {x: NUMBER, y: NUMBER}
 * @param {number} numberOfPoints - the number of stops in the inteprolation
 * @returns {Array} array of interpolated points
 */
export function findEquidistantPoints(left, right, numberOfPoints) {
  const slope = (right.y - left.y) / (right.x - left.x);
  const offset = left.y - slope * left.x;
  const xRange = right.x - left.x;
  const yRange = right.y - left.y;
  const slopeIsVertical = Number.isNaN(slope) || Math.abs(slope) === Infinity;

  const points = [];
  for (var i = 0; i < numberOfPoints; i++) {
    const fraction = i / (numberOfPoints - 1);
    const xVal = fraction * xRange + left.x;
    const newPoint = {
      x: slopeIsVertical ? left.x : xVal,
      y: slopeIsVertical ? fraction * yRange + left.y : (slope * xVal + offset)
    }
    points.push(newPoint)
  }
  return points;
}

/** Compute the area for a polygon with no holes
 * @param {array} points - array of objects formatted {x, y}
 * @returns {Number} the computed area
 */
export function area(points) {
  // double the signed area for the polygon
  const segmentSum = points.reduce((acc, row, index) => {
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
  const C = 2 * area + A * v0.y - B * v0.x;
  const Cm = -2 * area + A * v0.y - B * v0.x;
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
  const totalArea = alpha + beta + gamma;

  // const det = 1 / (gammas.A * alphas.B - alphas.A * alphas.A)
  const det = 1 / (gammas.A * alphas.B - gammas.B * alphas.A)

  return [
    {gammaC: gammas.C, alphaC: alphas.C},
    {gammaC: gammas.Cm, alphaC: alphas.C},
    {gammaC: gammas.C, alphaC: alphas.Cm},
    {gammaC: gammas.Cm, alphaC: alphas.Cm}
  ].reduce((solution, combo) => {
    const {gammaC, alphaC} = combo;
    if (solution) {
      return solution;
    }
    const partition = {
      x: det * (alphas.A * gammaC - gammas.A * alphaC),
      y: det * (alphas.B * gammaC - gammas.B * alphaC)
    };

    const trialSolution = {
      alpha: [partition, pointB, pointC],
      beta: [pointA, pointC, partition],
      gamma: [pointA, partition, pointB]
    };
    // console.log(trialSolution)
    // console.log('proposed areas', {alpha, beta, gamma})
    // console.log('found areas', area(trialSolution.alpha), area(trialSolution.beta), area(trialSolution.gamma))
    const localSum = area(trialSolution.alpha) + area(trialSolution.beta) + area(trialSolution.gamma);
    // console.log(localSum, totalArea)
    return (round(localSum) === round(totalArea)) ? trialSolution : solution
  }, false);

  //
  // return {
  //   alpha: [partition, pointB, pointC],
  //   beta: [pointA, pointC, partition],
  //   gamma: [pointA, partition, pointB]
  // };
}

/** Round a value
 * @param {number} number - the number to be rounded
 * @param {number} precision - the precision of the rounding, expressed in powers of 10
 * @returns {number} the rounded value
 */
export function round(number, precision = Math.pow(10, 12)) {
  return Math.floor(number * precision) / precision;
}

/** Generate a polygon
 * @param {number} number - the number of sides in the polygon
 * @param {number} radius - the radius of the polygon
 * @param {object} offset - the offset of the polygon from zero, {x, y}
 * @returns {array} list of points in polygon
 */
export function generatePolygon(numberOfSides, radius, offset) {
  return new Array(numberOfSides).fill(0).map((point, index) => {
    const angle = Math.PI * 2 * index / numberOfSides;
    return {x: radius * Math.cos(angle) + offset.x, y: radius * Math.sin(angle) + offset.y};
  });
}
