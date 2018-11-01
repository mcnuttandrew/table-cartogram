/**
 * Execute a monte carlo step
 * @param  {Array of Numbers} vector - vector to modify
 * @param  {Number} [stepSize=Math.pow(10, -2] - The size of the monte carlo perturbation
 * @return {Array of Numbers} Vector stepped in a monte carlo direction
 */
function monteCarloPerturb(vector, stepSize = Math.pow(10, -2)) {
  return vector.map(cell => cell + (Math.random() - 0.5) * stepSize);
}

/**
 * Execute Monte Carlo optimization for target objective function
 * General technique for any vector and objective function
 *
 * @param  {Function} objFunc - The objective function for executing the optimization
 * @param  {Array of Numbers} candidateVector - The vector to optimize against the objective function
 * @param  {Number} numIterations - The number of iterations in the optimization process
 * @return {Array of Numbers} The optimized vector
 */
export function monteCarloOptimization(objFunc, candidateVector, numIterations) {
  let iteratVector = candidateVector.slice(0);
  let oldScore = objFunc(candidateVector);
  for (let i = 0; i < numIterations; i++) {
    // const stepSize = Math.pow(10, -(i / numIterations * 4 + 2));
    const stepSize = Math.pow(10, -2);
    const newVector = monteCarloPerturb(iteratVector, stepSize);
    const newScore = objFunc(newVector);
    if (newScore < oldScore) {
      iteratVector = newVector;
      oldScore = newScore;
    }
  }
  return iteratVector;
}
