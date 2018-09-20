import pointInPolygon from 'point-in-polygon';
import {
  area,
  translateVectorToTable,
  getRectsFromTable,
  findSumForTable
} from './utils';

function continuousMax(x, y) {
  return 0.5 * (x + y + Math.abs(x - y));
}

function expPenalty(x) {
  return continuousMax(0, -x) * Math.exp(-x) * 100;
}

function dist(a, b) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

function norm(a) {
  return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2));
}

function getAngle(a, b) {
  return Math.acos((a[0] * b[0] + a[1] * b[1]) / (norm(a) * norm(b)));
}

function computeMinDist(points, cell) {
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

/**
 * Determine where an index (j, i) is in a table
 * @param  {Array of Arrays} table - table in question
 * @param  {Number} i     - the y or vertical index
 * @param  {Number} j     - the x or horizontal index
 * @return {Object}
 */
function computeEdges(table, i, j) {
  const inFirstRow = i === 0;
  const inLeftColumn = j === 0;

  const inRightColumn = j === (table[0].length - 1);
  const inLastRow = i === (table.length - 1);
  const inCorner = ((inFirstRow && (inLeftColumn || inRightColumn))) ||
          ((inLastRow && (inLeftColumn || inRightColumn)));

  return {
    inFirstRow,
    inLeftColumn,
    inRightColumn,
    inLastRow,
    inCorner
  };
}

function continOverlapPenalty(props) {
  const {
    cell,
    newTable,
    inCorner,
    inFirstRow,
    inLastRow,
    i,
    j,
    inLeftColumn,
    inRightColumn
  } = props;
  let neighbors = [];
  if (inCorner) {
    // no penaltys for corners, they are not manipualted
  } else if (inFirstRow) {
    neighbors = [
      {y: -newTable[i + 1][j - 1].y, x: newTable[i + 1][j - 1].x},
      // {y: -newTable[i + 1][j].y, x: newTable[i + 1][j].x},
      {y: -newTable[i + 1][j + 1].y, x: newTable[i + 1][j + 1].x},
      newTable[i][j + 1],
      newTable[i + 1][j + 1],
      newTable[i + 1][j],
      newTable[i + 1][j - 1],
      newTable[i][j - 1]
    ];
  } else if (inLastRow) {
    const delta = Math.max(
      Math.abs(newTable[i - 1][j - 1].y - newTable[i][j - 1].y),
      Math.abs(newTable[i - 1][j + 1].y - newTable[i][j + 1].y)
    );
    neighbors = [
      newTable[i - 1][j - 1],
      newTable[i - 1][j],
      newTable[i - 1][j + 1],
      newTable[i][j + 1],
      {x: newTable[i][j + 1].x, y: newTable[i][j + 1].y + delta},
      // {x: newTable[i - 1][j].x, y: newTable[i][j].y + 2 * delta},
      {x: newTable[i][j - 1].x, y: newTable[i][j - 1].y + delta},
      newTable[i][j - 1]
    ];
    // console.log(JSON.stringify(cell), JSON.stringify(neighbors))
  } else if (inLeftColumn) {
    neighbors = [
      {x: -newTable[i - 1][j + 1].x, y: newTable[i - 1][j + 1].y},
      newTable[i - 1][j],
      newTable[i - 1][j + 1],
      newTable[i][j + 1],
      newTable[i + 1][j + 1],
      newTable[i + 1][j],
      {x: -newTable[i + 1][j + 1].x, y: newTable[i + 1][j + 1].y},
      // {x: -newTable[i][j + 1].x, y: newTable[i][j + 1].y}
    ];
  } else if (inRightColumn) {
    const delta = Math.max(
      Math.abs(newTable[i - 1][j - 1].x - newTable[i - 1][j].x),
      Math.abs(newTable[i + 1][j - 1].x - newTable[i + 1][j].x)
    );
    neighbors = [
      newTable[i - 1][j - 1],
      newTable[i - 1][j],
      {x: newTable[i - 1][j].x + delta, y: newTable[i - 1][j].y},
      // {x: newTable[i][j].x + 2 * delta, y: newTable[i][j].y},
      {x: newTable[i + 1][j].x + delta, y: newTable[i + 1][j].y},
      newTable[i + 1][j],
      newTable[i + 1][j - 1],
      newTable[i][j - 1]
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
      newTable[i][j - 1]
    ];
  }
  const points = neighbors.map(({x, y}) => [x, y]);
  if (neighbors.length && !pointInPolygon([cell.x, cell.y], points)) {
    const minDist = computeMinDist(points, cell);
    return expPenalty(-(isFinite(minDist) ? minDist : 0));
  }
  return 0;
}

function contOrderPenalty(props) {
  const {
    cell,
    inFirstRow,
    inLastRow,
    inRightColumn,
    inLeftColumn,
    newTable,
    inCorner,
    i, j
  } = props;

  let evalTarget = [];
  // don't allow values to move out of correct order
  if (inCorner) {
    // no penaltys for corners, they are not manipualted
  } else if (inFirstRow || inLastRow) {
    evalTarget = [
      {lessThan: true, dim: 'x', val: newTable[i][j - 1].x},
      {lessThan: false, dim: 'x', val: newTable[i][j + 1].x},
      {lessThan: !inFirstRow, dim: 'y', val: newTable[i + (inFirstRow ? 1 : -1)][j].y}
    ];
  } else if (inLeftColumn || inRightColumn) {
    evalTarget = [
      {lessThan: true, dim: 'y', val: newTable[i - 1][j].y},
      {lessThan: false, dim: 'y', val: newTable[i + 1][j].y},
      {lessThan: !inLeftColumn, dim: 'x', val: newTable[i][j + (inLeftColumn ? 1 : -1)].x}
    ];
  } else {
    evalTarget = [
      {lessThan: true, dim: 'y', val: newTable[i - 1][j].y},
      {lessThan: false, dim: 'y', val: newTable[i + 1][j].y},
      {lessThan: true, dim: 'x', val: newTable[i][j - 1].x},
      {lessThan: false, dim: 'x', val: newTable[i][j + 1].x}
    ];
  }
  return evalTarget.reduce((acc, {val, dim, lessThan}) => {
    return acc + expPenalty(lessThan ? cell[dim] - val : val - cell[dim]);
  }, 0);
}

/**
 * Construct penalities for a evaluations requiring continuity
 * @param  {Array of Array of {x: Number, y: Number}} newTable - the table to be evaluaated
 * @return {Number} The evaluated penalties
 */
export function continuousBuildPenalties(newTable) {
  let penalties = 0;
  // const rects = getRectsFromTable(newTable)
  //   .reduce((acc, row) => acc.concat(row))
  //   .map(row => row.map(({x, y}) => [x, y]));
  for (let i = 0; i < newTable.length; i++) {
    for (let j = 0; j < newTable[0].length; j++) {
      const {
        inFirstRow,
        inLeftColumn,
        inRightColumn,
        inLastRow,
        inCorner
      } = computeEdges(newTable, i, j);
      const cell = newTable[i][j];

      // boundary penalties
      // dont allow the values to move outside of the box
      penalties += expPenalty(1 - cell.x);
      penalties += expPenalty(cell.x);
      penalties += expPenalty(1 - cell.y);
      penalties += expPenalty(cell.y);

      penalties += contOrderPenalty({
        cell,
        inFirstRow,
        inLastRow,
        inRightColumn,
        inLeftColumn,
        newTable,
        inCorner,
        i, j
      });

      penalties += 4 * continOverlapPenalty({
        cell,
        newTable,
        inCorner,
        inFirstRow,
        inLastRow,
        i,
        j,
        inLeftColumn,
        inRightColumn
      });

      // inside penalties
      // OLD OVERLAP PENALTY, NOT SURE HOW TO MAINTAIN THIS AS IT REQUIRES
      // for (let idx = 0; idx < rects.length; idx++) {
      //   const points = rects[idx];
      //   if (
      //     // dont penalize a point for being part of a rectangle
      //     !points.some(d => d[0] === cell.x && d[1] === cell.y) &&
      //     // do penalize it for being inside of a rectange it's not a part of
      //     pointInPolygon([cell.x, cell.y], points)
      //   ) {
      //     const minDist = computeMinDist(points, cell);
      //     penalties += expPenalty(-(isFinite(minDist) ? minDist : 0));
      //   }
      // }
    }
  }

  return penalties;
}

function discreteOverlapPenalty(rects, cell) {
  const insideViolation = rects.some(points => {
    if (points.some(d => d[0] === cell.x && d[1] === cell.y)) {
      return false;
    }
    return pointInPolygon([cell.x, cell.y], points);
  });
  return (insideViolation) ? 500 : 0;
}

function discreteOrderPenalty(newTable, cell, i, j) {
  const {
    inFirstRow,
    inLeftColumn,
    inRightColumn,
    inLastRow,
    inCorner
  } = computeEdges(newTable, i, j);
  // don't allow values to move out of correct order
  let violates = false;
  const evalFunc = ({val, dim, lessThan}) => lessThan ? cell[dim] > val : cell[dim] < val;
  if (inCorner) {
    // no penaltys for corners, they are not manipualted
  } else if (inFirstRow || inLastRow) {
    violates = ![
      {lessThan: true, dim: 'x', val: newTable[i][j - 1].x},
      {lessThan: false, dim: 'x', val: newTable[i][j + 1].x},
      {lessThan: !inFirstRow, dim: 'y', val: newTable[i + (inFirstRow ? 1 : -1)][j].y}
    ].every(evalFunc);
  } else if (inLeftColumn || inRightColumn) {
    violates = ![
      {lessThan: true, dim: 'y', val: newTable[i - 1][j].y},
      {lessThan: false, dim: 'y', val: newTable[i + 1][j].y},
      {lessThan: !inLeftColumn, dim: 'x', val: newTable[i][j + (inLeftColumn ? 1 : -1)].x}
    ].every(evalFunc);
  } else {
    violates = ![
      {lessThan: true, dim: 'y', val: newTable[i - 1][j].y},
      {lessThan: false, dim: 'y', val: newTable[i + 1][j].y},
      {lessThan: true, dim: 'x', val: newTable[i][j - 1].x},
      {lessThan: false, dim: 'x', val: newTable[i][j + 1].x}
    ].every(evalFunc);
  }
  return violates ? 1000 : 0;
}

/**
 * Construct penalities for a evaluations not requiring
 * @param  {Array of Array of {x: Number, y: Number}} newTable - the table to be evaluaated
 * @return {Number} The evaluated penalties
 */
export function buildPenalties(newTable) {
  let penalties = 0;
  const rects = getRectsFromTable(newTable)
    .reduce((acc, row) => acc.concat(row))
    .map(row => row.map(({x, y}) => [x, y]));
  for (let i = 0; i < newTable.length; i++) {
    for (let j = 0; j < newTable[0].length; j++) {
      const cell = newTable[i][j];
      // dont allow the values to move outside of the box
      if (cell.x > 1 || cell.x < 0 || cell.y > 1 || cell.y < 0) {
        penalties += 2000;
      }

      penalties += discreteOrderPenalty(newTable, cell, i, j);
      penalties += discreteOverlapPenalty(rects, cell);
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
 * @param  {Array of Numbers} vector - vector to be evaluated
 * @param  {Array of Array of Numbers} targetTable - Bound input data table
 * @param  {String} technique   Either monteCarlo or something else
 * @return {Number} Score
 */
export function objectiveFunction(vector, targetTable, technique) {
  const newTable = translateVectorToTable(vector, targetTable, 1, 1);
  const rects = getRectsFromTable(newTable);
  // sum up the relative amount of "error"
  // generate the areas of each of the boxes
  const areas = rects.map(row => row.map(rect => area(rect)));
  const sumArea = findSumForTable(areas);
  const sumTrueArea = findSumForTable(targetTable);
  const sumRatio = sumTrueArea / sumArea;
  // compare the areas and generate absolute error
  let errorSum = 0;
  for (let i = 0; i < rects.length; i++) {
    for (let j = 0; j < rects[0].length; j++) {
      const foundArea = areas[i][j];
      // TODO STILL THINKING ABOUT WHICH OF THESE IS BEST
      // errorSum += Math.abs(targetTable[i][j] - sumRatio * foundArea) / targetTable[i][j];
      errorSum += Math.pow(targetTable[i][j] - sumRatio * foundArea, 2) / targetTable[i][j];
    }
  }

  const penal = (technique === 'monteCarlo' ? buildPenalties : continuousBuildPenalties)(newTable);
  // const concavePenalty = rects.reduce((acc, row) =>
  //     acc + row.reduce((mem, rect) => mem + (checkForConcaveAngles(rect) ? 1 : 0), 0), 0)

  // return findMaxForTable(errors) + penal;
  // return findSumForTable(errors) + penal;
  return errorSum / (rects.length * rects[0].length) + penal;
}
