import {ObjFunc, Dimensions, LayoutType, DataTable, PositionTable, Pos} from '../types';
import {findSumForTable, translateTableToVector, log} from './utils';

type LayoutFunc = (
  numRows: number,
  numCols: number,
  colSums: number[],
  rowSums: number[],
  total: number,
) => Pos[][];
const psuedoCartogramLayout: LayoutFunc = (numRows, numCols, colSums, rowSums, total) => {
  return [...new Array(numCols + 1)].map((i, y) => {
    return [...new Array(numRows + 1)].map((j, x) => ({
      x: x ? colSums[x - 1] / total : 0,
      y: y ? rowSums[y - 1] / total : 0,
    }));
  });
};

const psuedoCartogramLayoutZigZag: LayoutFunc = (numRows, numCols, colSums, rowSums, total) => {
  return [...new Array(numCols + 1)].map((i, y) => {
    return [...new Array(numRows + 1)].map((j, x) => ({
      x: (x ? colSums[x - 1] / total : 0) + (0.025 / numRows) * (y % 2 ? -1 : 1),
      y: (y ? rowSums[y - 1] / total : 0) + (0.025 / numCols) * (x % 2 ? -1 : 1),
    }));
  });
};

const partialPsuedoCartogram: LayoutFunc = (numRows, numCols, colSums, rowSums, total) => {
  return [...new Array(numCols + 1)].map((i, y) => {
    return [...new Array(numRows + 1)].map((j, x) => ({
      x: x ? colSums[x - 1] / total : 0,
      y: y / numCols,
    }));
  });
};

function buildZigZag(xAmount: number, yAmount: number): LayoutFunc {
  return (numRows, numCols): Pos[][] => {
    return [...new Array(numCols + 1)].map((i, y) => {
      return [...new Array(numRows + 1)].map((j, x) => ({
        x: x / numRows + (xAmount / numRows) * (y % 2 ? -1 : 1),
        y: y / numCols + (yAmount / numCols) * (x % 2 ? -1 : 1),
      }));
    });
  };
}

const gridLayout = buildZigZag(0, 0);
const zigZagOnX = buildZigZag(0.5, 0);
const zigZagOnY = buildZigZag(0, 0.5);
const zigZagOnXY = buildZigZag(0.25, 0.25);

const makeSum = (x: number): number => (x * (x - 1)) / 2;

function makeRamp(rampOnX: boolean, rampOnY: boolean): LayoutFunc {
  return function (numRows: number, numCols: number): Pos[][] {
    const Xsum = makeSum(numRows + 1);
    const Ysum = makeSum(numCols + 1);
    return [...new Array(numCols + 1)].map((_, y) =>
      [...new Array(numRows + 1)].map((_, x) => ({
        y: rampOnY ? makeSum(y + 1) / Ysum : y / numCols,
        x: rampOnX ? makeSum(x + 1) / Xsum : x / numRows,
      })),
    );
  };
}

const layouts: {[x: string]: LayoutFunc} = {
  gridLayout,
  zigZagOnX,
  zigZagOnY,
  zigZagOnXY,
  psuedoCartogramLayout,
  psuedoCartogramLayoutZigZag,
  partialPsuedoCartogram,
  rampX: makeRamp(true, false),
  rampY: makeRamp(false, true),
  rampXY: makeRamp(true, true),
};

function scaleLayoutsToDims(layout: Pos[][], dims: Dimensions): PositionTable {
  return layout.map((row) => row.map((cell) => ({x: dims.width * cell.x, y: dims.height * cell.y})));
}

// use the indexes of the auto generated arrays for positioning
export function generateInitialTable(
  numCols: number,
  numRows: number,
  table: DataTable,
  objFunc: ObjFunc,
  layout: LayoutType,
  dims: Dimensions,
): PositionTable {
  const rowSums = table.map((row) => findSumForTable([row]));
  const tableTranspose = table[0].map((col, i) => table.map((row) => row[i]));
  const colSums = tableTranspose.map((row) => findSumForTable([row]));
  for (let i = 1; i < rowSums.length; i++) {
    rowSums[i] += rowSums[i - 1];
  }
  for (let i = 1; i < colSums.length; i++) {
    colSums[i] += colSums[i - 1];
  }
  const total = findSumForTable(table);

  const layoutMethod = layouts[layout];
  if (layoutMethod) {
    const builtLayout = layoutMethod(numRows, numCols, colSums, rowSums, total);
    return scaleLayoutsToDims(builtLayout, dims);
  }

  const layoutKeys = Object.keys(layouts);
  const constructedLayouts = layoutKeys.map((key) => layouts[key](numRows, numCols, colSums, rowSums, total));
  const measurements = constructedLayouts.reduce(
    (acc, newTable, idx) => {
      const currentVec = translateTableToVector(newTable);

      const newScore = objFunc(currentVec);
      if (layout === 'pickBest' ? acc.bestScore > newScore : acc.bestScore < newScore) {
        return {
          bestIndex: idx,
          bestScore: newScore,
        };
      }

      return acc;
    },
    {bestIndex: -1, bestScore: layout === 'pickWorst' ? -Infinity : Infinity},
  );
  console.log([layout, Object.keys(layouts)[measurements.bestIndex]]);
  return scaleLayoutsToDims(constructedLayouts[measurements.bestIndex], dims);
}
