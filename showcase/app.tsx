import ReactDOM from 'react-dom';
import React from 'react';

// import AlphaTableBuilder from './components/alpha-table-builder';
// import EXAMPLES from '../examples/examples';
import IterativeDisplay from './components/iterative-display';
import Legend from './components/legend';
import JanCalendar from './components/mod-jan-calendar';
// import CalendarDisplay from './components/calendar-example';
// import HourCalendar from './components/hour-calendar';
// import CartogramPlot from './components/table-cartogram';
// import ZionExperiment from './components/zion-experiment';
// import ZionSpiral from './components/zion-spiral';
// import PivotogramAlts from './components/pivotogram-alts';
// import PolygramAlts from './components/polygram-alts';
// import Map from './components/map';
// import SankeyRegionRegion from './components/sankey-region-region';

import {
  // createElementTableWithTranspose,
  // regionToRegion,
  // chicagoArrests,
  // confusiongram,
  // friendlyMosaicAlike2,
  // AlongTheLakeExample,
  // AlongTheLakeExampleMargins,
  // regionToRegion,
  // unemploymentStreamgram,
  // buildSenateExample
  // dndAlignments,
  // buildSenateExample,
  // usaWithLabels,
  multiplicationTable,
} from './figure-setups';

function App(): JSX.Element {
  const tables = [multiplicationTable()].map((config, idx) => (
    // @ts-ignore
    <IterativeDisplay iterations={0} layout={'gridLayout'} {...config} key={`table-${idx}`} />
  ));
  return (
    <div>
      <h1>TABLE CARTOGRAM SHOWCASE</h1>
      <div>
        {/* <div style={{display: 'flex', flexWrap: 'wrap'}}>{tables}</div> */}
        {
          // <HourCalendar celius={true} data={require('../examples/large-examples/ohare-temp-data.json')}/>
        }
        {/* <CalendarDisplay /> */}
        {<Legend />}
        <JanCalendar />
        {/* {<AlphaTableBuilder />} */}
      </div>
    </div>
  );
}

const el = document.createElement('div');
document.body.appendChild(el);

ReactDOM.render(React.createElement(App), el);
