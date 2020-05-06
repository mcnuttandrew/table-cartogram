import {transposeMatrix} from '../../../src/utils';

const getLast = (list: any[]): any => list[list.length - 1];
type Table = any[][];
interface Config {
  accessor: (x: any) => number;
  setter: (table: Table, y: number, x: number, newVal: number) => Table;
}
type Transform = (table: Table, config?: Config) => Table;
type TransformConfig = (config: any) => any;

const swapFromIdx = 1;
// for elements
const swapToIdx = 2;
// for everyone else
// const swapToIdx = 3;
const swapRows = (table: Table): Table => {
  const temp = table[swapFromIdx];
  table[swapFromIdx] = table[swapToIdx];
  table[swapToIdx] = temp;
  return table;
};

const swapLabel = (labels: string[]): string[] => {
  const copy = labels.slice();
  const temp = copy[swapFromIdx];
  copy[swapFromIdx] = copy[swapToIdx];
  copy[swapToIdx] = temp;
  return copy;
};

const computeDomain = (table: Table, config: Config): {min: number; max: number} =>
  table.reduce(
    (acc, row) => {
      row.forEach((d) => {
        acc.min = Math.min(acc.min, config.accessor(d));
        acc.max = Math.max(acc.max, config.accessor(d));
      });
      return acc;
    },
    {min: Infinity, max: -Infinity},
  );

// sourced from
// http://indiegamr.com/generate-repeatable-random-numbers-in-js/
export function generateSeededRandom(baseSeed = 10): (max?: number, min?: number) => number {
  let seed = baseSeed;
  return function seededRandom(max, min): number {
    max = max || 1;
    min = min || 0;

    seed = (seed * 9301 + 49297) % 233280;
    const rnd = seed / 233280;

    return min + rnd * (max - min);
  };
}
const seededRandom = generateSeededRandom(2);

const generateOrderList = (table: Table, config: Config): Table =>
  table
    .reduce((acc, row, y) => acc.concat(row.map((d, x) => ({cell: d, coords: {y, x}}))), [])
    .sort((a, b) => config.accessor(a.cell) - config.accessor(b.cell));

const identity = (d: any): any => d;
class Alpha {
  transform: Transform;
  transformConfig: TransformConfig;
  constructor(transform = identity, transformConfig = identity) {
    this.transform = transform;
    this.transformConfig = transformConfig;
  }
}

const buildIdentity = () => new Alpha();
const buildTranspose = () => {
  const transformConfig = (config: any) => ({
    ...config,
    xLabels: config.yLabels,
    yLabels: config.xLabels,
  });
  return new Alpha(transposeMatrix, transformConfig);
};

const buildRandomlyVaryCells = () => {
  const transform: Transform = (table, config) => {
    const {min, max} = computeDomain(table, config);
    const range = max - min;
    table.forEach((row, y) =>
      row.forEach((d, x) =>
        config.setter(
          table,
          y,
          x,
          Math.max(
            Math.round(10 * (config.accessor(table[y][x]) + (range / 5) * (seededRandom() - 0.5))) / 10,
            1,
          ),
        ),
      ),
    );
    return table;
  };
  return new Alpha(transform);
};
const buildSmallChange = (): Alpha => {
  const transform: Transform = (table, {setter, accessor}) =>
    setter(table, 1, 1, accessor(table[1][1]) * 1.1);
  return new Alpha(transform);
};
const buildBigChange = (): Alpha => {
  // version for all but elements
  // const transform = (table, {setter, accessor}) =>
  //   setter(table, 3, 1, accessor(table[3][1]) * 2);
  // version for elements
  const transform: Transform = (table, {setter, accessor}) => setter(table, 2, 1, accessor(table[2][1]) * 2);
  return new Alpha(transform);
};
const buildReverseRow = (): Alpha => {
  const transformConfig = (config: any) => ({
    ...config,
    xLabels: config.xLabels ? config.xLabels.slice().reverse() : config.xLabels,
  });
  const transform: Transform = (table, config) => {
    table[2].reverse();
    return table;
  };
  return new Alpha(transform, transformConfig);
};

const buildSwapColumns = (): Alpha => {
  const transformConfig = (config: any) => ({
    ...config,
    xLabels: config.xLabels ? swapLabel(config.xLabels) : config.xLabels,
  });
  const transform: Transform = (table) => transposeMatrix(swapRows(transposeMatrix(table)));
  return new Alpha(transform, transformConfig);
};

const buildSwapRow = (): Alpha => {
  const transformConfig = (config: any) => ({
    ...config,
    yLabels: config.yLabels ? swapLabel(config.yLabels) : config.yLabels,
  });
  return new Alpha(swapRows, transformConfig);
};

const buildRescale = (): Alpha => {
  const transform: Transform = (table, {setter, accessor}) => {
    table.forEach((row, y) => row.forEach((d, x) => setter(table, y, x, 100 * accessor(d))));
    return table;
  };
  return new Alpha(transform);
};

const buildChangelAllInColumnButOne = (): Alpha => {
  const transform: Transform = (table, {setter, accessor}) => {
    const column = table[0].length - 2;
    table.forEach((row, y) => {
      if (y === column) {
        return;
      }
      setter(table, y, column, 3 * accessor(row[column]));
    });
    return table;
  };
  return new Alpha(transform);
};

const buildReciprocal = (): Alpha => {
  const transform: Transform = (table, {setter, accessor}) => {
    table.forEach((row, y) => row.forEach((d, x) => setter(table, y, x, 1 / accessor(d))));
    return table;
  };
  return new Alpha(transform);
};

const buildSwapMinMax = (): Alpha => {
  const transform: Transform = (table, config) => {
    const orderedValues = generateOrderList(table, config);
    const maxCoords = getLast(orderedValues).coords;
    // @ts-ignore
    const minCoords = orderedValues[0].coords;
    const temp = table[maxCoords.y][maxCoords.x];
    table[maxCoords.y][maxCoords.x] = table[minCoords.y][minCoords.x];
    table[minCoords.y][minCoords.x] = temp;
    return table;
  };
  return new Alpha(transform);
};

const buildSetMaxToAverage = (): Alpha => {
  const transform: Transform = (table, config) => {
    const {accessor, setter} = config;
    // not really the most efficent way to get just that one value, but whatever
    const orderedValues = generateOrderList(table, config);
    const maxCell = getLast(orderedValues);
    const maxCoords = maxCell.coords;
    // @ts-ignore
    const sum = orderedValues.reduce((acc, cell) => acc + accessor(cell.cell), 0);
    setter(table, maxCoords.y, maxCoords.x, sum / (table.length * table[0].length));
    return table;
  };
  return new Alpha(transform);
};

export default {
  IDENTITY: buildIdentity(),
  TRANSPOSE: buildTranspose(),
  RANDOMLY_VARY_ALL_CELLS: buildRandomlyVaryCells(),
  SMALL_CHANGE: buildSmallChange(),
  BIG_CHANGE: buildBigChange(),
  REVERSE_ROW: buildReverseRow(),
  SWAP_COLUMNS: buildSwapColumns(),
  SWAP_ROWS: buildSwapRow(),
  RESCALE: buildRescale(),
  CHANGE_ALL_IN_COLUMN_BUT_ONE: buildChangelAllInColumnButOne(),
  RECIPROCAL: buildReciprocal(),
  SWAP_MIN_MAX: buildSwapMinMax(),
  SET_MAX_TO_AVERAGE: buildSetMaxToAverage(),
} as {[x: string]: Alpha};
