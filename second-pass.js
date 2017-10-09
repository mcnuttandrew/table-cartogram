import {
  partitionTriangle
} from './utils';

function columnSum(table) {
  const numberOfColumns = table[0].length;
  return table.reduce((sumRow, row) =>{
    return row.map((cell, index) => sumRow[index] + cell);
  }, new Array(numberOfColumns).fill(0));
}

function getSumOfAllValues(table) {
  const summedRows = table.map(row => row.reduce((sum, cell) => sum + cell, 0))
  return summedRows.reduce((acc, rowVal) => acc + rowVal, 0);
}

export function getSplitPoint(table) {
  const summedRows = table.map(row => row.reduce((sum, cell) => sum + cell, 0))
  const sumOfAllValues = getSumOfAllValues(table);

  let k = 0;
  let subSum = 0;
  while (subSum < sumOfAllValues / 2) {
    subSum += summedRows[k];
    k++;
  }
  return (k - 1);
}

export function getLambda(splitPoint, table) {
  const summedRows = table.map(row => row.reduce((sum, cell) => sum + cell, 0));
  const sumOfAllValues = getSumOfAllValues(table);
  let subSum = 0;
  for (let i = 0; i < splitPoint; i++) {
    subSum += summedRows[i];
  }

  return (sumOfAllValues / 2 - subSum) / summedRows[splitPoint];
}

export function getSplitTable(table) {
  const splitPoint = getSplitPoint(table);
  const lambda = getLambda(splitPoint, table);

  const tableTop = [];
  for (let i = 0; i < splitPoint; i++) {
    tableTop.push(table[i]);
  }
  const finalRow = table[splitPoint].map(val => lambda * val);
  tableTop.push(finalRow);

  const tableBottom = [];
  const topRow = table[splitPoint].map(val => (1 - lambda) * val);
  tableBottom.push(topRow);
  // this seems wrong
  for (let i = (splitPoint + 1); i < table.length; i++) {
    tableBottom.push(table[i]);
  }
  return {tableTop, tableBottom}
}

// function padLeft(table) {
//   return table.map((row) => [0].concat(row));
// }

// do we need to pad left?
function generateBaseParition(subTable, zigZag, height) {
  const m = subTable[0].length;
  // 0 and 1 are used in the proof bc the table is only mx2 we need to use 2j - 1 & 2j + 2
  // paper says to do this at m but i am confused
  const paddedTable = subTable;//padLeft(subTable);
  const partitions = [];
  for (let j = 1; j < Math.floor(m / 2 + 1); j++) {
    const leftIndex = (2 * j - 1) - 1;
    const rightIndex = (2 * j - 2) - 1;
    const beta = paddedTable[0][leftIndex] || 0;
    const gamma = paddedTable[0][rightIndex] || 0;
    // console.log('top row', paddedTable[0], leftIndex, rightIndex)
    const alpha = paddedTable.slice(1).reduce((sum, row) => {
      return sum + (row[leftIndex] || 0) + (row[rightIndex] || 0)
    }, 0);
    const points = [
      zigZag[(2 * j - 2)],
      zigZag[(2 * j - 3)] || {x: 0, y: height},
      zigZag[(2 * j - 1)]
    ];

    // console.log('points', points, {alpha, beta, gamma})
    const partionedArea = partitionTriangle(points, {alpha, beta, gamma})
    // console.log(points, partionedArea.alpha)
    // console.log('partition', partionedArea)
    partitions.push(partionedArea.alpha);
    partitions.push(partionedArea.beta);
    partitions.push(partionedArea.gamma);
  }
  return partitions;

}

export function generateZigZag(table, tableTop, tableBottom, height) {
  const m = tableTop[0].length;
  // if this is right it can probably be broken out into it's own thing
  const Dt = [];
  const columnSumTop = columnSum(tableTop);
  for (let j = 1; j < Math.floor(m / 2 + 1); j++) {
    Dt.push((columnSumTop[(2 * j - 2) - 1] || 0) + (columnSumTop[(2 * j - 1) - 1] || 0));
  }
  const columnSumBottom = columnSum(tableBottom);
  const Db = [];
  for (let l = 1; l < Math.ceil(m / 2); l++) {
    Db.push((columnSumBottom[(2 * l - 1) - 1] || 0) + (columnSumBottom[(2 * l) - 1] || 0));
  }
  // generate zigzag
  const zigZag = [{x: 0, y: 0}];
  const summedDt = Dt.reduce((row, val) => row.concat((row[row.length - 1] || 0) + val), []);
  const summedDb = Db.reduce((row, val) => row.concat((row[row.length - 1] || 0) + val), []);

  summedDt.reverse();
  summedDb.reverse();
  while (summedDt.length || summedDb.length) {
    if (summedDt.length) {
      zigZag.push({x: summedDt.pop(), y: height});
    }
    if (summedDb.length) {
      zigZag.push({x: summedDb.pop(), y: 0});
    }
  }
  zigZag.push({x: getSumOfAllValues(table) / 2, y: m % 2 ? height : 0});
  return zigZag;
}

// use for convexification
export function generateZigZagPrime(table, zigZag) {
  const sumOfAllValues = getSumOfAllValues(table);
  const tableMin = table.reduce((acc, row) => row.reduce((mem, cell) => Math.min(mem, cell), acc), Infinity);
  const convexifyValue = 2 * tableMin / sumOfAllValues;
  return zigZag.map(({x, y}, index) => ({x, y: y + (index % 2 ? -1 : 1) * convexifyValue}));
}

export default function() {
  var height = 1;
  var width = 1;

  function tableCartogram(table) {
    // begin by determining the split point for the table
    // (known as k and lambda in the paper, splitPoint and lambda here)
    // const summedRows = table.map(row => row.reduce((sum, cell) => sum + cell, 0))
    // sumOfAllValues is also known as S
    // TODO: paper notes this must be at least 4 check in later
    const {tableTop, tableBottom} = getSplitTable(table);
    const zigZag = generateZigZag(table, tableTop, tableBottom, height);
    generateBaseParition(tableTop, zigZag, height);
    generateBaseParition(tableBottom, zigZag, height);
    // console.log(zigZag)

    return [];
  }

  tableCartogram.size = function(x) {
    // stolen from d3, so check in on that
    return arguments.length ? (width = +x[0], height = +x[1], tableCartogram) : [width, height];
  };

  // padding?

  return tableCartogram;
}
