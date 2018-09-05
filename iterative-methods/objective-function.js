import pointInPolygon from 'point-in-polygon';
import {area} from '../old-stuff/utils';
import {translateVectorToTable, getRectsFromTable, findSumForTable} from './utils';

export function objectiveFunction(vector, targetTable) {
  const sumed = targetTable.reduce((acc, row) => acc + row.reduce((mem, cell) => mem + cell, 0), 0);
  const expectedAreas = targetTable.map(row => row.map(cell => cell / sumed));
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
      // const error = (expectedAreas[i][j] - foundArea) / foundArea;
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
  // const concavePenalty = rects.reduce((acc, row) =>
  //     acc + row.reduce((mem, rect) => mem + (checkForConcaveAngles(rect) ? 1 : 0), 0), 0)
  return findSumForTable(errors) / (errors.length * errors[0].length) + penal;
}

function continuousMax(x, y) {
  return 0.5 * (x + y + Math.abs(x - y));
}

function expPenalty(x) {
  return continuousMax(0, -x) * Math.exp(-x) * 100;
}

export function continuousBuildPenalties(newTable) {
  let penalties = 0;
  const rects = getRectsFromTable(newTable).reduce((acc, row) => acc.concat(row));
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
      penalties += expPenalty(1 - cell.x);
      penalties += expPenalty(cell.x);
      penalties += expPenalty(1 - cell.y);
      penalties += expPenalty(cell.y);

      const evalPenalites = ({val, dim, lessThan}) => {
        penalties += expPenalty(lessThan ? cell[dim] - val : val - cell[dim]);
      };
      // don't allow values to move out of correct order
      if (inCorner) {
        // no penaltys for corners, they are not manipualted
      } else if (inFirstRow || inLastRow) {
        [
          {lessThan: true, dim: 'x', val: newTable[i][j - 1].x},
          {lessThan: false, dim: 'x', val: newTable[i][j + 1].x},
          {lessThan: !inFirstRow, dim: 'y', val: newTable[i + (inFirstRow ? 1 : -1)][j].y}
        ].forEach(evalPenalites);
      } else if (inLeftColumn || inRightColumn) {
        [
          {lessThan: true, dim: 'y', val: newTable[i - 1][j].y},
          {lessThan: false, dim: 'y', val: newTable[i + 1][j].y},
          {lessThan: !inLeftColumn, dim: 'x', val: newTable[i][j + (inLeftColumn ? 1 : -1)].x}
        ].forEach(evalPenalites);
      } else {
        [
          {lessThan: true, dim: 'y', val: newTable[i - 1][j].y},
          {lessThan: false, dim: 'y', val: newTable[i + 1][j].y},
          {lessThan: true, dim: 'x', val: newTable[i][j - 1].x},
          {lessThan: false, dim: 'x', val: newTable[i][j + 1].x}
        ].forEach(evalPenalites);
      }

      const insideViolation = rects.every(rect => pointInPolygon(rect, [cell.x, cell.y]));
      if (insideViolation) {
        penalties += 1000;
      }
    }
  }

  return penalties;
}

export function buildPenalties(newTable) {
  let penalties = 0;
  const rects = getRectsFromTable(newTable).reduce((acc, row) => acc.concat(row));
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
        penalties += 1000;
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
        penalties += 1000;
      }

      const insideViolation = rects.every(rect => pointInPolygon(rect, [cell.x, cell.y]));
      if (insideViolation) {
        penalties += 1000;
      }
    }
  }

  return penalties;
}
