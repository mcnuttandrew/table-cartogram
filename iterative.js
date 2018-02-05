import {area} from './utils';

export function translateTableToVector(table, targetTable) {
  const vector = [];
  for (let i = 0; i <= targetTable.length; i++) {
    for (let j = 0; j <= targetTable[0].length; j++) {
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

export function objectiveFunction(vector, targetTable) {
  // PROBABLY SOME GOOD SAVINGS BY NOT TRANSLATING back and forth constantly
  // SHRUGGIE
  const newTable = translateVectorToTable(vector, targetTable, 1, 1);
  // sum up the relative amount of "error"
  // generate the areas of each of the boxes
  const areas = [];
  // TODO double check the array indices
  for (let i = 0; i < newTable.length - 2; i++) {
    const rowAreas = [];
    for (let j = 0; j < newTable[0].length - 2; j++) {
      const newArea = area([
        newTable[i][j],
        newTable[i + 1][j],
        newTable[i + 1][j + 1],
        newTable[i + 1][j]
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
  for (let i = 0; i < areas.length - 1; i++) {
    const rowErrors = [];
    for (let j = 0; j < areas[0].length - 1; j++) {
      const error = targetTable[i][j] / sumTrueArea - newTable / sumArea;
      rowErrors.push(error);
    }
    errors.push(rowErrors);
  }
  return findSumForTable(errors);
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
  return [...new Array(tableHeight + 1)].map((i, y) =>
    [...new Array(tableWidth + 1)].map((j, x) => ({x, y}))
  );
}

// TODO MAKE THIS A CONFIGURABLE PARAMETER
const MAX_ITERATIONS = 100;
export function buildIterativeCartogram(table) {
  const width = table[0].length;
  const height = table.length;

  const newTable = generateInitialTable(height, width);
  // STILL TODO, add a notion of scaling so it doesnt come out all wonky
  // initial implementation can monte carlo
  console.log(newTable)
  let candidateVector = translateTableToVector(newTable, table);
  let oldScore = objectiveFunction(candidateVector, table);
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const newVector = monteCarloPerturb(candidateVector);
    const newScore = objectiveFunction(newVector, table);
    if (newScore < oldScore) {
      candidateVector = newVector;
      oldScore = newScore;
    }
  }
  // NUMERIC JS IS PROBABLY OUR GUY
  return translateVectorToTable(candidateVector, table, 1, 1);
}
