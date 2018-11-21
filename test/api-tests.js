import {
  translateVectorToTable,
  translateTableToVector,
  findSumForTable,
  area
} from '../src/utils';

import tape from 'tape';

import {
  tableCartogram,
  tableCartogramWithUpdate,
  tableCartogramAdaptive
} from '../';

tape('test tableCartogram computation', t => {
  const TEST_TABLE = [[{x: 1}, {x: 2}], [{x: 2}, {x: 1}]];
  const directResults = tableCartogram({
    data: TEST_TABLE,
    technique: 'coordinate',
    layout: 'gridLayout',
    iterations: 300,
    accessor: d => d.x,
    height: 0.5
  });

  t.ok(directResults.every((cell, idx) => {
    const j = idx % 2;
    const i = Math.floor(idx / 2);
    return cell.value === TEST_TABLE[i][j].x;
  }), 'all cells have correct value decorated');

  t.ok(directResults.every((cell, idx) => {
    const j = idx % 2;
    const i = Math.floor(idx / 2);
    return JSON.stringify(cell.data) === JSON.stringify(TEST_TABLE[i][j]);
  }), 'all cells have correct data decorated');

  const TABLE_SUM = 6;
  directResults.forEach((cell, idx) => {
    const j = idx % 2;
    const i = Math.floor(idx / 2);
    const HEIGHT = 0.5;
    const DELTA = area(cell.vertices) - HEIGHT * TEST_TABLE[i][j].x / TABLE_SUM;
    t.ok(Math.abs(DELTA) < 0.00001, `cell (${j},${i}) has correct area`);
  });
  t.end();
});

tape('test tableCartogramAdaptive computation', t => {
  const TEST_TABLE = [[{x: 1}, {x: 2}], [{x: 2}, {x: 1}]];
  const adaptive = tableCartogramAdaptive({
    data: TEST_TABLE,
    technique: 'coordinate',
    layout: 'gridLayout',
    iterations: 300,
    accessor: d => d.x,
    height: 0.5
  });
  const directResults = adaptive.gons;
  t.ok(adaptive.stepsTaken < 300, 'should find that the maximum number of steps is not surpassed');
  t.ok(adaptive.error < 0.0001, 'should find that the average error is acceptable');
  t.ok(adaptive.maxError < 0.0001, 'should find that the average error is acceptable');

  t.ok(directResults.every((cell, idx) => {
    const j = idx % 2;
    const i = Math.floor(idx / 2);
    return cell.value === TEST_TABLE[i][j].x;
  }), 'all cells have correct value decorated');
  t.ok(directResults.every((cell, idx) => {
    const j = idx % 2;
    const i = Math.floor(idx / 2);
    return JSON.stringify(cell.data) === JSON.stringify(TEST_TABLE[i][j]);
  }), 'all cells have correct data decorated');

  const TABLE_SUM = 6;
  directResults.forEach((cell, idx) => {
    const j = idx % 2;
    const i = Math.floor(idx / 2);
    const HEIGHT = 0.5;
    const DELTA = area(cell.vertices) - HEIGHT * TEST_TABLE[i][j].x / TABLE_SUM;
    t.ok(Math.abs(DELTA) < 0.00001, `cell (${j},${i}) has correct area`);
  });
  t.end();
});

tape('test tableCartogramWithUpdate computation', t => {
  const TEST_TABLE = [[{x: 1}, {x: 2}], [{x: 2}, {x: 1}]];
  const resultsBuilder = tableCartogramWithUpdate({
    data: TEST_TABLE,
    technique: 'coordinate',
    layout: 'gridLayout',
    iterations: 300,
    accessor: d => d.x,
    height: 0.5
  });

  t.equal(typeof resultsBuilder, 'function', 'should get a function back from the updatable version');
  const directResults = resultsBuilder(300);
  t.ok(directResults.every((cell, idx) => {
    const j = idx % 2;
    const i = Math.floor(idx / 2);
    return cell.value === TEST_TABLE[i][j].x;
  }), 'all cells have correct value decorated');

  t.ok(directResults.every((cell, idx) => {
    const j = idx % 2;
    const i = Math.floor(idx / 2);
    return JSON.stringify(cell.data) === JSON.stringify(TEST_TABLE[i][j]);
  }), 'all cells have correct data decorated');

  const TABLE_SUM = 6;
  directResults.forEach((cell, idx) => {
    const j = idx % 2;
    const i = Math.floor(idx / 2);
    const HEIGHT = 0.5;
    const DELTA = area(cell.vertices) - HEIGHT * TEST_TABLE[i][j].x / TABLE_SUM;
    t.ok(Math.abs(DELTA) < 0.00001, `cell (${j},${i}) has correct area`);
  });
  t.end();
});

function getNbyMTable(n, m, builder = b => 0) {
  return [...new Array(n)].map(a => [...new Array(m)].map(builder));
}

tape('translateVectorToTabletranslateTableToVector', t => {
  const TABLE = getNbyMTable(2, 3);
  const VEC = [
    1, 2,
    3, 1, 6, 2, 5, 3,
    1, 2
  ];
  const ARB_H = 5;
  const ARB_W = 5;
  const expectedTable = [
    [{x: 0, y: 0}, {x: VEC[0], y: 0}, {x: VEC[1], y: 0}, {x: ARB_W, y: 0}],
    [{x: 0, y: VEC[2]}, {x: VEC[3], y: VEC[4]}, {x: VEC[5], y: VEC[6]}, {x: ARB_W, y: VEC[7]}],
    [{x: 0, y: ARB_H}, {x: VEC[8], y: ARB_H}, {x: VEC[9], y: ARB_H}, {x: ARB_W, y: ARB_H}]
  ];
  const newTable = translateVectorToTable(VEC, TABLE, 5, 5);
  t.deepEqual(newTable, expectedTable, 'should correctly transform vector to table');
  const newVector = translateTableToVector(newTable);
  t.equal(newVector.length, 10, 'should have the correct number of elements in it');
  t.deepEqual(newVector, VEC, 'should correctly transform table to original vector');

  // need to add one to account for the first argument representing vertex positions
  const preppedTable = getNbyMTable(2 + 1, 3 + 1, b => ({x: 0, y: 0}));
  const twoByNewVector = translateTableToVector(preppedTable);
  t.equal(twoByNewVector.length, 10, 'should have the correct number of elements in it');
  t.deepEqual(
    twoByNewVector, [...new Array(10)].map(x => 0),
    'should correctly transform the constructed two by 3');
  t.end();
});

tape('findSumForTableTest', t => {
  const inputTable = [[1, 1, 3], [2, 3, 4]];
  t.equal(findSumForTable(inputTable), 14, 'should get correct result for basic sum');
  t.equal(findSumForTable(getNbyMTable(100, 100), 0), 0, 'should get zero for empty table');
  t.end();
});
