import {Gon} from '../types';
import {translateVectorToTable, translateTableToVector, findSumForTable, area} from '../src/utils';

import {tableCartogram, tableCartogramWithUpdate, tableCartogramAdaptive} from '..';

test('test tableCartogram computation', () => {
  const TEST_TABLE = [
    [{x: 1}, {x: 2}],
    [{x: 2}, {x: 1}],
  ];
  const directResults = tableCartogram({
    data: TEST_TABLE,
    layout: 'gridLayout',
    iterations: 300,
    accessor: (d) => d.x,
    height: 0.5,
  });

  // 'all cells have correct value decorated',
  expect(
    directResults.every((cell, idx) => {
      const j = idx % 2;
      const i = Math.floor(idx / 2);
      return cell.value === TEST_TABLE[i][j].x;
    }),
  ).toBeTruthy();

  // 'all cells have correct data decorated',
  expect(
    directResults.every((cell, idx) => {
      const j = idx % 2;
      const i = Math.floor(idx / 2);
      return JSON.stringify(cell.data) === JSON.stringify(TEST_TABLE[i][j]);
    }),
  ).toBeTruthy();

  const TABLE_SUM = 6;
  directResults.forEach((cell, idx) => {
    const j = idx % 2;
    const i = Math.floor(idx / 2);
    const HEIGHT = 0.5;
    const DELTA = area(cell.vertices) - (HEIGHT * TEST_TABLE[i][j].x) / TABLE_SUM;
    // console.log(DELTA, area(cell.vertices), (HEIGHT * TEST_TABLE[i][j].x) / TABLE_SUM);
    // `cell (${j},${i}) has correct area`
    expect(Math.abs(DELTA) < 0.00001).toBeTruthy();
  });
});

test('test tableCartogramAdaptive computation', () => {
  const TEST_TABLE = [
    [{x: 1}, {x: 2}],
    [{x: 2}, {x: 1}],
  ];
  const adaptive = tableCartogramAdaptive({
    data: TEST_TABLE,
    layout: 'gridLayout',
    maxNumberOfSteps: 300,
    accessor: (d) => d.x,
    height: 0.5,
  });
  const directResults = adaptive.gons;
  // should find that the maximum number of steps is not surpassed
  expect(adaptive.stepsTaken < 300).toBeTruthy();
  // should find that the average error is acceptable
  expect(adaptive.error < 0.0001).toBeTruthy();
  // should find that the average error is acceptable
  expect(adaptive.maxError < 0.0001).toBeTruthy();

  // all cells have correct value decorated
  expect(
    directResults.every((cell, idx) => {
      const j = idx % 2;
      const i = Math.floor(idx / 2);
      return cell.value === TEST_TABLE[i][j].x;
    }),
  ).toBeTruthy();
  // all cells have correct data decorated
  expect(
    directResults.every((cell, idx) => {
      const j = idx % 2;
      const i = Math.floor(idx / 2);
      return JSON.stringify(cell.data) === JSON.stringify(TEST_TABLE[i][j]);
    }),
  ).toBeTruthy();

  const TABLE_SUM = 6;
  directResults.forEach((cell, idx) => {
    const j = idx % 2;
    const i = Math.floor(idx / 2);
    const HEIGHT = 0.5;
    const DELTA = area(cell.vertices) - (HEIGHT * TEST_TABLE[i][j].x) / TABLE_SUM;
    // `cell (${j},${i}) has correct area`;
    expect(Math.abs(DELTA) < 0.00001).toBeTruthy();
  });
});

test('test tableCartogramWithUpdate computation', () => {
  const TEST_TABLE = [
    [{x: 1}, {x: 2}],
    [{x: 2}, {x: 1}],
  ];
  const resultsBuilder = tableCartogramWithUpdate({
    data: TEST_TABLE,
    layout: 'gridLayout',
    accessor: (d) => d.x,
    height: 0.5,
  });

  //   should get a function back from the updatable version
  expect(typeof resultsBuilder).toBe('function');
  const withUpdateResults = (resultsBuilder as (x: number) => Gon[])(300);
  //   all cells have correct value decorated
  expect(
    withUpdateResults.every((cell, idx) => {
      const j = idx % 2;
      const i = Math.floor(idx / 2);
      return cell.value === TEST_TABLE[i][j].x;
    }),
  ).toBeTruthy();

  // all cells have correct data decorated,
  expect(
    withUpdateResults.every((cell, idx) => {
      const j = idx % 2;
      const i = Math.floor(idx / 2);
      return JSON.stringify(cell.data) === JSON.stringify(TEST_TABLE[i][j]);
    }),
  ).toBeTruthy();

  const TABLE_SUM = 6;
  withUpdateResults.forEach((cell, idx) => {
    const j = idx % 2;
    const i = Math.floor(idx / 2);
    const HEIGHT = 0.5;
    const DELTA = area(cell.vertices) - (HEIGHT * TEST_TABLE[i][j].x) / TABLE_SUM;
    // console.log(DELTA, area(cell.vertices), (HEIGHT * TEST_TABLE[i][j].x) / TABLE_SUM);
    // cell (${j},${i}) has correct area
    expect(Math.abs(DELTA) < 0.00001).toBeTruthy();
  });
});

function getNbyMTable(n: number, m: number, builder = (): number => 0): any[][] {
  return [...new Array(n)].map(() => [...new Array(m)].map(builder));
}

test('translateVectorToTable/translateTableToVector', () => {
  const TABLE = getNbyMTable(2, 3);
  const VEC = [1, 2, 3, 1, 6, 2, 5, 3, 1, 2];
  const ARB_H = 5;
  const ARB_W = 5;
  const expectedTable = [
    [
      {x: 0, y: 0},
      {x: VEC[0], y: 0},
      {x: VEC[1], y: 0},
      {x: ARB_W, y: 0},
    ],
    [
      {x: 0, y: VEC[2]},
      {x: VEC[3], y: VEC[4]},
      {x: VEC[5], y: VEC[6]},
      {x: ARB_W, y: VEC[7]},
    ],
    [
      {x: 0, y: ARB_H},
      {x: VEC[8], y: ARB_H},
      {x: VEC[9], y: ARB_H},
      {x: ARB_W, y: ARB_H},
    ],
  ];
  const newTable = translateVectorToTable(VEC, TABLE, 5, 5);
  // should correctly transform vector to table
  expect(newTable).toEqual(expectedTable);
  const newVector = translateTableToVector(newTable);
  // should have the correct number of elements in it
  expect(newVector.length).toBe(10);
  // should correctly transform table to original vector
  expect(newVector).toEqual(VEC);

  // need to add one to account for the first argument representing vertex positions
  const preppedTable = getNbyMTable(2 + 1, 3 + 1, (): any => ({x: 0, y: 0}));
  const twoByNewVector = translateTableToVector(preppedTable);
  // should have the correct number of elements in it
  expect(twoByNewVector.length).toBe(10);
  // should correctly transform the constructed two by 3
  expect(twoByNewVector).toStrictEqual([...new Array(10)].map((x) => 0));
});

test('findSumForTableTest', () => {
  const inputTable = [
    [1, 1, 3],
    [2, 3, 4],
  ];
  // should get correct result for basic sum
  expect(findSumForTable(inputTable)).toBe(14);
  //   should get zero for empty table
  expect(findSumForTable(getNbyMTable(100, 100))).toBe(0);
});
