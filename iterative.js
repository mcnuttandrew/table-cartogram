import {area, geoCenter} from './utils';
// import {minimizePowell} from './gradient-stuff';
// import area from 'area-polygon';
import minimizePowell from 'minimize-powell';
import {nelderMead} from 'fmin';
import {minimize_GradientDescent} from 'optimization-js';

export function translateTableToVector(table, targetTable) {
  const vector = [];
  for (let i = 0; i < table.length; i++) {
    for (let j = 0; j < table[0].length; j++) {
      const inFirstRow = i === 0;
      const inLeftColumn = j === 0;
      const inRightColumn = j === targetTable[0].length;
      const inLastRow = i === targetTable.length;
      const cell = table[i][j];
      const inCorner = ((inFirstRow && (inLeftColumn || inRightColumn))) ||
              ((inLastRow && (inLeftColumn || inRightColumn)));
      if (inCorner) {
        // do nothing
      } else if (inFirstRow || inLastRow) {
        vector.push(cell.x);
      } else if (inLeftColumn || inRightColumn) {
        vector.push(cell.y);
      } else {
        vector.push(cell.x);
        vector.push(cell.y);
      }
    }
  }
  return vector;
}

/* eslint-disable complexity */
export function translateVectorToTable(vector, targetTable, height, width) {
  // vector index tracks the position in the vector as the double loop moves across
  // the form of the output table
  let vectorIndex = 0;
  const newTable = [];
  for (let i = 0; i <= targetTable.length; i++) {
    const newRow = [];
    for (let j = 0; j <= targetTable[0].length; j++) {
      const inFirstRow = i === 0;
      const inLeftColumn = j === 0;
      const inRightColumn = j === targetTable[0].length;
      const inLastRow = i === targetTable.length;
      const inCorner = ((inFirstRow && (inLeftColumn || inRightColumn))) ||
              ((inLastRow && (inLeftColumn || inRightColumn)));
      if (inCorner) {
        newRow.push({x: inLeftColumn ? 0 : width, y: inFirstRow ? 0 : height});
      } else if (inFirstRow || inLastRow) {
        newRow.push({x: vector[vectorIndex], y: inFirstRow ? 0 : height});
        vectorIndex = vectorIndex + 1;
      } else if (inLeftColumn || inRightColumn) {
        newRow.push({x: inLeftColumn ? 0 : width, y: vector[vectorIndex]});
        vectorIndex = vectorIndex + 1;
      } else {
        newRow.push({x: vector[vectorIndex], y: vector[vectorIndex + 1]});
        vectorIndex = vectorIndex + 2;
      }
    }
    newTable.push(newRow);
  }
  return newTable;
}

export function findSumForTable(areas) {
  return areas.reduce((sum, row) => row.reduce((acc, cell) => acc + cell, sum), 0);
}

export function findMaxForTable(areas) {
  return areas.reduce((max, row) => row.reduce((acc, cell) => Math.max(acc, cell), max), -Infinity);
}

function buildPenalties(newTable) {
  let penalties = 0;
  for (let i = 0; i < newTable.length; i++) {
    for (let j = 0; j < newTable[0].length; j++) {
      const inFirstRow = i === 0;
      const inLeftColumn = j === 0;
      // bounds are probably wrong
      const inRightColumn = j === (newTable[0].length - 1);
      const inLastRow = i === (newTable.length - 1);
      const inCorner = ((inFirstRow && (inLeftColumn || inRightColumn))) ||
              ((inLastRow && (inLeftColumn || inRightColumn)));
      const cell = newTable[i][j];
      // dont allow the values to move outside of the box
      if (cell.x > 1 || cell.x < 0 || cell.y > 1 || cell.y < 0) {
        return 100000;
      }
      // don't allow values to move out of correct order
      let violates = false;
      if (inCorner) {
        // no penaltys for corners, they are not manipualted
      } else if (inFirstRow || inLastRow) {
        violates = ![
          {lessThan: true, dim: 'x', val: newTable[i][j - 1].x},
          {lessThan: false, dim: 'x', val: newTable[i][j + 1].x},
          {lessThan: !inFirstRow, dim: 'y', val: newTable[i + (inFirstRow ? 1 : -1)][j].y}
        ].every(({val, dim, lessThan}) => lessThan ? cell[dim] > val : cell[dim] < val);
      } else if (inLeftColumn || inRightColumn) {
        violates = ![
          {lessThan: true, dim: 'y', val: newTable[i - 1][j].y},
          {lessThan: false, dim: 'y', val: newTable[i + 1][j].y},
          {lessThan: !inLeftColumn, dim: 'x', val: newTable[i][j + (inLeftColumn ? 1 : -1)].x}
        ].every(({val, dim, lessThan}) => lessThan ? cell[dim] > val : cell[dim] < val);
      } else {
        violates = ![
          {lessThan: true, dim: 'y', val: newTable[i - 1][j].y},
          {lessThan: false, dim: 'y', val: newTable[i + 1][j].y},
          {lessThan: true, dim: 'x', val: newTable[i][j - 1].x},
          {lessThan: false, dim: 'x', val: newTable[i][j + 1].x}
        ].every(({val, dim, lessThan}) => lessThan ? cell[dim] > val : cell[dim] < val);
      }

      if (violates) {
        penalties = 1000;
      }
    }
  }
  return penalties;
}


