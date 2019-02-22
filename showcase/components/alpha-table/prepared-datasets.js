import EXAMPLES from '../../../examples/examples';
import {ELELMENTS_DENSITY} from '../../../examples/large-examples/element-examples';
import {ZION_VISITORS_WITH_ANNOTATION} from '../../../examples/large-examples/zion-slice';
import {
  MIGRATION_REGION_TO_REGION,
  namedRegions
} from '../../../examples/large-examples/state-migration-network';
import {RV_COLORS} from '../../colors';

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

function addConsistantColors(table) {
  return table.map((row, jdx) => row.map((d, idx) => ({
    ...d,
    color: RV_COLORS[(jdx * row.length + idx) % RV_COLORS.length]
  })));
}

export const dataSets = {
  REGION_TO_REGION: {
    data: MIGRATION_REGION_TO_REGION,
    config: {
      accessor: d => d.value,
      setter: (table, y, x, d) => {
        table[y][x].value = d;
        return table;
      },
      xLabels: namedRegions,
      yLabels: namedRegions,
      showAxisLabels: true,
      getLabel: d => `${Math.floor(d.value / 100) / 10}k`,
      defaultColor: 'valueHeatGreens',
      layout: 'zigZagOnXY',
      optimizationParams: {
        // stepSize: 0.01,
        stepSize: 0.005,
        orderPenalty: 10,
        borderPenalty: 10,
        overlapPenalty: 10,
        useGreedy: false,
        // nonDeterministic: true,
        // useAnalytic: true
      }
    }
  },
  // produces heatmaps of the heatmap
  REGION_TO_REGION_FLATS: {
    data: MIGRATION_REGION_TO_REGION,
    config: {
      accessor: d => d.value,
      setter: (table, y, x, d) => {
        table[y][x].value = d;
        return table;
      },
      xLabels: namedRegions,
      yLabels: namedRegions,
      showAxisLabels: true,
      getLabel: d => `${Math.floor(d.value / 100) / 10}k`,
      defaultColor: 'valueHeatGreens',
      computeMode: 'direct',
      iterations: 0,
      layout: 'gridLayout'
    }
  },

  BLACK_AND_WHITE: {
    data: EXAMPLES.BLACK_AND_WHITE_TABLE.map((row, jdx) => row.map((value, idx) => ({
      value,
      color: RV_COLORS[(jdx * row.length + idx) % RV_COLORS.length]
    }))),
    config: {
      getLabel: d => `${Math.round(d.value * 100) / 100}`,
      accessor: d => d.value,
      setter: (table, y, x, d) => {
        table[y][x].value = d;
        return table;
      },
      defaultColor: 'byDataColor'
    }
  },

  USA: {
    data: addConsistantColors(EXAMPLES.USA_USA_USA_LABELS),
    config: {
      accessor: d => d[1],
      getLabel: d => d.data[0],
      setter: (table, y, x, d) => {
        table[y][x][1] = d;
        return table;
      },
      defaultColor: 'byDataColor'
    }
  },

  ELELMENTS: {
    data: addConsistantColors(ELELMENTS_DENSITY),
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
      },
      defaultColor: 'byDataColor'
    }
  },

  ZION: {
    data: ZION_VISITORS_WITH_ANNOTATION,
    config: {
      getLabel: d => '',
      accessor: d => d.value,
      setter: (table, y, x, d) => {
        table[y][x].value = d;
        return table;
      },
      defaultColor: 'valueHeatRedWhiteBlue',
      xLabels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
      yLabels: [...new Array(10)].map((_, idx) => `${2016 - idx}`),
      showAxisLabels: true,
      layout: 'gridLayout',
      optimizationParams: {
        stepSize: 0.005
        // useAnalytic: true
      }
    }
  }
};
export default dataSets;
