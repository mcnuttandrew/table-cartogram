import ReactDOM from 'react-dom';
import React from 'react';

// import FLAT_DATA from '../test/tenByten.json';
// import HUNDRED_BY_HUNDRED from '../test/tenByten.json';
// import COMPLETED_RUN_DATA from '../scripts/hundred-run-data-1010.json';
import {TapReactBrowser} from 'tap-react-browser';
import {
  translateVectorToTabletranslateTableToVector,
  // findSumForTableTest,
  // buildIterativeCartogramTest,
  testTreeMapForError
} from '../test/iterative-tests';

import EXAMPLES from '../examples/examples';
import IterativeDisplay from './components/iterative-display';
import CalendarDisplay from './components/calendar-example';
import HourCalendar from './components/hour-calendar';
import CartogramPlot from './components/table-cartogram';

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
    //   data: require('../examples/large-examples/bird-strikes').BIRD_STRIKES,
    //   technique: 'coordinate',
    //   stepSize: 10,
    //   computeMode: 'iterative',
    //   accessor: d => d.size,
    //   dims: {
    //     height: 0.3,
    //     width: 1
    //   }
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
    //   getLabel: d => `${d.data.percent}%`
    // },

    {data: EXAMPLES.HAND_SYMMETRIC_OLD, technique: 'coordinate', stepSize: 5, computeMode: 'iterative'},
    // {data: EXAMPLES.POWER_2, technique: 'coordinate', stepSize: 5, computeMode: 'iterative'},
    // {data: EXAMPLES.POWER_3, technique: 'coordinate', stepSize: 5, computeMode: 'iterative'}
  ]
  .map((config, idx) => (
    <IterativeDisplay
      {...config}
      iterations={400}
      layout={'gridLayout'}
      key={`${config.technique}-${idx}`}/>
  ));
  const SHOW_TESTS = false;
  return (
    <div>
      <h1>TABLE CARTOGRAM VISUAL TEST SUITE</h1>
      <div>
        {SHOW_TESTS && <TapReactBrowser
          runAsPromises
          tests={[
            // translateVectorToTabletranslateTableToVector,
            // findSumForTableTest,
            // buildIterativeCartogramTest,
            // testTreeMapForError
          ]}/>}
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
          // <CartogramPlot data={ZION_RUN.gons} fillMode="valueHeat"/>
        }
        {
          // <ObjectiveFunctionVisualization />
        }
        {
          // <HourCalendar data={require('../examples/large-examples/ohare-temp-data.json')}/>
        }
      </div>
    </div>
  );
}

const el = document.createElement('div');
document.body.appendChild(el);

ReactDOM.render(React.createElement(App), el);
