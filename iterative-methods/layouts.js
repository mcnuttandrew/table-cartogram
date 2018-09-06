import {findSumForTable, translateTableToVector} from './utils';

function psuedoCartogramLayout(numRows, numCols, colSums, rowSums, total) {
  return [...new Array(numCols + 1)].map((i, y) => {
    return [...new Array(numRows + 1)].map((j, x) => ({
      x: x ? (colSums[x - 1] / total) : 0,
      y: y ? (rowSums[y - 1] / total) : 0
    }));
  });
}

// function gridLayout(numRows, numCols, colSums, rowSums, total) {
//   return [...new Array(numCols + 1)].map((i, y) => {
//     return [...new Array(numRows + 1)].map((j, x) => ({
//       x: x / numRows,
//       y: y / numCols
//     }));
//   });
// }
//
// function zigZagOnX(numRows, numCols, colSums, rowSums, total) {
//   return [...new Array(numCols + 1)].map((i, y) => {
//     return [...new Array(numRows + 1)].map((j, x) => ({
//       x: x / numRows,
//       y: y / numCols + (1 / numCols) * (x % 2 ? -1 : 1)
//     }));
//   });
// }
//
// function zigZagOnY(numRows, numCols, colSums, rowSums, total) {
//   return [...new Array(numCols + 1)].map((i, y) => {
//     return [...new Array(numRows + 1)].map((j, x) => ({
//       x: x / numRows + (1 / numRows) * (y % 2 ? -1 : 1),
//       y: y / numCols
//     }));
//   });
// }
//
// function zigZagOnXY(numRows, numCols, colSums, rowSums, total) {
//   return [...new Array(numCols + 1)].map((i, y) => {
//     return [...new Array(numRows + 1)].map((j, x) => ({
//       x: x / numRows + (0.25 / numRows) * (y % 2 ? -1 : 1),
//       y: y / numCols + (0.25 / numCols) * (x % 2 ? -1 : 1)
//     }));
//   });
// }

function buildZigZag(xAmount, yAmount) {
  return (numRows, numCols, colSums, rowSums, total) => {
    return [...new Array(numCols + 1)].map((i, y) => {
      return [...new Array(numRows + 1)].map((j, x) => ({
        x: x / numRows + (xAmount / numRows) * (y % 2 ? -1 : 1),
        y: y / numCols + (yAmount / numCols) * (x % 2 ? -1 : 1)
      }));
    });
  };
}

const gridLayout = buildZigZag(0, 0);
const zigZagOnX = buildZigZag(1, 0);
const zigZagOnY = buildZigZag(0, 1);
const zigZagOnXY = buildZigZag(0.25, 0.25);

const layouts = {
  gridLayout,
  zigZagOnX,
  zigZagOnY,
  zigZagOnXY,
  psuedoCartogramLayout
};

// use the indexes of the auto generated arrays for positioning
export function generateInitialTable(tableHeight, tableWidth, table, objFunc) {
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

  const layout = 'pickBest';
  const layoutMethod = layouts[layout];
  if (layoutMethod) {
    return layoutMethod(numRows, numCols, colSums, rowSums, total);
  }

  const constructedLayouts = Object.keys(layouts).map(key =>
    layouts[key](numRows, numCols, colSums, rowSums, total));
  const measurements = constructedLayouts.reduce((acc, newTable, idx) => {
    const newScore = objFunc(translateTableToVector(newTable, table));
    if (layout === 'pickBest' ? (acc.bestScore > newScore) : (acc.bestScore < newScore)) {
      return {
        bestIndex: idx,
        bestScore: newScore
      };
    }
    return acc;
  }, {bestIndex: -1, bestScore: layout === 'pickBest' ? Infinity : -Infinity});
  console.log(layout, Object.keys(layouts)[measurements.bestIndex])
  return constructedLayouts[measurements.bestIndex];
}
