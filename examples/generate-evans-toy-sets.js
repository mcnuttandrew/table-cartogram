/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const {color} = require('d3-color');
const hexOver = require('hex-over').default;
const dataSets = require('../showcase/components/alpha-table/prepared-datasets').default;
const alphas = require('../showcase/components/alpha-table/alphas').default;
const colorCell = require('./showcase/colors').colorCell;
const makeLocalCopy = (table) => table.map((row) => row.map((d) => (typeof d === 'number' ? d : {...d})));

const ALL_ALPHAS = [
  'IDENTITY',
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
  'RECIPROCAL',
].reduce((acc, alpha) => {
  return acc.concat(
    [
      'ZION',
      // 'USA',
      'BLACK_AND_WHITE',
      'REGION_TO_REGION',
      // 'REGION_TO_REGION_FLATS'
      // 'ELELMENTS'
    ].map((dataset) => ({alpha, dataset: dataSets[dataset], datasetName: dataset})),
  );
}, []);

const TABLES = ALL_ALPHAS.map(({alpha, dataset, datasetName}) => {
  return {alpha: alphas[alpha], dataset, name: alpha, datasetName};
}).map(({alpha, dataset, name, datasetName}) => ({
  name,
  datasetName,
  config: alpha.transformConfig(dataset.config || {}),
  data: makeLocalCopy(alpha.transform(makeLocalCopy(dataset.data), dataset.config)),
}));

function writeFile(fileName, fileContents) {
  fs.writeFile(fileName, fileContents, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`${fileName} written`);
    }
  });
}

function convertTableToEvansFormat(table) {
  const dataTable = table.data;
  const tableSizeString = `${dataTable.length} ${dataTable[0].length}`;
  const namedLayout = [...new Array(dataTable.length)]
    .map((_, idx) => {
      return [...new Array(dataTable[0].length)].map((__, jdx) => `x${jdx}y${idx}`).join(' ');
    })
    .join('\n');

  const valueDomain = table.data.reduce(
    (acc, row) => {
      return row.reduce((mem, cell) => {
        const value = table.config.accessor(cell);
        return {
          min: Math.min(value, mem.min),
          max: Math.max(value, mem.max),
        };
      }, acc);
    },
    {min: Infinity, max: -Infinity},
  );

  const nameValues = [...new Array(dataTable.length)]
    .map((_, idx) => {
      return [...new Array(dataTable[0].length)]
        .map((__, jdx) => {
          const value = table.config.accessor(dataTable[idx][jdx]);
          const colorVal = colorCell(
            {...dataTable[idx][jdx], data: dataTable[idx][jdx]},
            idx * dataTable.length + jdx,
            table.config.defaultColor,
            valueDomain,
          );
          const hexColor = color(colorVal).hex();

          return `x${jdx}y${idx} ${value} ${hexOver(hexColor, '#ffffff', 0.5)}`;
        })
        .join('\n');
    })
    .join('\n');

  return `COLORGRID\n${tableSizeString}\n${namedLayout}\n${nameValues}`;
}

TABLES.forEach((table) => {
  writeFile(`./evans-toy-sets/${table.datasetName}-${table.name}.txt`, convertTableToEvansFormat(table));
});
