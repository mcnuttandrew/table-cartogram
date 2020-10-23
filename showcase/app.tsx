import ReactDOM from 'react-dom';
import React from 'react';

// import AlphaTableBuilder from './components/alpha-table-builder';
// import EXAMPLES from '../examples/examples';
import IterativeDisplay from './components/iterative-display';
import Legend from './components/legend';
import JanCalendar from './components/mod-jan-calendar';
import EXAMPLES from '../examples/examples';
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
  // multiplicationTable,
  correlationAndWithout,
} from './figure-setups';

function App(): JSX.Element {
  const tables = [
    ...correlationAndWithout(),
    // multiplicationTable()
    // {
    //   data: EXAMPLES.CHECKER_BOARD,
    //   // data: [
    //   //   [1, 1, 1, 1],
    //   //   [1, 1, 1, 1],
    //   //   [1, 1, 1, 1],
    //   //   [1, 1, 1, 1],
    //   // ],
    //   defaultColor: 'byValue',
    //   accessor: (d: any) => d,
    //   height: 1,
    //   width: 1,
    //   layout: 'rampY',
    //   // computeMode: 'iterative',
    //   // stepSize: 10,
    //   computeMode: 'direct',
    //   steps: 0,

    //   // data: TEST_TABLE,
    //   // layout: 'gridLayout',
    //   // iterations: 300,
    //   // accessor: (d) => d.x,
    //   // height: 0.5,
    // },
    // {
    //   data: EXAMPLES.CHECKER_BOARD,
    //   stepSize: 10,
    //   computeMode: 'iterative',
    //   accessor: (d) => d,
    //   // getLabel: (d) => d.data[0],
    //   // dims: {
    //   //   height: 0.75,
    //   //   width: 1,
    //   // },
    // },
  ].map((config, idx) => (
    // @ts-ignore
    <IterativeDisplay iterations={0} layout={'gridLayout'} {...config} key={`table-${idx}`} />
  ));
  return (
    <div>
      <h1>TABLE CARTOGRAM SHOWCASE</h1>
      <div>
        <div style={{display: 'flex', flexWrap: 'wrap'}}>{tables}</div>
        {
          // <HourCalendar celius={true} data={require('../examples/large-examples/ohare-temp-data.json')}/>
        }
        {/* <CalendarDisplay /> */}
        {/* {<Legend />}
        <JanCalendar /> */}
        {/* {<AlphaTableBuilder />} */}
      </div>
    </div>
  );
}

const el = document.createElement('div');
document.body.appendChild(el);

ReactDOM.render(React.createElement(App), el);
