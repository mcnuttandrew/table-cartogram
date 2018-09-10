import ReactDOM from 'react-dom';
import React from 'react';
import {Treemap} from 'react-vis';
import {RV_COLORS} from './colors';

import {TapReactBrowser} from 'tap-react-browser';
import {
  // translateVectorToTabletranslateTableToVector,
  // findSumForTableTest,
  // buildIterativeCartogramTest,
  testTreeMapForError
} from '../test/iterative-tests';
//
import GenericTable from './components/generic-test-table';
import EXAMPLES from './examples';
import IterativeDisplay from './components/iterative-display';
import ExampleTreemap from './components/treemap-example-generator';
import ExampleHeatmap from './components/heatmap-example';

function App() {
  const tables = [
    // {data: EXAMPLES.BLACK_AND_WHITE_TABLE, technique: 'gradient'},
    // {data: EXAMPLES.ONE_BYS, technique: 'gradient'}
    // {data: EXAMPLES.PATHOLOGICAL_2_BY, technique: 'gradient', stepSize: 100},
    // {data: EXAMPLES.EXAMPLE_TABLE, technique: 'gradient', stepSize: 1000},
    {data: EXAMPLES.EXAMPLE_TABLE, technique: 'gradient', stepSize: 10},
  ].map((config, idx) => (
    <IterativeDisplay
      {...config}
      iterations={30000}
      withUpdate={true}
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
            testTreeMapForError
          ]}/>}
        <div style={{display: 'flex'}}>
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
          <ExampleHeatmap data={EXAMPLES.EXAMPLE_TABLE} />
        }
      </div>
    </div>
  );
}

const el = document.createElement('div');
document.body.appendChild(el);

ReactDOM.render(React.createElement(App), el);