const diffVecs = (a, b) => ({x: a.x - b.x, y: a.y - b.y});
const dotVecs = (a, b) => a.x * b.x + a.y * b.y;
const normVec = a => Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2));
function checkForConcaveAngles(rect) {
  for (let i = 1; i < 4; i++) {
    const aVec = diffVecs(rect[i], rect[i - 1]);
    const bVec = diffVecs(rect[i], rect[(i + 1) === 4 ? 0 : (i + 1)]);
    const cosVal = dotVecs(aVec, bVec) / (normVec(aVec) * normVec(bVec));
    const angle = Math.acos(cosVal);
    // console.log(angle)
    if (angle >= Math.PI) {
      return true;
      // console.log(rect)
    }
  }
  return false;
}

function getRectsFromTable(table) {
  const rects = [];
  for (let i = 0; i < table.length - 1; i++) {
    const rowRects = [];
    for (let j = 0; j < table[0].length - 1; j++) {

      rowRects.push([
        table[i][j],
        table[i + 1][j],
        table[i + 1][j + 1],
        table[i][j + 1]
      ]);
    }
    rects.push(rowRects);
  }
  return rects;
}

export function objectiveFunction(vector, targetTable) {
  // PROBABLY SOME GOOD SAVINGS BY NOT TRANSLATING back and forth constantly
  const newTable = translateVectorToTable(vector, targetTable, 1, 1);
  const rects = getRectsFromTable(newTable);
  // sum up the relative amount of "error"
  // generate the areas of each of the boxes
  const areas = rects.map(row => row.map(rect => area(rect)));
  const sumArea = findSumForTable(areas);
  const sumTrueArea = findSumForTable(targetTable);
  // compare the areas and generate absolute error
  // TODO: is using the abs error right? (like as opposed to relative error?)
  const errors = [];
  for (let i = 0; i < rects.length; i++) {
    const rowErrors = [];
    for (let j = 0; j < rects[0].length; j++) {
      const foundArea = area(rects[i][j]);
      // const error = targetTable[i][j] / sumTrueArea - foundArea / sumArea;
      // const error = Math.abs(targetTable[i][j] / sumTrueArea - foundArea) / foundArea;
      // const error = sumTrueArea * Math.abs(targetTable[i][j] / sumTrueArea - foundArea) / targetTable[i][j];
      const error = Math.abs(targetTable[i][j] - sumTrueArea / sumArea * foundArea) / targetTable[i][j];

      rowErrors.push((error));
    }
    errors.push(rowErrors);
  }
  // if the proposed table doesn't conform to the "rules" then throw it out
  // penalty is always 0 or infinity
  const penal = buildPenalties(newTable);
  // TODO could include another penalty to try to force convexity
  // return findMaxForTable(errors) + penal;
  // return findSumForTable(errors) + penal;
  return findSumForTable(errors) / (errors.length * errors[0].length) + penal;
}

