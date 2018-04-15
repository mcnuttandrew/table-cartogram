import ReactDOM from 'react-dom';
import React, {Component} from 'react';
import GenericTable from './components/generic-test-table';
import PolygonPartition from './components/polygon-partition';

import {
  XYPlot,
  PolygonSeries,
  LabelSeries
} from 'react-vis';

import {TapReactBrowser} from 'tap-react-browser';
import {
  translateVectorToTabletranslateTableToVector,
  findSumForTableTest,
  buildIterativeCartogramTest,
} from '../test/iterative-tests';

import {
  buildIterativeCartogram,
  translateVectorToTable,
  translateTableToVector,
  findSumForTable,
  convertToManyPolygons,
  tableCartogram
} from '../iterative';

import {geoCenter, area, round} from '../utils';

import {RV_COLORS} from './colors';
import ZionVisitors from '../test/zion-visitors';
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const ZION_VISITORS = ZionVisitors.map(year => MONTHS.map(month => year[month])).slice(5);

const EXAMPLE_TABLE = [
  [2, 3, 2, 4],
  [3, 9, 3, 7],
  [2, 3, 4, 9],
  [3, 2, 2, 3]
];

const BIG_TOP = [
  [20, 1, 20],
  [1, 1, 1],

  // [200, 200, 200, 1, 200, 200],
  // [1, 1, 1, 1, 1, 1],
  // [1, 1, 1, 1],
  // [1, 1, 1, 1]
];

const BIG_BOTTOM = [
  [1, 1, 1],
  [20, 1, 20],
];

const ONE_BYS = [
  // [1, 1],
  // [1, 1]

  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 2, 1],
  [1, 1, 1, 1],
  // //

  // [10, 1, 10, 1],
  // [1, 10, 1, 10],
  // [10, 1, 10, 1],
  // [1, 10, 1, 10]
];



const BLACK_AND_WHITE_TABLE = [
  [4.5, 4.5, 16, 2.5],
  [4, 3, 4.5, 3],
  [2.5, 6, 4.5, 10.5],
  [7, 9, 9, 6]
];

const TEST_DATA = [
  {
    name: 'BIG TOP',
    data: BIG_TOP,
  },
  {
    name: 'BIG BOTTOM',
    data: BIG_BOTTOM
  },
  {
    name: 'EXAMPLE_TABLE',
    data: EXAMPLE_TABLE,
  },
  {
    name: '1x1slower 2',
    data: [[1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 2, 1],
    [1, 1, 1, 1],],
  },
  {
    name: '1x1supper 2',
    data: [[1, 1, 1, 1],
    [1, 2, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],],
  },
  // {
  //   name: 'B + W',
  //   data: BLACK_AND_WHITE_TABLE,
  //   size: {height: 500, width: 500}
  // }
  // {
  //   name: 'ZION_VISITORS',
  //   data: ZION_VISITORS,
  //   size: {height: 1200, width: 1200}
  // }
];

const POLYGON_PARTITION_EXAMPLES = [
  // {
  //   points: [
  //     {x: -4.659090909090909, y: 1},
  //     {x: -4.659090909090909, y: 0.4590163934426229},
  //     {x: 0, y: 0.06557377049180328},
  //     {x: 4.659090909090909, y: 0.4590163934426229},
  //     {x: 4.659090909090909, y: 1}
  //   ],
  //   areas: {alpha: 2.9508196721311477, beta: 1.9616244411326378, gamma: 1.9616244411326378}
  // },
  // {
  //   areas: {alpha: 0, beta: 9.878048780487806, gamma: 0.4939024390243902},
  //   points: [
  //     {x: 10.731707317073171, y: 1},
  //     {x: 10.731707317073171, y: 0.11363636363636369},
  //     {x: 11.73170731707317, y: 0.045454545454545456},
  //     {x: 22, y: 0.11363636363636369},
  //     {x: 22, y: 1}
  //   ]
  // },
  {
    points: [
      {x: 0, y: 0},
      {x: 0, y: 0.045454545454545456},
      {x: 10.731707317073171, y: 0.11363636363636369},
      {x: 11.73170731707317, y: 0.045454545454545456},
      {x: 11.73170731707317, y: 0}
    ],
    areas: {alpha: 0, beta: 0.4666019955654103, gamma: 0.4666019955654103}
  }

];

function renderIterative(exampleTable, iterations, monteCarlo) {
  // const adjTable = buildIterativeCartogram(exampleTable, iterations, monteCarlo);
  // const gons = convertToManyPolygons(adjTable);
  const gons = tableCartogram(exampleTable, iterations, monteCarlo)
  return (
    <XYPlot
      animation
      colorType="linear"
      width={600}
      height={600}>
      {gons.map((cell, index) => {
        return (<PolygonSeries
          key={`triangle-${index}`}
          data={cell.vertices}
          style={{
            strokeWidth: 0.5,
            strokeOpacity: 1,
            opacity: 0.5,
            fill: RV_COLORS[(index + 3) % RV_COLORS.length]
          }}/>);
      })}
      {
        gons.map((cell, index) => {
          return (<PolygonSeries
            key={`poly-${index}`}
            data={cell.vertices}
            style={{
              fill: 'none',
              strokeOpacity: 1,
              strokeWidth: 1,
              stroke: 'black'
            }}/>);
        })
      }
      <LabelSeries data={gons.map((cell, index) => {
        // return {...geoCenter(cell.vertices), label: cell.value};
        return {...geoCenter(cell.vertices), label: `${round(area(cell.vertices), Math.pow(10, 6))}`};
      })} />
    </XYPlot>
  );
}

export default class App extends Component {
  render() {
    const exampleTable = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
    return (
      <div>
        <div style={{fontSize: '22px'}}> TABLE CARTOGRAM VISUAL TEST SUITE </div>
        <div>
          <TapReactBrowser
            runAsPromises 
            tests={[
              translateVectorToTabletranslateTableToVector,
              findSumForTableTest,
              buildIterativeCartogramTest
            ]}/>
          <div style={{display: 'flex'}}>
            {renderIterative(exampleTable, 10000, true)}
            {renderIterative(exampleTable, 10000, false)}
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          {
            // TEST_DATA.map((tableProps, i) => <GenericTable key={i} {...tableProps} />)
          }
        </div>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          {
            // <div style={{fontSize: '18px'}}> POLYGON PARTITION </div>
            // POLYGON_PARTITION_EXAMPLES.map((polyProps, i) => <PolygonPartition key={i} {...polyProps}/>)
          }
        </div>
      </div>
    );
  }
}

const el = document.createElement('div');
document.body.appendChild(el);

ReactDOM.render(React.createElement(App), el);
