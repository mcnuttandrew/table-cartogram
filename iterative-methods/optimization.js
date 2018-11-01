import {objectiveFunction} from './objective-function';
import {generateInitialTable} from './layouts';
import {
  translateVectorToTable,
  translateTableToVector
} from './utils';
import {coordinateDescentWithLineSearch} from './optimization-methods/coordinate';
import {gradientDescent} from './optimization-methods/gradient';
import {monteCarloOptimization} from './optimization-methods/monte-carlo';
import {newtonStepBoth} from './optimization-methods/newton-step';

const techniqueMap = {
  newtonStep: newtonStepBoth,
  gradient: gradientDescent,
  coordinate: coordinateDescentWithLineSearch,
  monteCarlo: monteCarloOptimization
};

/**
 * Router for executing optimizations
 * All optimization are executing the exact number of iterations specified,
 * adaptive control is handled at a higher level
 * @param  {Function} objFunc - The function to optimize against
 * @param  {Array of Numbers} candidateVector - The initial position
 * @param  {String} technique - the type of optimization to perform
 * @param  {Array of Array of Numbers} table - the input data
 * @param  {Number} numIterations - The number of iterations to perform
 * @param  {Object: {height: Number, width: Number}} dims
 *  - The dimensions of the table cartogram being assembled
 * @return {Array of Array of {x: Number, y: Number}} - The optimzed table of positions
 */
export function executeOptimization(objFunc, candidateVector, technique, table, numIterations, dims) {
  if (!numIterations) {
    return translateVectorToTable(candidateVector, table, dims.height, dims.width);
  }

  const techniqueFunc = techniqueMap[technique] || coordinateDescentWithLineSearch;
  const result = techniqueFunc(objFunc, candidateVector, numIterations, table, dims);
  return translateVectorToTable(result, table, dims.height, dims.width);
}

/**
 * [buildIterativeCartogram description]
 * @param  {Array of Array of Numbers} table - the input data
 * @param  {String} technique - the type of optimization to perform
 * @param  {String} [layout='pickBest'] - The initialization layout technique
 * @param  {Object: {height: Number, width: Number}} dims
 *  - The dimensions of the table cartogram being assembled
 * @return {Function(Number)} - A function to execute optimization with
 */
export function buildIterativeCartogram(table, technique, layout = 'pickBest', dims) {
  const nowCols = table[0].length;
  const numRows = table.length;

  const objFunc = vec => objectiveFunction(vec, table, technique, dims);
  const newTable = typeof layout === 'string' ?
    generateInitialTable(numRows, nowCols, table, objFunc, layout, dims) :
    layout;
  let candidateVector = translateTableToVector(newTable);

  return (numIterations = 10) => {
    if (!numIterations) {
      return translateVectorToTable(candidateVector, table, dims.height, dims.width);
    }
    const resultTable = executeOptimization(objFunc, candidateVector, technique, table, numIterations, dims);
    candidateVector = translateTableToVector(resultTable);
    return resultTable;
  };
}
