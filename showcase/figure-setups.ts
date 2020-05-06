/* eslint-disable @typescript-eslint/no-var-requires */
import {RV_COLORS} from './colors';
import EXAMPLES from '../examples/examples';
import {interpolateRdBu, interpolateGreens} from 'd3-scale-chromatic';
import {transposeMatrix} from '../src/utils';
import {FigureConfig, ComputeMode} from '../types';

// export function unemploymentStreamgram() {
//   const data = require('../examples/large-examples/unemployment');
//   const rows = Object.keys(data[0]).filter((d) => d !== 'date');
//   const processedData = rows.map((key, idx) => {
//     return data.map((row) => {
//       return {
//         value: Number(row[key]),
//         key,
//         color: RV_COLORS[idx % RV_COLORS.length],
//         year: row.date.slice(0, 4),
//       };
//     });
//   });
//   return {
//     data: processedData,
//     stepSize: 10,
//     computeMode: 'iterative',
//     accessor: (d) => {
//       // console.log(d)
//       return Number(d.value);
//     },
//     defaultColor: 'byDataColor',
//     layout: 'psuedoCartogramLayout',
//     dims: {
//       height: 1,
//       width: 1,
//     },
//     xLabels: data.map(({date}) => (date.endsWith('-01-01') ? date.split('-01-01')[0] : '')),
//     yLabels: rows,
//     showAxisLabels: true,
//     getLabel: (d) => d.data.printVal,
//     computeAnnotationBoxBy: (d) => d.data.year,
//     optimizationParams: {
//       // stepSize: 0.005,
//       useAnalytic: true,
//       nonDeterministic: false,
//       useGreedy: false,
//       // overlapPenalty: 20
//     },
//   };
// }
// /**
//  * Generates a pair of versions of the element example
//  * One normal, and one transpose
//  */
// export function createElementTableWithTranspose() {
//   const {ELELMENTS_DENSITY} = require('../examples/large-examples/element-examples');
//   const data = ELELMENTS_DENSITY.map((row, idx) =>
//     row.map((d, jdx) => ({
//       ...d,
//       color: RV_COLORS[(idx * row.length + jdx) % RV_COLORS.length],
//     })),
//   );

//   const regularDims = {height: 0.5, width: 1};
//   const transposeDims = {height: 1, width: 0.5};
//   const basicSetup = {
//     stepSize: 10,
//     computeMode: 'iterative',
//     accessor: (cell) => cell.value,
//     getLabel: (cell) => cell.data.symbol,
//     showAxisLabels: false,
//     dims: {
//       height: 0.5,
//       width: 1,
//     },
//     defaultColor: 'byDataColor',
//     showLabelsByDefault: true,
//   };

//   return [
//     {...basicSetup, data: transposeMatrix(data), dims: transposeDims},
//     {...basicSetup, data, dims: regularDims},
//   ];
// }

/**
 * Creates all of the elemental examples
 */
export function buildElementExamples(): FigureConfig {
  return require('../examples/large-examples/element-examples').ELEMENT_TABLES.map((key: string) => {
    return {
      data: require('../examples/large-examples/element-examples')[key],
      stepSize: 10,
      computeMode: 'iterative',
      accessor: (cell: any) => cell.value,
      getLabel: (cell: any) => cell.data.symbol,
      showAxisLabels: false,
      dims: {
        height: 0.5,
        width: 1,
      },
    };
  });
}

export function buildSenateExample(): FigureConfig {
  return {
    data: transposeMatrix(require('../examples/large-examples/senate').SENATORS),
    stepSize: 10,
    computeMode: 'iterative',
    accessor: (d): number => d.yearsInOffice,
    layout: 'pickWorst',
    dims: {
      // height: 0.5,
      height: 0.75,
      width: 1,
    },
    getLabel: (cell) => {
      const names = cell.data.name.split(' ');
      return `${names[names.length - 1]} ${cell.data.yearsInOffice - 1}`;
    },
    // getSubLabel: cell => {
    //   return `${cell.data.yearsInOffice - 1}`;
    // },
    defaultColor: 'byDataColor',
  };
}

