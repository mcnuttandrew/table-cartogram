import ReactDOM from 'react-dom';
import React from 'react';

import AlphaTableBuilder from './components/alpha-table-builder';
import EXAMPLES from '../examples/examples';
import IterativeDisplay from './components/iterative-display';
import Legend from './components/legend';
import CalendarDisplay from './components/calendar-example';
import HourCalendar from './components/hour-calendar';
// import CartogramPlot from './components/table-cartogram';
// import ZionExperiment from './components/zion-experiment';
// import ZionSpiral from './components/zion-spiral';
import PivotogramAlts from './components/pivotogram-alts';
// import Map from './components/map';
import SankeyRegionRegion from './components/sankey-region-region';

import {
  // createElementTableWithTranspose,
  // stateToStateFullNetwork,
  // chicagoArrests,
  // confusiongram,
  // friendlyMosaicAlike2,
  AlongTheLakeExample,
  // AlongTheLakeExampleMargins,
  AlongTheLakeExampleJuicing
  // regionToRegion
  // buildSenateExample
} from './figure-setups';

function App() {
  const tables = [
    // ...[
    //   // 'zigZagOnXY',
    //   'psuedoCartogramLayout',
    //   // 'gridLayout'
    // ].map(layout => {
    //   return {
    //     data: EXAMPLES.EXAMPLE_TABLE,
    //     stepSize: 5,
    //     computeMode: 'iterative',
    //     dims: {
    //       height: 0.43434343434,
    //       width: 1
    //     },
    //     optimizationParams: {
    //       useGreedy: false,
    //       nonDeterministic: true
    //       // useAnalytic: true
    //     },
    //     defaultColor: 'none',
    //     getLabel: d => d.value,
    //     showLabelsByDefault: true,
    //     layout
    //   };
    // })
    {
      data: EXAMPLES.CHECKER_BOARD,
      computeMode: 'direct',
      stepSize: 5,
      layout: 'pickBest',
      defaultColor: 'byValue',
      getLabel: d => d.value,
    },
    {
      data: EXAMPLES.CHECKER_BOARD,
      computeMode: 'direct',
      stepSize: 5,
      layout: 'pickWorst',
      defaultColor: 'byValue',
      getLabel: d => d.value,
    }
    // AlongTheLakeExampleJuicing()
    // AlongTheLakeExample(),
    // ...AlongTheLakeExampleMargins()
  ]
  .map((config, idx) => (
    <IterativeDisplay
      iterations={0}
      layout={'gridLayout'}
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
        {
          // <HourCalendar celius={true} data={require('../examples/large-examples/ohare-temp-data.json')}/>
        }
        {
          // <PivotogramAlts/>
        }
      </div>
    </div>
  );
}

const el = document.createElement('div');
document.body.appendChild(el);

ReactDOM.render(React.createElement(App), el);
