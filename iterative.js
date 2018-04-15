import {area} from './utils';
// import {minimizePowell} from './gradient-stuff';
// import area from 'area-polygon';
import minimizePowell from 'minimize-powell';

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
        return Infinity;
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
        penalties = 100;
      }
    }
  }
  return penalties;
}

export function objectiveFunction(vector, targetTable) {
  // PROBABLY SOME GOOD SAVINGS BY NOT TRANSLATING back and forth constantly
  // SHRUGGIE
  const newTable = translateVectorToTable(vector, targetTable, 1, 1);
  // sum up the relative amount of "error"
  // generate the areas of each of the boxes
  const areas = [];
  for (let i = 0; i < newTable.length - 1; i++) {
    const rowAreas = [];
    for (let j = 0; j < newTable[0].length - 1; j++) {
      const newArea = area([
        newTable[i][j],
        newTable[i + 1][j],
        newTable[i + 1][j + 1],
        newTable[i][j + 1]
      ]);
      rowAreas.push(newArea);
    }
    areas.push(rowAreas);
  }

  const sumArea = findSumForTable(areas);
  const sumTrueArea = findSumForTable(targetTable);
  // compare the areas and generate absolute error
  // TODO: is using the abs error right? (like as opposed to relative error?)
  const errors = [];
  for (let i = 0; i < areas.length; i++) {
    const rowErrors = [];
    for (let j = 0; j < areas[0].length; j++) {
      const error = targetTable[i][j] / sumTrueArea - areas[i][j] / sumArea;
      rowErrors.push(Math.abs(error));
    }
    errors.push(rowErrors);
  }
  // if the proposed table doesn't conform to the "rules" then throw it out
  // penalty is always 0 or infinity
  const penal = buildPenalties(newTable);
  return findSumForTable(errors) + penal;
}

// TODO im not confident in the accuracy of this function
// NOT SURE HOW I'D WRITE A TEST FOR IT SHRUG
const EPSILON = Math.pow(10, -3);
function monteCarloPerturb(vector) {
  return vector.map(cell => cell + (Math.random() - 0.5) * EPSILON);
}

// THE DEFAULT FIGURATION FoR THE TARGET TABLE SEEMS WRONG
// MAYBE USE ONE OF THE OLD TABLE CARTOGRAM TECHNIQUES
// use the indexes of the auto generated arrays for positioning
function generateInitialTable(tableHeight, tableWidth) {
  const numCols = tableHeight;
  const numRows = tableWidth;
  return [...new Array(numCols + 1)].map((i, y) =>
    [...new Array(numRows + 1)].map((j, x) => ({x: x / numCols, y: y / numRows}))
  );
}

function monteCarloOptimization(objFunc, candidateVector, numIterations) {
  let iteratVector = candidateVector.slice(0);
  let oldScore = objFunc(candidateVector);
  for (let i = 0; i < numIterations; i++) {
    const newVector = monteCarloPerturb(iteratVector);
    const newScore = objFunc(newVector);
    if (newScore < oldScore) {
      iteratVector = newVector;
      oldScore = newScore;
    }
  }
  return iteratVector;
}

const MAX_ITERATIONS = 3000;
export function buildIterativeCartogram(table, numIterations = MAX_ITERATIONS, monteCarlo) {
  // TODO need to add a mechanism for scaling. This computation
  const width = table[0].length;
  const height = table.length;

  const newTable = generateInitialTable(height, width);
  // STILL TODO, add a notion of scaling so it doesnt come out all wonky
  // initial implementation can monte carlo
  const candidateVector = translateTableToVector(newTable, table);
  const objFunc = vec => objectiveFunction(vec, table);
  if (monteCarlo) {
    const monteFinalVec = monteCarloOptimization(objFunc, candidateVector, numIterations);
    return translateVectorToTable(monteFinalVec, table, 1, 1);
  }

  const powellFinalVec = minimizePowell(objFunc, candidateVector, {bounds: [0, 1]});
  return translateVectorToTable(powellFinalVec, table, 1, 1);
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

export function tableCartogram(table, numIterations = MAX_ITERATIONS, monteCarlo) {
  const outputTable = buildIterativeCartogram(table, numIterations, monteCarlo);
  // const targetArea = findSumForTable(table);
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
  return rects;
}
