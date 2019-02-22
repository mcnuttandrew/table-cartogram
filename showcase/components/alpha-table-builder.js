import React from 'react';
import IterativeDisplay from './iterative-display';
import dataSets from './alpha-table/prepared-datasets';
import alphas from './alpha-table/alphas';

const makeLocalCopy = table => table.map(row =>
  row.map(d => typeof d === 'number' ? d : {...d})
);

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
  'RECIPROCAL'
].reduce((acc, alpha) =>
  acc.concat([
    // 'ZION',
    // 'USA',
    // 'BLACK_AND_WHITE',
    // 'REGION_TO_REGION',
    'REGION_TO_REGION_FLATS'
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
  config: alpha.transformConfig(dataset.config || {}),
  data: makeLocalCopy(alpha.transform(makeLocalCopy(dataset.data), dataset.config))
}));

export default function AlphaTableBuilder(props) {
  return (<div>
    {TABLES.map(({name, data, config}, idx) => {
      const commonProps = {
        iterations: 400,
        optimizationParams: {
          stepSize: 0.01,
          nonDeterministic: true
          // useAnalytic: true
        },
        // layout: 'pickWorst',
        // layout: 'gridLayout',
        // layout: 'zigZagOnXY',
        computeMode: 'iterative',
        // computeMode: 'adaptive',
        stepSize: 5,
        defaultColor: 'periodicColors',
        showLabelsByDefault: true,
        getLabel: d => d.value,
        ...config
      };
      return (
        <div key={`alpha-gen-${idx}`}>
          <h2>{name}</h2>
          <div style={{display: 'flex'}}>
            <IterativeDisplay {...commonProps} data={data}/>
          </div>
        </div>);
    })}
  </div>);
}
