import {RV_COLORS} from './colors';
import EXAMPLES from '../examples/examples';
import {
  interpolateRdBu,
  interpolateGreens
} from 'd3-scale-chromatic';
import {transposeMatrix} from '../src/utils';

/**
 * Generates a pair of versions of the element example
 * One normal, and one transpose
 */
export function createElementTableWithTranspose() {
  const {ELELMENTS_DENSITY} = require('../examples/large-examples/element-examples');
  const data = ELELMENTS_DENSITY.map((row, idx) => row.map((d, jdx) => ({
    ...d,
    color: RV_COLORS[(idx * row.length + jdx) % RV_COLORS.length]
  })));

  const regularDims = {height: 0.5, width: 1};
  const transposeDims = {height: 1, width: 0.5};
  const basicSetup = {
    stepSize: 10,
    computeMode: 'iterative',
    accessor: cell => cell.value,
    getLabel: cell => cell.data.symbol,
    showAxisLabels: false,
    dims: {
      height: 0.5,
      width: 1
    },
    defaultColor: 'byDataColor',
    showLabelsByDefault: true
  };

  return [
    {...basicSetup, data: transposeMatrix(data), dims: transposeDims},
    {...basicSetup, data, dims: regularDims}
  ];
}

/**
 * Creates all of the elemental examples
 */
export function buildElementExamples() {
  return require('../examples/large-examples/element-examples')
    .ELEMENT_TABLES.map(key => {
      return {
        data: require('../examples/large-examples/element-examples')[key],
        stepSize: 10,
        computeMode: 'iterative',
        accessor: cell => cell.value,
        getLabel: cell => cell.data.symbol,
        showAxisLabels: false,
        dims: {
          height: 0.5,
          width: 1
        }
      };
    });
}

export function buildSenateExample() {
  return {
    data: transposeMatrix(require('../examples/large-examples/senate').SENATORS),
    stepSize: 10,
    computeMode: 'iterative',
    accessor: d => d.yearsInOffice,
    dims: {
      height: 0.5,
      width: 1
    },
    getLabel: cell => {
      const names = cell.data.name.split(' ');
      return `${names[names.length - 1]} ${cell.data.yearsInOffice - 1}`;
    },
    // getSubLabel: cell => {
    //   return `${cell.data.yearsInOffice - 1}`;
    // },
    defaultColor: 'byDataColor'
  };
}

export function zionFigure() {
  const zionDomain = require('../examples/large-examples/zion-slice').ZION_VISITORS_WITH_ANNOTATION_DOMAIN;
  return {
    data: require('../examples/large-examples/zion-slice').ZION_VISITORS_WITH_ANNOTATION.map(row => {
      return row.map(d => ({
        ...d,
        color: interpolateRdBu(1 - ((d.value - zionDomain.min) / (zionDomain.max - zionDomain.min))),
        value: 1,
        printVal: `${Math.floor(d.value / 1000)}k`
      }));
    }),
    stepSize: 10,
    computeMode: 'iterative',
    accessor: d => Number(d.value),
    defaultColor: 'byDataColor',
    dims: {
      height: 0.6,
      width: 1
    },
    xLabels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    yLabels: [...new Array(10)].map((_, idx) => `${2016 - idx}`),
    showAxisLabels: true,
    getLabel: d => d.data.printVal
  };
}

export function chicagoArrests() {
  return {
    data: require('../examples/large-examples/chicago-arrests').CHICAGO_ARRESTS,
    stepSize: 10,
    computeMode: 'iterative',
    showAxisLabels: true,
    getLabel: d => `${Math.round(d.data.count / 1000)}k`,
    xLabels: ['NO ARREST', 'ARREST MADE'],
    yLabels: [...new Array(4)].map(_ => ['OTHER', 'DOMESTIC']).reduce((a, b) => a.concat(b), []),
    accessor: d => d.count,
    computeAnnotationBoxBy: d => d.data.zone,
    defaultColor: 'valueHeatReds',
    // defaultColor: 'byDataColor'
    optimizationParams: {
      stepSize: 0.01
    }
  };
}

export function birdStrikes() {
  return {
    data: require('../examples/large-examples/bird-strikes').BIRD_STRIKES,
    stepSize: 10,
    computeMode: 'iterative',
    accessor: d => d.size,
    dims: {
      height: 0.3,
      width: 1
    },
    computeAnnotationBoxBy: d => d.data.name
  };
}

/**
 * Generates a polygram of the gdp of usa/china/europe
 */
export function gdpVsCountry() {
  const data = require('../examples/large-examples/gdp-vs-country').NESTED_POPS;
  return {
    data,
    stepSize: 10,
    computeMode: 'iterative',
    accessor: d => d.GDP / d.pop,
    dims: {
      height: 0.5,
      width: 2
    },
    optimizationParams: {
      useAnalytic: true,
      nonDeterministic: true
    }
  };
}

export function usaWithLabels() {
  return {
    data: EXAMPLES.USA_USA_USA_LABELS,
    stepSize: 10,
    computeMode: 'iterative',
    accessor: d => d[1]
  };
}

export function dndAlignments() {
  return {
    data: EXAMPLES.DND_ALIGNMENTS,
    stepSize: 10,
    computeMode: 'iterative',
    accessor: d => d.percent,
    xLabels: ['Lawful', 'Neutral', 'Chaotic'],
    yLabels: ['Good', 'Neutral', 'Evil'],
    showAxisLabels: true,
    getLabel: d => `${d.data.percent}%`,
    dims: {
      height: 0.26,
      width: 1
    }
  };
}

