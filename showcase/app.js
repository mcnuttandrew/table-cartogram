import ReactDOM from 'react-dom';
import React from 'react';

// import {
//   interpolateRdBu,
//   interpolateGreens
// } from 'd3-scale-chromatic';


// import FLAT_DATA from '../test/tenByten.json';
// import HUNDRED_BY_HUNDRED from '../test/tenByten.json';
// import COMPLETED_RUN_DATA from '../scripts/hundred-run-data-1010.json';
import AlphaTableBuilder from './components/alpha-table-builder';
import EXAMPLES from '../examples/examples';
import IterativeDisplay from './components/iterative-display';
import ContinuousLegend from './components/continuous-legend';
// import CalendarDisplay from './components/calendar-example';
// import HourCalendar from './components/hour-calendar';
// import CartogramPlot from './components/table-cartogram';
// import ZionExperiment from './components/zion-experiment';
// import ZionSpiral from './components/zion-spiral';
import PivotogramAlts from './components/pivotogram-alts';
// import SankeyRegionRegion from './components/sankey-region-region';

// const zionDomain = require('../examples/large-examples/zion-slice').ZION_VISITORS_WITH_ANNOTATION_DOMAIN;
function App() {
  const tables = [
    // ...require('../examples/large-examples/element-examples')
    //   .ELEMENT_TABLES.map(key => {
    //     return {
    //       data: require('../examples/large-examples/element-examples')[key],
    //       stepSize: 10,
    //       computeMode: 'iterative',
    //       accessor: cell => cell.value,
    //       getLabel: cell => cell.data.symbol,
    //       showAxisLabels: false,
    //       dims: {
    //         height: 0.5,
    //         width: 1
    //       }
    //     };
    //   })
    // {
    //   data: require('../examples/large-examples/senate').SENATORS,
    //   stepSize: 10,
    //   computeMode: 'iterative',
    //   accessor: d => d.yearsInOffice,
    //   dims: {
    //     height: 0.3,
    //     width: 1
    //   }
    // },
    // {
    //   data: require('../examples/large-examples/zion-slice').ZION_VISITORS_WITH_ANNOTATION.map(row => {
    //     return row.map(d => ({
    //       ...d,
    //       color: interpolateRdBu(1 - ((d.value - zionDomain.min) / (zionDomain.max - zionDomain.min))),
    //       value: 1,
    //       printVal: `${Math.floor(d.value / 1000)}k`
    //     }))
    //   }),
    //   stepSize: 10,
    //   computeMode: 'iterative',
    //   accessor: d => Number(d.value),
    //   defaultColor: 'byDataColor',
    //   dims: {
    //     height: 0.6,
    //     width: 1
    //   },
    //   xLabels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    //   yLabels: [...new Array(10)].map((_, idx) => `${2016 - idx}`),
    //   showAxisLabels: true,
    //   getLabel: d => d.data.printVal,
    // },

    // {
    //   data: require('../examples/large-examples/chicago-arrests').CHICAGO_ARRESTS,
    //   stepSize: 10,
    //   computeMode: 'iterative',
    //   showAxisLabels: true,
    //   getLabel: d => `${Math.round(d.data.count / 1000)}k`,
    //   xLabels: ['NO ARREST', 'ARREST MADE'],
    //   yLabels: [...new Array(4)].map(_ => ['OTHER', 'DOMESTIC']).reduce((a, b) => a.concat(b), []),
    //   accessor: d => d.count,
    //   computeAnnotationBoxBy: d => d.data.zone,
    //   defaultColor: 'valueHeatReds'
    //   // defaultColor: 'byDataColor'
    // },

    // {
    //   data: require('../examples/large-examples/bird-strikes').BIRD_STRIKES,
    //   stepSize: 10,
    //   computeMode: 'iterative',
    //   accessor: d => d.size,
    //   dims: {
    //     height: 0.3,
    //     width: 1
    //   },
    //   computeAnnotationBoxBy: d => d.data.name
    // },
    // {
    //   data: require('../examples/large-examples/gdp-vs-country').NESTED_POPS,
    //   stepSize: 10,
    //   computeMode: 'iterative',
    //   accessor: d => d.GDP / d.pop,
    //   dims: {
    //     height: 0.5,
    //     width: 2
    //   }
    // },
    // {
    //   data: EXAMPLES.USA_USA_USA_LABELS,
    //   stepSize: 10,
    //   computeMode: 'iterative',
    //   accessor: d => d[1]
    // },
    // {
    //   data: EXAMPLES.DND_ALIGNMENTS,
    //   stepSize: 10,
    //   computeMode: 'iterative',
    //   accessor: d => d.percent,
    //   xLabels: ['Lawful', 'Neutral', 'Chaotic'],
    //   yLabels: ['Good', 'Neutral', 'Evil'],
    //   showAxisLabels: true,
    //   getLabel: d => `${d.data.percent}%`,
    //   dims: {
    //     height: 0.26,
    //     width: 1
    //   }
    // },

    // {
    //   data: EXAMPLES.SYSTEMS_TIMING.map(row => row.filter((d, i) => (i % 2))),
    //   stepSize: 5,
    //   computeMode: 'iterative',
    //   accessor: d => 166 / d.val,
    //   // accessor: d => d.val / (152 * 10),
    //   // xLabels: ['Training', 'Inference', 'Training', 'Inference'],
    //   xLabels: ['Plaid', 'Tensorflow'],
    //   yLabels: ['GOOG CPU', 'GOOG GPU', 'SCHOOL CPU', 'GOOG CPU', 'GOOG GPU', 'SCHOOL CPU'],
    //   showAxisLabels: true,
    //   getLabel: d => `${Math.floor(166 / d.data.val * 1000) / 1000}`,
    //   // getLabel: d => `${Math.floor(d.data.val / (152 * 10) * 1000) / 1000}`,
    //   dims: {
    //     height: 1,
    //     width: 1
    //   }
    // },
    // {
    //   data: EXAMPLES.AHNB_SURVEY_RESULTS,
    //   stepSize: 5,
    //   computeMode: 'iterative',
    //   accessor: d => d,
    //   xLabels: ['P1', 'P2', 'P3'],
    //   yLabels: ['Q1', 'Q3', 'Q5', 'Q7', 'Q9', 'Q2', 'Q4', 'Q6', 'Q8', 'Q10'],
    //   showAxisLabels: true,
    //   getLabel: d => {
    //     console.log(d)
    //     const labels = ['STRONGLY DISAGREE', 'DISAGREE', 'NEUTRAL', 'AGREE', 'STRONGLY AGREE'];
    //     return labels[d.data - 1];
    //   },
    //   // getLabel: d => `${Math.floor(d.data.val / (152 * 10) * 1000) / 1000}`,
    //   dims: {
    //     height: 1,
    //     width: 3
    //   },
    //   showBorder: false
    // },
    // {
    //   data: require('../examples/large-examples/state-migration-network').MIGRATION_REGION_TO_REGION.map(row => {
    //     return row.map(d => ({
    //       ...d,
    //       color: interpolateGreens(1 - Math.sqrt(1 - (d.value - 63) / (40165 - 63))),
    //       // value: 1,
    //       printVal: `${Math.floor(d.value / 100) / 10}k`
    //     }))
    //   }),
    //   stepSize: 5,
    //   computeMode: 'iterative',
    //   accessor: d => d.value,
    //   xLabels: require('../examples/large-examples/state-migration-network').namedRegions,
    //   yLabels: require('../examples/large-examples/state-migration-network').namedRegions,
    //   showAxisLabels: true,
    //   getLabel: d => d.data.printVal,
    //   showBorder: false,
    //   defaultColor: 'byDataColor'
    // },
    // {
    //   // data: EXAMPLES.WIKI_CONFUSION_GRAM_PERFECT_CLASSIFIER,
    //   // data: EXAMPLES.WIKI_CONFUSION_GRAM_OK_CLASSIFIER,
    //   data: EXAMPLES.WIKI_CONFUSION_GRAM_BAD_CLASSIFIER,
    //   stepSize: 5,
    //   computeMode: 'iterative',
    //   accessor: d => d.size,
    //   xLabels: ['Cat', 'Dog', 'Rabbit'],
    //   yLabels: ['Cat', 'Dog', 'Rabbit'],
    //   showAxisLabels: true,
    //   getLabel: d => d.data.show,
    //   // getLabel: d => `${Math.floor(d.data.val / (152 * 10) * 1000) / 1000}`,
    //   dims: {
    //     height: 1,
    //     width: 1
    //   },
    //   defaultColor: 'confusiongramHardCode',
    //   showBorder: false
    // },
    // {data: EXAMPLES.SYSTEMS_TIMING, stepSize: 5, computeMode: 'iterative'},
    // {data: EXAMPLES.WIKI_CONFUSION_GRAM, stepSize: 10, computeMode: 'adaptive'},
    {data: EXAMPLES.TEST_TABLE, stepSize: 5, computeMode: 'iterative'},
    // {
    //   data: require('../examples/large-examples/state-migration-network').stateMigration
    //     .map(row => row.map(d => d + 1)),
    //   stepSize: 5, computeMode: 'iterative'
    //  }
    // {
    //   data: EXAMPLES.MULTIPLICATION_TABLE,
    //   stepSize: 5,
    //   computeMode: 'iterative',
    //   getLabel: d => d.value,
    //   xLabels: [...new Array(10)].map((_, i) => i + 1),
    //   yLabels: [...new Array(10)].map((_, i) => i + 1),
    //   showAxisLabels: true,
    //   computeAnnotationBoxBy: d => {
    //     const sqrt = Math.sqrt(d.value);
    //     return Math.floor(sqrt) === sqrt ? `${d.value}${Math.random()}` : 'ignore';
    //   }
    // }
  ]
  .map((config, idx) => (
    <IterativeDisplay
      iterations={400}
      layout={'pickBest'}
      {...config}
      key={`table-${idx}`}/>
  ));
  return (
    <div>
      <h1>TABLE CARTOGRAM SHOWCASE</h1>
      <div>
        <div style={{display: 'flex', flexWrap: 'wrap'}}>
          {
            tables
          }
        </div>
        <div>
          {
            // <GenericTable data={EXAMPLES.EXAMPLE_TABLE}/>
          }
        </div>
        {
          // <ExampleHeatmap data={EXAMPLES.EXAMPLE_TABLE} />
          // <CalendarDisplay />
        }
        {
          // <ObjectiveFunctionVisualization />
        }
        {
          // <HourCalendar data={require('../examples/large-examples/ohare-temp-data.json')}/>
        }
        {
          // <ZionExperiment />
        }
        {
          // <PivotogramAlts />
        }
        {
          // <ContinuousLegend />
        }
        {
          // <AlphaTableBuilder/>
        }
      </div>
    </div>
  );
}

const el = document.createElement('div');
document.body.appendChild(el);

ReactDOM.render(React.createElement(App), el);
