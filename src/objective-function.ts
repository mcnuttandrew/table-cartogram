import {
  Vector,
  DataTable,
  Pos,
  PositionTable,
  Dimensions,
  OptimizationParams,
  ArrPos,
  PenaltyProps,
} from '../types';
import pointInPolygon from 'point-in-polygon';
import {translateVectorToTable, getRectsFromTable, findSumForTable, signedArea} from './utils';

function continuousMax(x: number, y: number): number {
  return 0.5 * (x + y + Math.abs(x - y));
}

function expPenalty(x: number): number {
  return continuousMax(0, -x) * Math.exp(-x) * 100;
}

export function derivPenalty(x: number): number {
  if (x === 0) {
    return 0;
  }
  // return expPenalty(x) *
  // return -100 * Math.exp(-x) * (Math.sign(x) - 1) * (Math.sign(x) + x) / (Math.sign(x));
  return (-(1 + Math.abs(x)) * expPenalty(x)) / Math.abs(x);
}

function dist(a: ArrPos, b: ArrPos): number {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

function norm(a: ArrPos): number {
  return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2));
}

function getAngle(a: ArrPos, b: ArrPos): number {
  return Math.acos((a[0] * b[0] + a[1] * b[1]) / (norm(a) * norm(b)));
}

// TODO DRY UP THE NEXT TWO FUNCTIONS
function computeMinDist(points: ArrPos[], cell: Pos): number {
  let minDist = Infinity;
  for (let jdx = 0; jdx < points.length; jdx++) {
    const d = points[jdx];
    const r = dist([cell.x, cell.y], d);
    const angle = getAngle([cell.x, cell.y], d);
    const newDist = r * Math.sin(angle);
    if (newDist < minDist) {
      minDist = newDist;
    }
  }
  return minDist;
}

export function computeMinDistPoint(points: ArrPos[], cell: Pos): {minPoint: ArrPos; minDist: number} {
  let minDist = Infinity;
  let minPoint = points[0];
  for (let jdx = 0; jdx < points.length; jdx++) {
    const d = points[jdx];
    const r = dist([cell.x, cell.y], d);
    const angle = getAngle([cell.x, cell.y], d);
    const newDist = r * Math.sin(angle);
    if (newDist < minDist) {
      minDist = newDist;
      minPoint = d;
    }
  }
  return {minPoint, minDist};
}

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

function continOverlapPenalty(props: PenaltyProps): number {
  const {cell, newTable, inCorner, inFirstRow, inLastRow, i, j, inLeftColumn, inRightColumn} = props;
  let neighbors = [] as Pos[];
  if (inCorner) {
    // no penaltys for corners, they are not manipualted
  } else if (inFirstRow) {
    neighbors = [
      {y: -newTable[i + 1][j - 1].y, x: newTable[i + 1][j - 1].x},
      {y: -newTable[i + 1][j + 1].y, x: newTable[i + 1][j + 1].x},
      newTable[i][j + 1],
      newTable[i + 1][j + 1],
      newTable[i + 1][j],
      newTable[i + 1][j - 1],
      newTable[i][j - 1],
    ];
  } else if (inLastRow) {
    const delta = Math.max(
      Math.abs(newTable[i - 1][j - 1].y - newTable[i][j - 1].y),
      Math.abs(newTable[i - 1][j + 1].y - newTable[i][j + 1].y),
    );
    neighbors = [
      newTable[i - 1][j - 1],
      newTable[i - 1][j],
      newTable[i - 1][j + 1],
      newTable[i][j + 1],
      {x: newTable[i][j + 1].x, y: newTable[i][j + 1].y + delta},
      {x: newTable[i][j - 1].x, y: newTable[i][j - 1].y + delta},
      newTable[i][j - 1],
    ];
  } else if (inLeftColumn) {
    neighbors = [
      {x: -newTable[i - 1][j + 1].x, y: newTable[i - 1][j + 1].y},
      newTable[i - 1][j],
      newTable[i - 1][j + 1],
      newTable[i][j + 1],
      newTable[i + 1][j + 1],
      newTable[i + 1][j],
      {x: -newTable[i + 1][j + 1].x, y: newTable[i + 1][j + 1].y},
    ];
  } else if (inRightColumn) {
    const delta = Math.max(
      Math.abs(newTable[i - 1][j - 1].x - newTable[i - 1][j].x),
      Math.abs(newTable[i + 1][j - 1].x - newTable[i + 1][j].x),
    );
    neighbors = [
      newTable[i - 1][j - 1],
      newTable[i - 1][j],
      {x: newTable[i - 1][j].x + delta, y: newTable[i - 1][j].y},
      {x: newTable[i + 1][j].x + delta, y: newTable[i + 1][j].y},
      newTable[i + 1][j],
      newTable[i + 1][j - 1],
      newTable[i][j - 1],
    ];
  } else {
    neighbors = [
      newTable[i - 1][j - 1],
      newTable[i - 1][j],
      newTable[i - 1][j + 1],
      newTable[i][j + 1],
      newTable[i + 1][j + 1],
      newTable[i + 1][j],
      newTable[i + 1][j - 1],
      newTable[i][j - 1],
    ];
  }
  const points: ArrPos[] = neighbors.map(({x, y}) => [x, y]);
  if (neighbors.length && !pointInPolygon([cell.x, cell.y], points)) {
    const minDist = computeMinDist(points, cell);
    return expPenalty(-(isFinite(minDist) ? minDist : 0));
  }
  return 0;
}

