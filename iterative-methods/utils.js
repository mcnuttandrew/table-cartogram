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

export function getRectsFromTable(table) {
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

export function findSumForTable(areas) {
  return areas.reduce((sum, row) => row.reduce((acc, cell) => acc + cell, sum), 0);
}

export function findMaxForTable(areas) {
  return areas.reduce((max, row) => row.reduce((acc, cell) => Math.max(acc, cell), max), -Infinity);
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

const diffVecs = (a, b) => ({x: a.x - b.x, y: a.y - b.y});
const dotVecs = (a, b) => a.x * b.x + a.y * b.y;
const normVec = a => Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2));
export function checkForConcaveAngles(rect) {
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

export function matrixIterate(width, height, cell) {
  const output = [];
  for (let i = 0; i < width; i++) {
    const row = [];
    for (let j = 0; j < height; j++) {
      row.push(cell(j, i));
    }
    output.push(row);
  }
  return output;
}

export const matrixAdd = (matA, matB) =>
  matrixIterate(matA[0].length, matA.length, (x, y) => matA[y][x] + matB[y][x]);

export const transposeMatrix = mat => mat[0].map((col, i) => mat.map(row => row[i]));

export const times = n => [...new Array(n)].map((d, i) => i);