export function systemsTiming() {
  return {
    data: EXAMPLES.SYSTEMS_TIMING.map(row => row.filter((d, i) => (i % 2))),
    stepSize: 5,
    computeMode: 'iterative',
    accessor: d => 166 / d.val,
    // accessor: d => d.val / (152 * 10),
    // xLabels: ['Training', 'Inference', 'Training', 'Inference'],
    xLabels: ['Plaid', 'Tensorflow'],
    yLabels: ['GOOG CPU', 'GOOG GPU', 'SCHOOL CPU', 'GOOG CPU', 'GOOG GPU', 'SCHOOL CPU'],
    showAxisLabels: true,
    getLabel: d => `${Math.floor(166 / d.data.val * 1000) / 1000}`,
    // getLabel: d => `${Math.floor(d.data.val / (152 * 10) * 1000) / 1000}`,
    dims: {
      height: 1,
      width: 1
    }
  };
}

/**
 * Likert study for an unrelated work
 */
export function ahnbSurveyResults() {
  const labels = ['STRONGLY DISAGREE', 'DISAGREE', 'NEUTRAL', 'AGREE', 'STRONGLY AGREE'];
  return {
    data: EXAMPLES.AHNB_SURVEY_RESULTS,
    stepSize: 5,
    computeMode: 'iterative',
    accessor: d => d,
    xLabels: ['P1', 'P2', 'P3'],
    yLabels: ['Q1', 'Q3', 'Q5', 'Q7', 'Q9', 'Q2', 'Q4', 'Q6', 'Q8', 'Q10'],
    showAxisLabels: true,
    getLabel: d => labels[d.data - 1],
    // getLabel: d => `${Math.floor(d.data.val / (152 * 10) * 1000) / 1000}`,
    dims: {
      height: 1,
      width: 3
    },
    showBorder: false
  };
}

export function confusiongram() {
  return {
    // data: EXAMPLES.WIKI_CONFUSION_GRAM_PERFECT_CLASSIFIER,
    // data: EXAMPLES.WIKI_CONFUSION_GRAM_OK_CLASSIFIER,
    data: EXAMPLES.WIKI_CONFUSION_GRAM_BAD_CLASSIFIER,
    stepSize: 5,
    computeMode: 'iterative',
    accessor: d => d.size,
    xLabels: ['Cat', 'Dog', 'Rabbit'],
    yLabels: ['Cat', 'Dog', 'Rabbit'],
    showAxisLabels: true,
    getLabel: d => d.data.show,
    // getLabel: d => `${Math.floor(d.data.val / (152 * 10) * 1000) / 1000}`,
    dims: {
      height: 1,
      width: 1
    },
    defaultColor: 'confusiongramHardCode',
    showBorder: false
  };
}

export function stateToStateFullNetwork() {
  // sort by row weight
  // all states
  const data = require('../examples/large-examples/state-migration-network').originalMigrationStuff;
  const sortOrder = data.map(row => {
    return {
      state: row['State of residence'],
      sum: Object.values(row).reduce((acc, v) => (typeof v === 'number' ? v : 0) + acc, 0)
      // sum: row.
    };
  }).sort((a, b) => a.sum - b.sum);
  const sortMap = sortOrder.reduce((acc, {state}, idx) => {
    acc[state] = idx;
    return acc;
  }, {});
  const finalData = data.sort((a, b) => sortMap[a.state] - sortMap[b.state]).map(row => {
    return Object.entries(row)
      .filter(d => d[0] !== 'State of residence')
      .sort((a, b) => sortMap[a[0]] - sortMap[b[0]])
      .map(d => d[1]);
  });
  return {
    data: finalData.map(row => row.map(d => d + 1)),
    stepSize: 5,
    computeMode: 'iterative',
    optimizationParams: {
      useAnalytic: true,
      nonDeterministic: true
    }
  };
}
export function regionToRegion() {
  const migration = require('../examples/large-examples/state-migration-network');
  const {MIGRATION_REGION_TO_REGION, namedRegions} = migration;
  return {
    data: MIGRATION_REGION_TO_REGION.map(row => {
      return row.map(d => ({
        ...d,
        color: interpolateGreens(1 - Math.sqrt(1 - (d.value - 63) / (40165 - 63))),
        // value: 1,
        printVal: `${Math.floor(d.value / 100) / 10}k`
      }));
    }),
    stepSize: 5,
    computeMode: 'iterative',
    accessor: d => d.value,
    xLabels: namedRegions,
    yLabels: namedRegions,
    showAxisLabels: true,
    getLabel: d => d.data.printVal,
    showBorder: false,
    defaultColor: 'byDataColor'
  };
}

/**
 * Generate a 10x10 multiplication table, with squares boxed
 */
export function multiplicationTable() {
  return {
    data: EXAMPLES.MULTIPLICATION_TABLE,
    stepSize: 5,
    computeMode: 'iterative',
    getLabel: d => d.value,
    xLabels: [...new Array(10)].map((_, i) => i + 1),
    yLabels: [...new Array(10)].map((_, i) => i + 1),
    showAxisLabels: true,
    computeAnnotationBoxBy: d => {
      const sqrt = Math.sqrt(d.value);
      return Math.floor(sqrt) === sqrt ? `${d.value}${Math.random()}` : 'ignore';
    }
  };
}