// export function zionFigure(): FigureConfig {
//   const zionDomain = require('../examples/large-examples/zion-slice').ZION_VISITORS_WITH_ANNOTATION_DOMAIN;
//   return {
//     data: require('../examples/large-examples/zion-slice').ZION_VISITORS_WITH_ANNOTATION.map((row) => {
//       return row.map((d) => ({
//         ...d,
//         color: interpolateRdBu(1 - (d.value - zionDomain.min) / (zionDomain.max - zionDomain.min)),
//         value: d.value,
//         printVal: `${Math.floor(d.value / 1000)}k`,
//       }));
//     }),
//     stepSize: 10,
//     computeMode: 'iterative',
//     accessor: (d) => Number(d.value),
//     defaultColor: 'byDataColor',
//     layout: 'psuedoCartogramLayout',
//     dims: {
//       height: 1,
//       width: 1,
//     },
//     xLabels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
//     yLabels: [...new Array(10)].map((_, idx) => `${2016 - idx}`),
//     showAxisLabels: true,
//     getLabel: (d) => d.data.printVal,
//   };
// }

export function chicagoArrests(): FigureConfig {
  return {
    data: require('../examples/large-examples/chicago-arrests').CHICAGO_ARRESTS,
    stepSize: 10,
    computeMode: 'iterative',
    showAxisLabels: true,
    getLabel: (d) => `${Math.round(d.data.count / 1000)}k`,
    xLabels: ['NO ARREST', 'ARREST MADE'],
    yLabels: [...new Array(4)].map((_) => ['OTHER', 'DOMESTIC']).reduce((a, b) => a.concat(b), []),
    accessor: (d) => d.count,
    computeAnnotationBoxBy: (d) => d.data.zone,
    defaultColor: 'valueHeatReds',
    // defaultColor: 'byDataColor'
    layout: 'pickBest',
    optimizationParams: {
      stepSize: 0.005,
      // useAnalytic: true,
      // nonDeterministic: true,
      useGreedy: false,
      overlapPenalty: 20,
    },
  };
}

export function birdStrikes(): FigureConfig {
  return {
    data: require('../examples/large-examples/bird-strikes').BIRD_STRIKES,
    stepSize: 10,
    computeMode: 'iterative',
    accessor: (d) => d.size,
    dims: {
      height: 0.3,
      width: 1,
    },
    computeAnnotationBoxBy: (d) => d.data.name,
  };
}

/**
 * Generates a polygram of the gdp of usa/china/europe
 */
export function gdpVsCountry(): FigureConfig {
  const data = require('../examples/large-examples/gdp-vs-country').NESTED_POPS;
  return {
    data,
    stepSize: 10,
    computeMode: 'iterative',
    accessor: (d) => d.GDP / d.pop,
    dims: {
      height: 0.5,
      width: 2,
    },
    optimizationParams: {
      useAnalytic: true,
      nonDeterministic: true,
    },
  };
}

export function usaWithLabels(): FigureConfig {
  return {
    data: EXAMPLES.USA_USA_USA_LABELS,
    stepSize: 10,
    computeMode: 'iterative',
    accessor: (d) => d[1],
    getLabel: (d) => d.data[0],
    dims: {
      height: 0.75,
      width: 1,
    },
  };
}

export function dndAlignments(): FigureConfig {
  return {
    data: EXAMPLES.DND_ALIGNMENTS,
    stepSize: 10,
    computeMode: 'iterative',
    accessor: (d) => d.percent,
    xLabels: ['Lawful', 'Neutral', 'Chaotic'],
    yLabels: ['Good', 'Neutral', 'Evil'],
    showAxisLabels: true,
    getLabel: (d) => `${d.data.percent}%`,
    dims: {
      height: 0.26,
      width: 1,
    },
  };
}

export function systemsTiming(): FigureConfig {
  return {
    data: EXAMPLES.SYSTEMS_TIMING.map((row) => row.filter((d, i) => i % 2)),
    stepSize: 5,
    computeMode: 'iterative',
    accessor: (d) => 166 / d.val,
    // accessor: d => d.val / (152 * 10),
    // xLabels: ['Training', 'Inference', 'Training', 'Inference'],
    xLabels: ['Plaid', 'Tensorflow'],
    yLabels: ['GOOG CPU', 'GOOG GPU', 'SCHOOL CPU', 'GOOG CPU', 'GOOG GPU', 'SCHOOL CPU'],
    showAxisLabels: true,
    getLabel: (d) => `${Math.floor((166 / d.data.val) * 1000) / 1000}`,
    // getLabel: d => `${Math.floor(d.data.val / (152 * 10) * 1000) / 1000}`,
    dims: {
      height: 1,
      width: 1,
    },
  };
}

