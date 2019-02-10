import ReactDOM from 'react-dom';
import React from 'react';

import AlphaTableBuilder from './components/alpha-table-builder';
import EXAMPLES from '../examples/examples';
import IterativeDisplay from './components/iterative-display';
// import CalendarDisplay from './components/calendar-example';
// import HourCalendar from './components/hour-calendar';
// import CartogramPlot from './components/table-cartogram';
// import ZionExperiment from './components/zion-experiment';
// import ZionSpiral from './components/zion-spiral';
import PivotogramAlts from './components/pivotogram-alts';
// import SankeyRegionRegion from './components/sankey-region-region';

import {
  createElementTableWithTranspose,
  stateToStateFullNetwork
} from './figure-setups';

function App() {
  const tables = [

    // ...createElementTableWithTranspose()
    // {data: EXAMPLES.BLACK_AND_WHITE_TABLE, stepSize: 5, computeMode: 'iterative'},
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
          <AlphaTableBuilder/>
        }
      </div>
    </div>
  );
}

const el = document.createElement('div');
document.body.appendChild(el);

ReactDOM.render(React.createElement(App), el);
