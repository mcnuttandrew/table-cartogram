import {DataTable, Vector, Pos, PositionTable, Dimensions, OptimizationParams} from '../types';
import {translateVectorToTable, getRectsFromTable, findSumForTable, signedArea} from './utils';

const dist = (a: Pos, b: Pos): number => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

/**
 * Determine where an index (j, i) is in a table
 * @param  {Array of Arrays} table - table in question
 * @param  {Number} i     - the y or vertical index
 * @param  {Number} j     - the x or horizontal index
 * @return {Object}
 */
export function computeEdges(
  table: any[][],
  i: number,
  j: number,
): {
  inFirstRow: boolean;
  inLeftColumn: boolean;
  inRightColumn: boolean;
  inLastRow: boolean;
  inCorner: boolean;
} {
  const inFirstRow = i === 0;
  const inLeftColumn = j === 0;

  const inRightColumn = j === table[0].length - 1;
  const inLastRow = i === table.length - 1;
  const inCorner =
    (inFirstRow && (inLeftColumn || inRightColumn)) || (inLastRow && (inLeftColumn || inRightColumn));

  return {
    inFirstRow,
    inLeftColumn,
    inRightColumn,
    inLastRow,
    inCorner,
  };
}

export function continuousBuildPenalties(
  newTable: PositionTable,
  dims: Dimensions,
  optimizationParams: OptimizationParams,
): number {
  let penalties = 0;
  // const rects = getRectsFromTable(newTable);
  // const areas = rects.map(row => row.map(rect => signedArea(rect)));
  // const scale = quadArea / areas[cols][rows];
  // double[][] A = new double[cols][rows];
  // for (int i = 0; i < cols; i++)
  //   for (int j = 0; j < rows; j++)
  //     A[i][j] = scale * cells[i][j].val;
  // const {
  //   orderPenalty,
  //   borderPenalty,
  //   overlapPenalty
  // } = optimizationParams;

  // note that evans uses transposed indices
  for (let i = 0; i < newTable.length; i++) {
    for (let j = 0; j < newTable[0].length; j++) {
      const {
        // inFirstRow,
        // inLeftColumn,
        inRightColumn,
        inLastRow,
        // inCorner
      } = computeEdges(newTable, i, j);
      if (inRightColumn || inLastRow) {
        continue;
      }
      // const cell = newTable[i][j];
      const upLeft = newTable[i][j];
      const upRght = newTable[i][j + 1];
      const dnLeft = newTable[i + 1][j];
      const dnRght = newTable[i + 1][j + 1];

      // area deviation
      // const area = 0.5 * (
      //   (dnRght.x - upLeft.x) * (upRght.y - dnLeft.y) -
      //   (dnRght.y - upLeft.y) * (upRght.x - dnLeft.x)
      // );
      // penalties += Math.pow((area - A[i][j]) / A[i][j], 2);

      // area ratio
      const areaTR =
        0.5 * ((upRght.x - dnRght.x) * (dnLeft.y - dnRght.y) - (upRght.y - dnRght.y) * (dnLeft.x - dnRght.x));
      const areaLB =
        0.5 * ((dnLeft.x - upLeft.x) * (upRght.y - upLeft.y) - (dnLeft.y - upLeft.y) * (upRght.x - upLeft.x));
      const areaTL =
        0.5 * ((upLeft.x - upRght.x) * (dnRght.y - upRght.y) - (upLeft.y - upRght.y) * (dnRght.x - upRght.x));
      const areaRB =
        0.5 * ((dnRght.x - dnLeft.x) * (upLeft.y - dnLeft.y) - (dnRght.y - dnLeft.y) * (upLeft.x - dnLeft.x));
      penalties += 10 * Math.pow(Math.log(areaTR / areaLB), 2);
      penalties += 10 * Math.pow(Math.log(areaTL / areaRB), 2);

      // Diagonal ratio
      penalties += Math.pow(Math.log(dist(upLeft, dnRght) / dist(dnLeft, upRght)), 2);

      // min length
      penalties += Math.pow(Math.log(dist(upLeft, dnLeft)), 2);
      penalties += Math.pow(Math.log(dist(upLeft, upRght)), 2);
      // if (!inRightColumn) {
      // }
      // if (!inLastRow) {
      // }
    }
  }
  // console.log(penalties)
  return penalties;
}

/**
 * Determine how table-cartogram ish a vector is
 * Computes average relative error of computed real value
 * Adds penalties to keep it in the form of table cartogram
 *
 * If using monte carlo will make use of a discrete version of the penalty system
 * this is because monte carlo has big jumps and doesnt compute a deriviative.
 * In contrast coordinate descent and gradient descent each optimze with fine gradients
 * so small changes matter and require delicacy.
 * TODO REDO TYPES
 * @param  {Array of Numbers} vector - vector to be evaluated
 * @param  {Array of Array of Numbers} targetTable - Bound input data table
 * @return {Number} Score
 */
export function objectiveFunction(
  vector: Vector,
  targetTable: DataTable,
  dims: Dimensions = {height: 1, width: 1},
  onlyShowPenalty: boolean,
  optimizationParams: OptimizationParams,
): number {
  const newTable = translateVectorToTable(vector, targetTable, dims.height, dims.width);
  // sum up the relative amount of "error"
  // generate the areas of each of the boxes
  const rects = getRectsFromTable(newTable);
  const areas = rects.map((row) => row.map((rect) => signedArea(rect)));
  const sumArea = findSumForTable(areas);
  const sumTrueArea = findSumForTable(targetTable);
  const sumRatio = sumTrueArea / sumArea;
  // compare the areas and generate absolute error
  let errorSum = 0;
  for (let i = 0; i < rects.length; i++) {
    for (let j = 0; j < rects[0].length; j++) {
      errorSum += Math.pow((targetTable[i][j] - sumRatio * areas[i][j]) / targetTable[i][j], 2);
    }
  }

  return errorSum + continuousBuildPenalties(newTable, dims, optimizationParams) * 0.1;
}
