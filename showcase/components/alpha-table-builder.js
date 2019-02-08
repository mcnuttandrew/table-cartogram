import React from 'react';
import IterativeDisplay from './iterative-display';
import {transposeMatrix} from '../../src/utils';
import EXAMPLES from '../../examples/examples';
import {ELELMENTS_DENSITY} from '../../examples/large-examples/element-examples';

// UTILS
const makeLocalCopy = table => table.map(row =>
  row.map(d => typeof d === 'number' ? d : {...d})
);
const getLast = list => list[list.length - 1];
const swapRows = table => {
  const fromIdx = 1;
  const toIdx = 3;
  const temp = table[fromIdx];
  table[fromIdx] = table[toIdx];
  table[toIdx] = temp;
  return table;
};
const computeDomain = (table, config) => table.reduce((acc, row) => {
  row.forEach(d => {
    acc.min = Math.min(acc.min, config.accessor(d));
    acc.max = Math.max(acc.max, config.accessor(d));
  });
  return acc;
}, {min: Infinity, max: -Infinity});

// sourced from
// http://indiegamr.com/generate-repeatable-random-numbers-in-js/
export function generateSeededRandom(baseSeed = 10) {
  let seed = baseSeed;
  return function seededRandom(max, min) {
    max = max || 1;
    min = min || 0;

    seed = (seed * 9301 + 49297) % 233280;
    const rnd = seed / 233280;

    return min + rnd * (max - min);
  };
}
const seededRandom = generateSeededRandom(2);

const generateOrderList = (table, config) => table
  .reduce((acc, row, y) =>
    acc.concat(row.map((d, x) => ({cell: d, coords: {y, x}}))
  ), [])
  .sort((a, b) => config.accessor(a.cell) - config.accessor(b.cell));

// DATASETS
const REGION_TO_REGION_DATA = require('../../examples/large-examples/state-migration-network');
const dataSets = {
  REGION_TO_REGION: {
    data: REGION_TO_REGION_DATA.MIGRATION_REGION_TO_REGION,
    config: {
      accessor: d => d.value,
      setter: (table, y, x, d) => {
        table[y][x].value = d;
        return table;
      },
      xLabels: REGION_TO_REGION_DATA.namedRegions,
      yLabels: REGION_TO_REGION_DATA.namedRegions,
      showAxisLabels: true,
      getLabel: d => `${Math.floor(d.value / 100) / 10}k`,
      defaultColor: 'valueHeatGreens'
    }
  },

  BLACK_AND_WHITE: {
    data: EXAMPLES.BLACK_AND_WHITE_TABLE,
    config: {
      getLabel: d => `${Math.round(d.value * 100) / 100}`,
      accessor: d => d,
      setter: (table, y, x, d) => {
        table[y][x] = d;
        return table;
      }
    }
  },

  USA: {
    data: EXAMPLES.USA_USA_USA_LABELS,
    config: {
      accessor: d => d[1],
      getLabel: d => d.data[0],
      setter: (table, y, x, d) => {
        table[y][x][1] = d;
        return table;
      }
    }
  },

  ELELMENTS: {
    data: ELELMENTS_DENSITY,
    config: {
      getLabel: d => `${d.data.symbol}`,
      accessor: d => d.value,
      setter: (table, y, x, d) => {
        table[y][x].value = d;
        return table;
      },
      dims: {
        height: 0.3,
        width: 1
      }
    }
  }
};

// ALPHAS
const alphas = {
  TRANSPOSE: transposeMatrix,
  RANDOMLY_VARY_ALL_CELLS: (table, config) => {
    const {min, max} = computeDomain(table, config);
    const range = max - min;
    table.forEach((row, y) => row.forEach((d, x) =>
      config.setter(table, y, x,
        Math.max(
          Math.round(10 * (config.accessor(table[y][x]) + range / 5 * (seededRandom() - 0.5))) / 10,
          1
        )
      )));
    return table;
  },
  SMALL_CHANGE: (table, {setter, accessor}) => setter(table, 1, 1, accessor(table[1][1]) * 1.1),
  BIG_CHANGE: (table, {setter, accessor}) => setter(table, 3, 1, accessor(table[3][1]) * 2),
  REVERSE_ROW: (table, config) => {
    table[2].reverse();
    return table;
  },
  SWAP_COLUMNS: (table, config) => transposeMatrix(swapRows(transposeMatrix(table))),
  SWAP_ROWS: swapRows,
  RESCALE: (table, {setter, accessor}) => {
    table.forEach((row, y) => row.forEach((d, x) => setter(table, y, x, 100 * accessor(d))));
    return table;
  },
  CHANGE_ALL_IN_COLUMN_BUT_ONE: (table, {setter, accessor}) => {
    const column = table[0].length - 2;
    table.forEach((row, y) => {
      if (y === column) {
        return;
      }
      setter(table, y, column, 3 * accessor(row[column]));
    });
    return table;
  },
  RECIPROCAL: (table, {setter, accessor}) => {
    table.forEach((row, y) => row.forEach((d, x) => setter(table, y, x, 1 / accessor(d))));
    return table;
  },
  SWAP_MIN_MAX: (table, config) => {
    const orderedValues = generateOrderList(table, config);
    const maxCoords = getLast(orderedValues).coords;
    const minCoords = orderedValues[0].coords;
    const temp = table[maxCoords.y][maxCoords.x];
    table[maxCoords.y][maxCoords.x] = table[minCoords.y][minCoords.x];
    table[minCoords.y][minCoords.x] = temp;
    return table;
  },
  SET_MAX_TO_AVERAGE: (table, config) => {
    const {accessor, setter} = config;
    // not really the most efficent way to get just that one value, but whatever
    const orderedValues = generateOrderList(table, config);
    const maxCell = getLast(orderedValues);
    const maxCoords = maxCell.coords;
    const sum = orderedValues.reduce((acc, cell) => acc + accessor(cell.cell), 0);
    setter(table, maxCoords.y, maxCoords.x, sum / (table.length * table[0].length));
    return table;
  }
};

