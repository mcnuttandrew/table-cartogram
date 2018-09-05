import {findSumForTable, translateTableToVector} from './utils';

function psuedoCartogramLayout(numRows, numCols, colSums, rowSums, total) {
  return [...new Array(numCols + 1)].map((i, y) => {
    return [...new Array(numRows + 1)].map((j, x) => ({
      x: x ? (colSums[x - 1] / total) : 0,
      y: y ? (rowSums[y - 1] / total) : 0
    }));
  });
}

function gridLayout(numRows, numCols, colSums, rowSums, total) {
  return [...new Array(numCols + 1)].map((i, y) => {
    return [...new Array(numRows + 1)].map((j, x) => ({
      x: x / numRows,
      y: y / numCols
    }));
  });
}

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
  switch (layout) {
  default:
  case 'psuedoCartogram':
    return psuedoCartogramLayout(numRows, numCols, colSums, rowSums, total);
  case 'grid':
    return gridLayout(numRows, numCols, colSums, rowSums, total);
  case 'pickBest':
    const layouts = [
      psuedoCartogramLayout(numRows, numCols, colSums, rowSums, total),
      gridLayout(numRows, numCols, colSums, rowSums, total)
    ];
    const measurements = layouts.reduce((acc, newTable, idx) => {
      const newScore = objFunc(translateTableToVector(newTable, table));
      // console.log(newScore)
      if (acc.bestScore > newScore) {
        return {
          bestIndex: idx,
          bestScore: newScore
        };
      }
      return acc;
    }, {bestIndex: -1, bestScore: Infinity});
    console.log(measurements.bestIndex)
    return layouts[measurements.bestIndex];
  }
}
