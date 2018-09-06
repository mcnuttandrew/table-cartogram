import {
  buildIterativeCartogram,
  buildIterativeCartogramWithUpdate
} from './iterative-methods/optimization';

const inputTableIsInvalid = table => !table.every(row => row.every(cell => cell));

function prepareRects(outputTable, table) {
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

const MAX_ITERATIONS = 3000;
export function tableCartogram(table, numIterations = MAX_ITERATIONS, technique) {
  if (inputTableIsInvalid(table)) {
    console.error('INVALID INPUT TABLE')
    return [];
  }
  return prepareRects(buildIterativeCartogram(table, numIterations, technique), table);
}

export function tableCartogramWithUpdate(table, technique) {
  if (inputTableIsInvalid(table)) {
    console.error('INVALID INPUT TABLE')
    return [];
  }
  const updateFunction = buildIterativeCartogramWithUpdate(table);
  return (numIterations, optionalSecondTechnique = technique) =>
    prepareRects(updateFunction(numIterations, optionalSecondTechnique), table);
}
