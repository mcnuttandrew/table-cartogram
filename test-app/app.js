import ReactDOM from 'react-dom';
import React from 'react';

import OHARE_TEMP_DATA from '../test/ohare-temp-data.json';
// import FLAT_DATA from '../test/tenByten.json';
// import COMPLETED_RUN_DATA from '../scripts/hundred-run-data-1010.json';
import ZION_RUN from '../scripts/zion-run.json';
import {transposeMatrix} from '../iterative-methods/utils';
import {TapReactBrowser} from 'tap-react-browser';
import {
  translateVectorToTabletranslateTableToVector,
  // findSumForTableTest,
  // buildIterativeCartogramTest,
  testTreeMapForError
} from '../test/iterative-tests';

import GenericTable from './components/generic-test-table';
import EXAMPLES, {BIRD_STRIKES, stateMigration} from './examples';
import IterativeDisplay from './components/iterative-display';
import ExampleTreemap from './components/treemap-example-generator';
import ExampleHeatmap from './components/heatmap-example';
import CalendarDisplay from './components/calendar-example';
import HourCalendar from './components/hour-calendar';
import CartogramPlot from './components/table-cartogram';
import ObjectiveFunctionVisualization from './components/objective-function-visualization';
import ContinuousLegend from './components/continuous-legend';

const scaleMatrix = (matrix, factor = 1) => matrix.map(row => row.map(cell => cell * factor));

function App() {
  const tables = [
    // {
    //   data: BIRD_STRIKES,
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
    //   data: EXAMPLES.USA_USA_USA_LABELS,
    //   technique: 'newtonStep',
    //   stepSize: 10,
    //   computeMode: 'iterative',
    //   accessor: d => d[1]
    // },

    {data: EXAMPLES.CHECKER_BOARD, technique: 'coordinate', stepSize: 5, computeMode: 'iterative'},
    // {data: scaleMatrix(EXAMPLES.PATHOLOGICAL_2_BY), technique: 'newtonStep', stepSize: 5, computeMode: 'iterative'},
    // {data: [[1, 1], [1, 1]], technique: 'newtonStep', stepSize: 5, computeMode: 'iterative'},
    // {data: stateMigration.slice(0, 10).map(row => row.slice(0, 10)), technique: 'newtonStep', stepSize: 10, computeMode: 'iterative'},
    // {data: EXAMPLES.USA_USA_USA, technique: 'newtonStep', stepSize: 10, computeMode: 'direct'},
    // {
    //   data: EXAMPLES.BLACK_AND_WHITE_TABLE,
    //   technique: 'newtonStep',
    //   stepSize: 10,
    //   computeMode: 'iterative',
    //   dims: {
    //     height: 0.75,
    //     width: 0.75
    //   }
    // },
    // {data: transposeMatrix(EXAMPLES.BLACK_AND_WHITE_TABLE), technique: 'newtonStep', stepSize: 10, computeMode: 'iterative'},
  ].map((config, idx) => (
    <IterativeDisplay
      {...config}
      iterations={400}
      layout={'pickBest'}
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
            translateVectorToTabletranslateTableToVector,
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
          // <HourCalendar data={OHARE_TEMP_DATA}/>
        }
        {
          // <HourCalendar data={OHARE_TEMP_DATA} celius/>
        }
      </div>
    </div>
  );
}

const el = document.createElement('div');
document.body.appendChild(el);

ReactDOM.render(React.createElement(App), el);