function contOrderPenalty(props: PenaltyProps): number {
  const {cell, inFirstRow, inLastRow, inRightColumn, inLeftColumn, newTable, inCorner, i, j} = props;

  let evalTarget = [] as {lessThan: boolean; dim: 'x' | 'y'; val: number}[];
  // don't allow values to move out of correct order
  if (inCorner) {
    // no penaltys for corners, they are not manipualted
  } else if (inFirstRow || inLastRow) {
    evalTarget = [
      {lessThan: true, dim: 'x', val: newTable[i][j - 1].x},
      {lessThan: false, dim: 'x', val: newTable[i][j + 1].x},
      {lessThan: !inFirstRow, dim: 'y', val: newTable[i + (inFirstRow ? 1 : -1)][j].y},
    ];
  } else if (inLeftColumn || inRightColumn) {
    evalTarget = [
      {lessThan: true, dim: 'y', val: newTable[i - 1][j].y},
      {lessThan: false, dim: 'y', val: newTable[i + 1][j].y},
      {lessThan: !inLeftColumn, dim: 'x', val: newTable[i][j + (inLeftColumn ? 1 : -1)].x},
    ];
  } else {
    evalTarget = [
      {lessThan: true, dim: 'y', val: newTable[i - 1][j].y},
      {lessThan: false, dim: 'y', val: newTable[i + 1][j].y},
      {lessThan: true, dim: 'x', val: newTable[i][j - 1].x},
      {lessThan: false, dim: 'x', val: newTable[i][j + 1].x},
    ];
  }
  return evalTarget.reduce((acc, {val, dim, lessThan}) => {
    return acc + expPenalty(lessThan ? cell[dim] - val : val - cell[dim]);
  }, 0);
}

/**
 * Construct penalities for a evaluations requiring continuity
 * TODO REDO TYPES
 * @param  {Array of Array of {x: Number, y: Number}} newTable - the table to be evaluaated
 * @return {Number} The evaluated penalties
 */
export function continuousBuildPenalties(
  newTable: PositionTable,
  dims: Dimensions,
  optimizationParams: OptimizationParams,
): number {
  let penalties = 0;
  const {orderPenalty, borderPenalty, overlapPenalty} = optimizationParams;
  for (let i = 0; i < newTable.length; i++) {
    for (let j = 0; j < newTable[0].length; j++) {
      const {inFirstRow, inLeftColumn, inRightColumn, inLastRow, inCorner} = computeEdges(newTable, i, j);
      const cell = newTable[i][j];

      // boundary penalties
      // dont allow the values to move outside of the box
      penalties += borderPenalty * expPenalty(dims.width - cell.x);
      penalties += borderPenalty * expPenalty(cell.x);
      penalties += borderPenalty * expPenalty(dims.height - cell.y);
      penalties += borderPenalty * expPenalty(cell.y);
      const penaltyProps = {
        cell,
        i,
        inCorner,
        inFirstRow,
        inLastRow,
        inLeftColumn,
        inRightColumn,
        j,
        newTable,
      };
      penalties += orderPenalty * contOrderPenalty(penaltyProps);
      penalties += overlapPenalty * continOverlapPenalty(penaltyProps);
    }
  }

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
  const rects = getRectsFromTable(newTable);
  // sum up the relative amount of "error"
  // generate the areas of each of the boxes
  const areas = rects.map((row) => row.map((rect) => signedArea(rect)));
  const sumArea = findSumForTable(areas);
  const sumTrueArea = findSumForTable(targetTable);
  const sumRatio = sumTrueArea / sumArea;
  // compare the areas and generate absolute error
  let errorSum = 0;
  for (let i = 0; i < rects.length; i++) {
    for (let j = 0; j < rects[0].length; j++) {
      const denom = Math.pow(targetTable[i][j] - sumRatio * areas[i][j], 2);
      if (optimizationParams.useGreedy) {
        errorSum += denom / targetTable[i][j];
      } else {
        errorSum += denom / Math.pow(targetTable[i][j], 2);
      }
    }
  }

  const penal = continuousBuildPenalties(newTable, dims, optimizationParams);
  // const concavePenalty = rects.reduce((acc, row) =>
  //     acc + row.reduce((mem, rect) => mem + (checkForConcaveAngles(rect) ? 1 : 0), 0), 0)
  if (onlyShowPenalty) {
    return penal;
  }

  return errorSum / (rects.length * rects[0].length) + penal;
}
