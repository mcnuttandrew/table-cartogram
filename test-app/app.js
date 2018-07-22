import ReactDOM from 'react-dom';
import React, {Component} from 'react';

import {TapReactBrowser} from 'tap-react-browser';
import {
  translateVectorToTabletranslateTableToVector,
  findSumForTableTest,
  buildIterativeCartogramTest
} from '../test/iterative-tests';

import GenericTable from './components/generic-test-table';

import IterativeDisplay from './components/iterative-display';
import ZionVisitors from '../test/zion-visitors';

const USA_USA_USA = [
  [6.725, 0.989, 0.673, 5.304, 5.687, 19.378, 0.626, 1.328],
  [3.831, 1.568, 0.814, 3.046, 9.884, 12.702, 1.316, 6.548],
  [2.701, 0.564, 1.826, 12.831, 6.484, 11.537, 3.574, 1.053],
  [2.764, 5.029, 2.853, 5.989, 4.339, 1.853, 5.774, 8.792],
  [37.254, 2.059, 3.751, 2.916, 6.346, 4.625, 8.001, 0.898],
  [6.392, 25.146, 4.533, 2.967, 4.78, 9.688, 18.801, 9.535]
];

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
  [20, 1, 1],
];

const checkerBoardGenerator = (width, height, high, low, offset = 0) =>
  [...new Array(height)].map((_, ydx) =>
    [...new Array(width)].map((d, xdx) => (xdx + (ydx % 2) + offset) % (2) ? high : low));

const CHECKER_BOARD = checkerBoardGenerator(4, 4, 50, 1);
const CHECKER_BOARD_SMALL = checkerBoardGenerator(4, 4, 5, 1);

const ONE_BYS = [
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 5, 1],
  [1, 1, 1, 1]
];

const BLACK_AND_WHITE_TABLE = [
  [4.5, 4.5, 16, 2.5],
  [4, 3, 4.5, 3],
  [2.5, 6, 4.5, 10.5],
  [7, 9, 9, 6]
];

const oneByOnesLower2 = [
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 2, 1],
  [1, 1, 1, 1]
];

const oneByOnesUpper2 = [
  [1, 1, 1, 1],
  [1, 2, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 1, 1]
];

const DUMB_CALENDER = [
  [ 1,  2,  3,  4,  5,  6,  7],
  [ 8,  9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 27, 28],
  // [29, 30,  1,  2,  3,  4,  5]
];

const SMALL_RAMP = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];
const twoByThree = [[1, 1, 1], [1, 1, 1]];
const ONE_BY = checkerBoardGenerator(2, 2, 2, 1);

export default class App extends Component {
  render() {
    return (
      <div>
        <div style={{fontSize: '22px'}}> TABLE CARTOGRAM VISUAL TEST SUITE </div>
        <div>
          <TapReactBrowser
            runAsPromises
            tests={[
              translateVectorToTabletranslateTableToVector,
              findSumForTableTest,
              // buildIterativeCartogramTest
            ]}/>
          <div style={{display: 'flex'}}>
            <IterativeDisplay
              data={DUMB_CALENDER}
              iterations={100000}
              technique="gradient"
              />
              {

                // <IterativeDisplay
                // data={CHECKER_BOARD}
                // iterations={10000}
                // technique="powell"
                // />
                // <GenericTable data={CHECKER_BOARD} />
              }
          </div>
        </div>
      </div>
    );
  }
}

const el = document.createElement('div');
document.body.appendChild(el);

ReactDOM.render(React.createElement(App), el);
