import ReactDOM from 'react-dom';
import React from 'react';

import AlphaTableBuilder from './components/alpha-table-builder';
import EXAMPLES from '../examples/examples';
import IterativeDisplay from './components/iterative-display';
import ContinuousLegend from './components/legend';
// import CalendarDisplay from './components/calendar-example';
// import HourCalendar from './components/hour-calendar';
// import CartogramPlot from './components/table-cartogram';
// import ZionExperiment from './components/zion-experiment';
// import ZionSpiral from './components/zion-spiral';
import PivotogramAlts from './components/pivotogram-alts';
// import Map from './components/map';
// import SankeyRegionRegion from './components/sankey-region-region';

import {
  // createElementTableWithTranspose,
  // stateToStateFullNetwork,
  // chicagoArrests,
  // confusiongram,
  // friendlyMosaicAlike2,
  AlongTheLakeExample,
  AlongTheLakeExampleMargins
} from './figure-setups';

function App() {
  const tables = [
    // chicagoArrests()
    // ...createElementTableWithTranspose()
    // {data: EXAMPLES.USA_USA_USA, stepSize: 5, computeMode: 'iterative'},
    // ...confusiongram()
    AlongTheLakeExample(),
    // ...AlongTheLakeExampleMargins()
  ]
  .map((config, idx) => (
    <IterativeDisplay
      iterations={400}
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
            // tables
          }
        </div>
        {
          // <HourCalendar data={require('../examples/large-examples/ohare-temp-data.json')}/>
        }
        {
          <PivotogramAlts/>
        }
      </div>
    </div>
  );
}

const el = document.createElement('div');
document.body.appendChild(el);

ReactDOM.render(React.createElement(App), el);