/**
 * Likert study for an unrelated work
 */
export function ahnbSurveyResults(): FigureConfig {
  const labels = ['STRONGLY DISAGREE', 'DISAGREE', 'NEUTRAL', 'AGREE', 'STRONGLY AGREE'];
  return {
    data: EXAMPLES.AHNB_SURVEY_RESULTS,
    stepSize: 5,
    computeMode: 'iterative',
    accessor: (d) => d,
    xLabels: ['P1', 'P2', 'P3'],
    yLabels: ['Q1', 'Q3', 'Q5', 'Q7', 'Q9', 'Q2', 'Q4', 'Q6', 'Q8', 'Q10'],
    showAxisLabels: true,
    getLabel: (d) => labels[d.data - 1],
    // getLabel: d => `${Math.floor(d.data.val / (152 * 10) * 1000) / 1000}`,
    dims: {
      height: 1,
      width: 3,
    },
    showBorder: false,
  };
}

export function confusiongram(): FigureConfig[] {
  const common = {
    // data: EXAMPLES.WIKI_CONFUSION_GRAM_PERFECT_CLASSIFIER,
    // data: EXAMPLES.WIKI_CONFUSION_GRAM_OK_CLASSIFIER,
    stepSize: 5,
    computeMode: 'iterative',
    accessor: (d: any) => d.size,
    xLabels: ['Cat', 'Dog', 'Rabbit'],
    yLabels: ['Cat', 'Dog', 'Rabbit'],
    showAxisLabels: true,
    getLabel: (d: any) => d.data.show,
    // getLabel: d => `${Math.floor(d.data.val / (152 * 10) * 1000) / 1000}`,
    dims: {
      height: 1,
      width: 1,
    },
    showLabelsByDefault: true,
    defaultColor: 'confusiongramHardCode',
    showBorder: false,
  };
  return [
    {...common, data: EXAMPLES.WIKI_CONFUSION_GRAM_PERFECT_CLASSIFIER} as FigureConfig,
    {...common, data: EXAMPLES.WIKI_CONFUSION_GRAM_OK_CLASSIFIER} as FigureConfig,
    {...common, data: EXAMPLES.WIKI_CONFUSION_GRAM_BAD_CLASSIFIER} as FigureConfig,
  ];
}

export function stateToStateFullNetwork(): FigureConfig {
  // sort by row weight
  // all states
  const data = require('../examples/large-examples/state-migration-network').originalMigrationStuff;
  const sortOrder = data
    .map((row: {[x: string]: any[]}) => {
      return {
        state: row['State of residence'],
        sum: Object.values(row).reduce((acc, v) => ((typeof v === 'number' ? v : 0) as number) + acc, 0),
        // sum: row.
      };
    })
    .sort((a: any, b: any) => a.sum - b.sum);
  const sortMap = sortOrder.reduce((acc: any, {state}: any, idx: number) => {
    acc[state] = idx;
    return acc;
  }, {});
  const finalData = data
    .sort((a: any, b: any) => sortMap[a.state] - sortMap[b.state])
    .map((row: any) => {
      return Object.entries(row)
        .filter((d) => d[0] !== 'State of residence')
        .sort((a, b) => sortMap[a[0]] - sortMap[b[0]])
        .map((d) => d[1]);
    });
  return {
    data: finalData.map((row: any) => row.map((d: number) => d + 1)),
    stepSize: 5,
    computeMode: 'iterative',
    optimizationParams: {
      useAnalytic: true,
      nonDeterministic: true,
    },
  };
}
export function regionToRegion(): FigureConfig {
  const migration = require('../examples/large-examples/state-migration-network');
  const {MIGRATION_REGION_TO_REGION, namedRegions} = migration;
  // console.log(MIGRATION_REGION_TO_REGION)
  return {
    // data: MIGRATION_REGION_TO_REGION.map(row => {
    //   return row.map(d => ({
    //     ...d,
    //     color: interpolateGreens(1 - Math.sqrt(1 - (d.value - 63) / (40165 - 63))),
    //     // value: 1,
    //     printVal: `${Math.floor(d.value / 100) / 10}k`
    //   }));
    // }),
    data: MIGRATION_REGION_TO_REGION.map((row: any[]) => row.map((cell, col) => ({...cell, col}))),
    stepSize: 5,
    computeMode: 'iterative',
    accessor: (d) => d.value,
    xLabels: namedRegions,
    yLabels: namedRegions,
    showAxisLabels: true,
    getLabel: (d) => `${Math.floor(d.value / 100) / 10}k`,
    computeAnnotationBoxBy: (d) => d.data.col,
    showBorder: false,
    defaultColor: 'valueHeatGreens',
    // defaultColor: 'byDataColor',
    layout: 'psuedoCartogramLayout',
    optimizationParams: {
      // stepSize: 0.01,
      stepSize: 0.005,
      orderPenalty: 10,
      borderPenalty: 10,
      overlapPenalty: 10,
      useGreedy: false,
      nonDeterministic: true,
      // useAnalytic: true
    },
  };
}

