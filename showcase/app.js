import ReactDOM from 'react-dom';
import React from 'react';

// import FLAT_DATA from '../test/tenByten.json';
// import HUNDRED_BY_HUNDRED from '../test/tenByten.json';
// import COMPLETED_RUN_DATA from '../scripts/hundred-run-data-1010.json';

import EXAMPLES from '../examples/examples';
import IterativeDisplay from './components/iterative-display';
// import CalendarDisplay from './components/calendar-example';
// import HourCalendar from './components/hour-calendar';
// import CartogramPlot from './components/table-cartogram';
// import ZionExperiment from './components/zion-experiment';
// import Sunburst from './components/arrests-sunburst';

function App() {
  const tables = [
    // ...require('../examples/large-examples/element-examples')
    //   .ELEMENT_TABLES.map(key => {
    //     return {
    //       data: require('../examples/large-examples/element-examples')[key],
    //       technique: 'coordinate',
    //       stepSize: 10,
    //       computeMode: 'iterative',
    //       accessor: cell => cell.value,
    //       getLabel: cell => cell.data.symbol,
    //       showAxisLabels: true,
    //       dims: {
    //         height: 0.3,
    //         width: 1
    //       }
    //     };
    //   })
    // {
    //   data: require('../examples/large-examples/senate').SENATORS,
    //   technique: 'coordinate',
    //   stepSize: 10,
    //   computeMode: 'iterative',
    //   accessor: d => d.yearsInOffice,
    //   dims: {
    //     height: 0.3,
    //     width: 1
    //   }
    // },

    // {
    //   data: require('../examples/large-examples/chicago-arrests').CHICAGO_ARRESTS,
    //   technique: 'coordinate',
    //   stepSize: 10,
    //   computeMode: 'iterative',
    //   showAxisLabels: true,
    //   getLabel: d => `${Math.round(d.data.count / 1000)}k`,
    //   xLabels: ['NO ARREST', 'ARREST MADE'],
    //   yLabels: ['OTHER', 'DOMESTIC', 'OTHER', 'DOMESTIC', 'OTHER', 'DOMESTIC'],
    //   accessor: d => d.count,
    //   computeAnnotationBoxBy: d => d.data.zone
    //   // dims: {
    //   //   height: 0.3,
    //   //   width: 1
    //   // }
    // },

    // {
    //   data: require('../examples/large-examples/bird-strikes').BIRD_STRIKES,
    //   technique: 'coordinate',
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
    //   technique: 'coordinate',
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
    //   technique: 'newtonStep',
    //   stepSize: 10,
    //   computeMode: 'iterative',
    //   accessor: d => d[1]
    // },
    // {
    //   data: EXAMPLES.DND_ALIGNMENTS,
    //   technique: 'coordinate',
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
    //   technique: 'coordinate',
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
    //   technique: 'coordinate',
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
    {
      data: require('../examples/large-examples/state-migration-network').MIGRATION_REGION_TO_REGION,
      technique: 'coordinate',
      stepSize: 5,
      computeMode: 'iterative',
      accessor: d => d.value,
      xLabels: require('../examples/large-examples/state-migration-network').namedRegions,
      yLabels: require('../examples/large-examples/state-migration-network').namedRegions,
      showAxisLabels: true,
      // getLabel: d => d.value,
      getLabel: d => `${Math.round(d.value / 100)/10}k`,
      // dims: {
      //   height: 1,
      //   width: 3
      // },
      showBorder: false
    },
    // {data: EXAMPLES.SYSTEMS_TIMING, technique: 'coordinate', stepSize: 5, computeMode: 'iterative'},
    // {data: EXAMPLES.POWER_2, technique: 'coordinate', stepSize: 5, computeMode: 'iterative'},
    // {data: EXAMPLES.HAND_SYMMETRIC_OLD, technique: 'coordinate', stepSize: 5, computeMode: 'iterative'}
    // {
    //   data: EXAMPLES.MULTIPLICATION_TABLE,
    //   technique: 'coordinate',
    //   stepSize: 5,
    //   computeMode: 'iterative',
    //   getLabel: d => d.value,
    //   xLabels: [...new Array(10)].map((_, i) => i + 1),
    //   yLabels: [...new Array(10)].map((_, i) => i + 1),
    //   showAxisLabels: true,
    // }
  ]
  .map((config, idx) => (
    <IterativeDisplay
      iterations={400}
      layout={'pickBest'}
      {...config}
      key={`${config.technique}-${idx}`}/>
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
          // <Sunburst />
        }
      </div>
    </div>
  );
}

const el = document.createElement('div');
document.body.appendChild(el);

ReactDOM.render(React.createElement(App), el);
