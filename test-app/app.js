// Copyright (c) 2016 - 2017 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import ReactDOM from 'react-dom';
import React, {Component} from 'react';
import GenericTable from './generic-test-table';

const EXAMPLE_TABLE = [
  [2, 3, 2, 4],
  [3, 9, 3, 7],
  [2, 3, 4, 9],
  [3, 2, 2, 3]
];

const ONE_BYS = [
  [1, 1],
  [1, 1]

  // [1, 1, 1, 1],
  // [1, 1, 1, 1],
  // [1, 1, 1, 1],
  // [1, 1, 1, 1]
];

const BLACK_AND_WHITE_TABLE = [
  [4.5, 4.5, 16, 2.5],
  [4, 3, 4.5, 3],
  [2.5, 6, 4.5, 10.5],
  [7, 9, 9, 6]
];

const TEST_DATA = [
  {
    name: 'EXAMPLE_TABLE - QUADS',
    data: EXAMPLE_TABLE,
    mode: 'quad'
  },
  {
    name: 'EXAMPLE_TABLE - TRIANGLE',
    data: EXAMPLE_TABLE,
    mode: 'triangle'
  },
  {
    name: '1x1s - QUADS',
    data: ONE_BYS,
    mode: 'quad'
  },
  // {
  //   name: '1x1 - TRIANGLE',
  //   data: ONE_BYS,
  //   mode: 'triangle'
  // },
  // {
  //   name: 'B + W - QUADS',
  //   data: BLACK_AND_WHITE_TABLE,
  //   mode: 'quad',
  //   size: {height: 500, width: 500}
  // },
  // {
  //   name: 'B + W - TRIANGLES',
  //   data: BLACK_AND_WHITE_TABLE,
  //   mode: 'triangle',
  //   size: {height: 500, width: 500}
  // }
];

export default class App extends Component {
  render() {
    return (
      <div>
        <div style={{fontSize: '22px'}}> TABLE CARTOGRAM VISUAL TEST SUITE </div>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          {
            TEST_DATA.map((tableProps, i) => <GenericTable key={i} {...tableProps} />)
          }
        </div>
      </div>
    );
  }
}

const el = document.createElement('div');
document.body.appendChild(el);

ReactDOM.render(React.createElement(App), el);