/**
 * Generate a 10x10 multiplication table, with squares boxed
 */
export function multiplicationTable(): FigureConfig {
  return {
    data: EXAMPLES.MULTIPLICATION_TABLE,
    stepSize: 5,
    computeMode: 'iterative',
    getLabel: (d) => d.value,
    xLabels: [...new Array(10)].map((_, i) => i + 1),
    yLabels: [...new Array(10)].map((_, i) => i + 1),
    showAxisLabels: true,
    computeAnnotationBoxBy: (d) => {
      const sqrt = Math.sqrt(d.value);
      return Math.floor(sqrt) === sqrt ? `${d.value}${Math.random()}` : 'ignore';
    },
  };
}

/**
 * Generate a pivotgram based on friendly frequnecies of hair/eye color by sex
 */
export function friendlyMosaicAlike(): FigureConfig {
  return {
    data: EXAMPLES.FRIENDLY_MOSAIC,
    stepSize: 5,
    computeMode: 'iterative',
    getLabel: (d) => d.value,
    accessor: (cell) => cell.value,
    xLabels: ['BLACK', 'BROWN', 'RED', 'BLOND'],
    yLabels: ['BLUE', 'GREEN', 'HAZEL', 'BROWN', 'BLUE', 'GREEN', 'HAZEL', 'BROWN'],
    showAxisLabels: true,
    computeAnnotationBoxBy: (d) => d.data.sex,
    showLabelsByDefault: true,
    defaultColor: 'valueHeatGreens',
  };
}

/**
 * Generate a pivotgram based on friendly frequnecies of hair/eye color by sex
 */
export function friendlyMosaicAlike2(): FigureConfig {
  return {
    data: EXAMPLES.FRIENDLY_MOSAIC_2,
    stepSize: 5,
    computeMode: 'iterative',
    getLabel: (d) => d.value,
    accessor: (cell) => cell.value,
    xLabels: ['BLACK', 'BLACK', 'BROWN', 'BROWN', 'RED', 'RED', 'BLOND', 'BLOND'],
    yLabels: ['BLUE', 'GREEN', 'HAZEL', 'BROWN'],
    showAxisLabels: true,
    computeAnnotationBoxBy: (d) => d.data.index,
    showLabelsByDefault: true,
    defaultColor: 'valueHeatGreens',
  };
}

export function AlongTheLakeExample(): FigureConfig {
  const {
    AlongTheLake,
    AlongTheLakeXLabels,
    AlongTheLakeYLabels,
  } = require('../examples/large-examples/along-the-lake');
  return {
    data: AlongTheLake.map((row: any) => row.map((d: any) => ({...d, value: Math.sqrt(d.value)}))),
    stepSize: 10,
    accessor: (d) => d.value,
    computeAnnotationBoxBy: (d) => d.data.state,
    computeMode: 'iterative',
    dims: {
      height: 0.5,
      width: 3,
    },
    layout: 'psuedoCartogramLayout',
    xLabels: AlongTheLakeXLabels,
    yLabels: AlongTheLakeYLabels,
    showAxisLabels: true,
    getLabel: ({value}) => `${Math.floor(value / 1000)}k`,
    defaultColor: 'valueHeatCool',
    optimizationParams: {
      // stepSize: 0.005,
      useAnalytic: true,
      nonDeterministic: true,
      // useGreedy: false,
      overlapPenalty: 20,
    },
  };
}

