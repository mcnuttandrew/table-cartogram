import {buildIterativeCartogram} from './iterative-methods/optimization';

const inputTableIsInvalid = table => !table.every(row => row.every(cell => cell));

const MAX_ITERATIONS = 3000;
export function tableCartogram(table, numIterations = MAX_ITERATIONS, technique) {
  if (inputTableIsInvalid(table)) {
    console.error('INVALID INPUT TABLE')
    return [];
  }
  // console.log(buildForceDirectedTable(table).map)
  // const outputTable = buildForceDirectedTable(table).reduce((acc, cell, idx) => {
  //   acc[idx % (table.length + 1)][Math.floor(idx / (table.length + 1))] = cell;
  //   return acc;
  // }, [...Array(table.length + 1)].map(d => []));
  // console.log(outputTable)
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