// use the indexes of the auto generated arrays for positioning
function generateInitialTable(tableHeight, tableWidth, table) {
  const numCols = tableHeight;
  const numRows = tableWidth;
  const rowSums = table.map(row => findSumForTable([row]));
  const tableTranspose = table[0].map((col, i) => table.map(row => row[i]));
  const colSums = tableTranspose.map(row => findSumForTable([row]));
  for (let i = 1; i < rowSums.length; i++) {
    rowSums[i] += rowSums[i - 1];
  }
  for (let i = 1; i < colSums.length; i++) {
    colSums[i] += colSums[i - 1];
  }
  const total = findSumForTable(table);
  // console.log(rowSums, total)
  return [...new Array(numCols + 1)].map((i, y) => {
    // console.log(y, rowSums[y - 1])
    return [...new Array(numRows + 1)].map((j, x) => ({
      // linear grid
      // x: x / numRows,
      // y: y / numCols
      // PSUEDO CARTOGRAM TECHNIQUE
      x: x ? (colSums[x - 1] / total) : 0,
      y: y ? (rowSums[y - 1] / total) : 0
    }));
  }
  );
}

// TODO im not confident in the accuracy of this function
// NOT SURE HOW I'D WRITE A TEST FOR IT SHRUG
function monteCarloPerturb(vector, stepSize = Math.pow(10, -2)) {
  return vector.map(cell => cell + (Math.random() - 0.5) * stepSize);
}

function monteCarloOptimization(objFunc, candidateVector, numIterations) {
  let iteratVector = candidateVector.slice(0);
  let oldScore = objFunc(candidateVector);
  for (let i = 0; i < numIterations; i++) {
    const stepSize = Math.pow(10, -(i / numIterations * 4 + 2));
    // everybody fucking loves adaptive step size
    const newVector = monteCarloPerturb(iteratVector, stepSize);
    const newScore = objFunc(newVector);
    if (newScore < oldScore) {
      iteratVector = newVector;
      oldScore = newScore;
    }
  }
  return iteratVector;
}

const MAX_ITERATIONS = 3000;
export function buildIterativeCartogram(table, numIterations = MAX_ITERATIONS, technique) {
  // TODO need to add a mechanism for scaling. This computation
  const width = table[0].length;
  const height = table.length;

  const newTable = generateInitialTable(height, width, table);
  // STILL TODO, add a notion of scaling so it doesnt come out all wonky
  // initial implementation can monte carlo
  const candidateVector = translateTableToVector(newTable, table);
  const objFunc = vec => objectiveFunction(vec, table);

  switch (technique) {
  case 'powell':
    const powellFinalVec = minimizePowell(objFunc, candidateVector, {maxIter: 100});
    return translateVectorToTable(powellFinalVec, table, 1, 1);
  case 'gradient':
    const gradient = minimize_GradientDescent(objFunc, x => 0, candidateVector);
    console.log(gradient)
    return translateVectorToTable(gradient.argument, table, 1, 1);
  default:
  case 'monteCarlo':
    const monteFinalVec = monteCarloOptimization(objFunc, candidateVector, numIterations);
    return translateVectorToTable(monteFinalVec, table, 1, 1);
  }
}

export function convertToManyPolygons(table) {
  const rects = [];
  for (let i = 0; i < table.length - 1; i++) {
    for (let j = 0; j < table[0].length - 1; j++) {
      const newRect = [
        table[i][j],
        table[i + 1][j],
        table[i + 1][j + 1],
        table[i][j + 1]
      ];
      rects.push(newRect);
    }
  }
  return rects;
}

export function tableCartogram(table, numIterations = MAX_ITERATIONS, technique) {
  const outputTable = buildIterativeCartogram(table, numIterations, technique);
  // TODO if using monte carlo launch some configurable number at once and pick the one
  // this would be an ensemble technique
  // that minimizes the error
  // const targetArea = findSumForTable(table);
  // console.log(outputTable)
  const rects = [];
  for (let i = 0; i < outputTable.length - 1; i++) {
    for (let j = 0; j < outputTable[0].length - 1; j++) {
      const newRect = [
        outputTable[i][j],
        outputTable[i + 1][j],
        outputTable[i + 1][j + 1],
        outputTable[i][j + 1]
      ];
      const value = table[i][j];

      rects.push({vertices: newRect, value, error: 1});
    }
  }
  // console.log(rects)
  return rects;
}