export function AlongTheLakeExampleJuicing(): FigureConfig {
  const alpha = 1.15;
  const {
    AlongTheLake,
    AlongTheLakeXLabels,
    AlongTheLakeYLabels,
  } = require('../examples/large-examples/along-the-lake');
  const sum = (row: any): number => row.reduce((acc: number, {value}: any) => acc + value, 0) / row.length;
  // const yearMargin = ([AlongTheLake.map(sum)]);
  const cityMargin = [transposeMatrix(AlongTheLake).map(sum)];
  // console.log(cityMargin)
  const data = transposeMatrix(AlongTheLake).map((row, idx) => {
    // console.log(AlongTheLake)
    const cityAvg = cityMargin[0][idx];
    // const cellDelta = (d.value - cityAvg);
    // console.log(cityAvg)
    return row.map((d) => {
      const preval = cityAvg + alpha * (d.value - cityAvg);
      const value = Math.sqrt(preval);
      return {...d, value};
    });
  });

  return {
    data: transposeMatrix(data),
    stepSize: 10,
    accessor: (d) => d.value,
    computeAnnotationBoxBy: (d) => d.data.state,
    computeMode: 'iterative',
    dims: {
      height: 0.5,
      width: 3,
    },
    layout: 'zigZagOnXY',
    xLabels: AlongTheLakeXLabels,
    yLabels: AlongTheLakeYLabels,
    showAxisLabels: true,
    getLabel: ({value}) => `${Math.floor(value / 1000)}k`,
    defaultColor: 'valueHeatCool',
    optimizationParams: {
      // stepSize: 0.005,
      useAnalytic: true,
      nonDeterministic: true,
      // useGreedy: false,
      overlapPenalty: 20,
    },
  };
}

export function AlongTheLakeExampleMargins(): FigureConfig[] {
  const {
    AlongTheLake,
    AlongTheLakeXLabels,
    AlongTheLakeYLabels,
  } = require('../examples/large-examples/along-the-lake');
  // data: AlongTheLake.map(row => row.map(d => ({...d, value: Math.sqrt(d.value)}))),
  const sum = (row: any): number => row.reduce((acc: number, {value}: any) => acc + Math.sqrt(value), 0);
  const yearMargin = [AlongTheLake.map(sum)];
  const cityMargin = [transposeMatrix(AlongTheLake).map(sum)];
  const common = {
    stepSize: 10,
    computeMode: 'iterative',
    layout: 'psuedoCartogramLayout',
    showAxisLabels: true,
    getLabel: ({value}: any) => `${Math.floor(value / 1000)}k`,
    defaultColor: 'valueHeatCool',
    optimizationParams: {
      // stepSize: 0.005,
      useAnalytic: true,
      nonDeterministic: true,
      // useGreedy: false,
      overlapPenalty: 20,
    },
  };
  const [size1, size2] = [0.3, 3];
  return [
    {
      ...common,
      data: yearMargin,
      xLabels: AlongTheLakeYLabels,
      dims: {width: size1, height: 0.5},
      // dims: {height: size1, width: size2}
    } as FigureConfig,
    {
      ...common,
      data: cityMargin,
      xLabels: AlongTheLakeXLabels,
      dims: {height: size1, width: size2},
    } as FigureConfig,
  ];
}

export function CanidateSimilarity(): FigureConfig {
  const canidates = [
    'Julian Castro',
    'Elizabeth Warren',
    'Pete Buttigieg',
    'Andrew Yang',
    'Tulsi Gabbard',
    'Amy Klobuchar',
  ];
  return {
    data: EXAMPLES.CANDIDATE_SIM,
    stepSize: 5,
    computeMode: 'iterative',
    getLabel: ({value}) => `${Math.floor(value * 100) / 100}`,
    xLabels: canidates,
    yLabels: canidates,
    defaultColor: 'valueHeatGreens',
    showLabelsByDefault: true,
    showAxisLabels: true,
  };
}
