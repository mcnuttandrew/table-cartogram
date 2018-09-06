import ReactDOM from 'react-dom';
import React from 'react';

import {TapReactBrowser} from 'tap-react-browser';
import {
  translateVectorToTabletranslateTableToVector,
  findSumForTableTest,
  // buildIterativeCartogramTest
} from '../test/iterative-tests';
//
// import GenericTable from './components/generic-test-table';
import EXAMPLES from './examples';
import IterativeDisplay from './components/iterative-display';

function App() {
  const tables = [
    // {data: EXAMPLES.BLACK_AND_WHITE_TABLE, technique: 'gradient'},
    // {data: EXAMPLES.ONE_BYS, technique: 'gradient'}
    {data: EXAMPLES.USA_USA_USA, technique: 'monteCarlo'},
  ].map(config => (
    <IterativeDisplay
      {...config}
      iterations={0}
      withUpdate={true}
      key={config.technique}/>
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
            findSumForTableTest,
            // buildIterativeCartogramTest
          ]}/>}
        <div style={{display: 'flex'}}>
          {tables}
        </div>
      </div>
    </div>
  );
}

const el = document.createElement('div');
document.body.appendChild(el);

ReactDOM.render(React.createElement(App), el);