const ALL_ALPHAS = [
  'TRANSPOSE',
  'RANDOMLY_VARY_ALL_CELLS',
  'SMALL_CHANGE',
  'BIG_CHANGE',
  'REVERSE_ROW',
  'SWAP_ROWS',
  'SWAP_COLUMNS',
  'RESCALE',
  'SWAP_MIN_MAX',
  'SET_MAX_TO_AVERAGE',
  'RECIPROCAL'
].reduce((acc, alpha) =>
  acc.concat([
    'USA',
    // 'BLACK_AND_WHITE',
    // 'REGION_TO_REGION',
    // 'ELELMENTS'
  ]
    .map(dataset => ({alpha, dataset: dataSets[dataset]}))), []);

const SUBSET_ALPHAS = [
  /* eslint-disable comma-dangle */
  {alpha: 'CHANGE_ALL_IN_COLUMN_BUT_ONE', dataset: dataSets.BLACK_AND_WHITE},
  {alpha: 'CHANGE_ALL_IN_COLUMN_BUT_ONE', dataset: dataSets.ELELMENTS},
  {alpha: 'CHANGE_ALL_IN_COLUMN_BUT_ONE', dataset: dataSets.REGION_TO_REGION},
  // {alpha: 'TRANSPOSE', dataset: dataSets.BLACK_AND_WHITE},
  // {alpha: 'RANDOMLY_VARY_ALL_CELLS', dataset: dataSets.REGION_TO_REGION},
  // {alpha: 'SMALL_CHANGE', dataset: dataSets.REGION_TO_REGION},
  // {alpha: 'BIG_CHANGE', dataset: dataSets.REGION_TO_REGION},
  // {alpha: 'REVERSE_ROW', dataset: dataSets.REGION_TO_REGION},
  // {alpha: 'SWAP_ROWS', dataset: dataSets.BLACK_AND_WHITE},
  // {alpha: 'SWAP_COLUMNS', dataset: dataSets.REGION_TO_REGION},
  // {alpha: 'RESCALE', dataset: dataSets.REGION_TO_REGION},
  // {alpha: 'SWAP_MIN_MAX', dataset: dataSets.ELELMENTS},
  // {alpha: 'SET_MAX_TO_AVERAGE', dataset: dataSets.REGION_TO_REGION},

  /* eslint-enable comma-dangle */
];

const TABLES = ALL_ALPHAS
.map(({alpha, dataset}) => ({alpha: alphas[alpha], dataset, name: alpha}))
.map(({alpha, dataset, name}) => ({
  name,
  config: dataset.config || {},
  before: makeLocalCopy(dataset.data),
  after: makeLocalCopy(alpha(makeLocalCopy(dataset.data), dataset.config))
}));

export default function AlphaTableBuilder(props) {
  const {

  } = props;
  return (<div>
    {TABLES.map((pair, idx) => {
      const commonProps = {
        iterations: 400,
        layout: 'pickBest',
        // layout: 'zigZagOnX',
        computeMode: 'iterative',
        // computeMode: 'adaptive',
        stepSize: 5,
        defaultColor: 'periodicColors',
        showLabelsByDefault: true,
        getLabel: d => d.value,
        ...pair.config
      };
      const charts = ['before', 'after'].map(key => (
        <div key={`alpha-gen-${idx}-${key}`}>
          <h3>{`${key.toUpperCase()} ALPHA`}</h3>
          <IterativeDisplay {...commonProps} data={pair[key]}/>
        </div>
      ));
      return (
        <div key={`alpha-gen-${idx}`}>
          <h2>{pair.name}</h2>
          <div style={{display: 'flex'}}>
            {charts}
          </div>
        </div>);
    })}
  </div>);
}
