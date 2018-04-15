import tape from 'tape';
import {
  buildIterativeCartogram,
  translateVectorToTable,
  translateTableToVector,
  findSumForTable
} from '../iterative';

// tape('buildIterativeCartogram', );
export function buildIterativeCartogramTest(t) {
  ['monte', 'powell'].forEach(optimizationAlgo => {
    const usingMonte = optimizationAlgo === 'monte';
    const exampleTable = [[1, 1], [1, 1]];
    const foundTable = buildIterativeCartogram(exampleTable, null, usingMonte);
    const expectedTable = [
      [{x: 0, y: 0}, {x: 0.5, y: 0}, {x: 1, y: 0}],
      [{x: 0, y: 0.5}, {x: 0.5, y: 0.5}, {x: 1, y: 0.5}],
      [{x: 0, y: 1}, {x: 0.5, y: 1}, {x: 1, y: 1}]
    ];
    t.deepEqual(foundTable, expectedTable, `${optimizationAlgo}: found table performs as expected -> 2x2`);

    const exampleTable2 = [[1, 1, 1], [1, 1, 1]];
    const foundTable2 = buildIterativeCartogram(exampleTable2, null, usingMonte);
    const expectedTable2 = [
      [{x: 0, y: 0 * 1}, {x: 1 / 3, y: 0 * 1}, {x: 2 / 3, y: 0 * 1}, {x: 1, y: 0}],
      [{x: 0, y: 1 / 2}, {x: 1 / 3, y: 1 / 2}, {x: 2 / 3, y: 1 / 2}, {x: 1, y: 1 / 2}],
      [{x: 0, y: 1 / 1}, {x: 1 / 3, y: 1 / 1}, {x: 2 / 3, y: 1 / 1}, {x: 1, y: 1}]
    ];
    t.equal(foundTable2.length, 3, `${optimizationAlgo}: 2x3 has correct width`);
    t.equal(foundTable2[0].length, 4, `${optimizationAlgo}: 2x3 has correct height`);
    t.deepEqual(foundTable2, expectedTable2, `${optimizationAlgo}: found table performs as expected -> 2x3`);

    const exampleTable3 = [[1, 1], [1, 1], [1, 1]];
    const foundTable3 = buildIterativeCartogram(exampleTable3, null, usingMonte);
    const expectedTable3 = [
      [{x: 0, y: 0 * 1}, {x: 1 / 2, y: 0 * 1}, {x: 1, y: 0}],
      [{x: 0, y: 1 / 3}, {x: 1 / 2, y: 1 / 3}, {x: 1, y: 1 / 3}],
      [{x: 0, y: 2 / 3}, {x: 1 / 2, y: 2 / 3}, {x: 1, y: 2 / 3}],
      [{x: 0, y: 1 / 1}, {x: 1 / 2, y: 1 / 1}, {x: 1, y: 1}]
    ];
    t.equal(foundTable3.length, 4, `${optimizationAlgo}: 3x2 has correct width`);
    t.equal(foundTable3[0].length, 3, `${optimizationAlgo}: 3x2 has correct height`);
    t.deepEqual(foundTable3, expectedTable3, `${optimizationAlgo}: found table performs as expected -> 3x2`);
  });
  t.end();
}

function getNbyMTable(n, m, builder = b => 0) {
  return [...new Array(n)].map(a => [...new Array(m)].map(builder));
}

export function translateVectorToTabletranslateTableToVector(t) {
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
  const newVector = translateTableToVector(newTable, TABLE);
  t.equal(newVector.length, 10, 'should have the correct number of elements in it');
  t.deepEqual(newVector, VEC, 'should correctly transform table to original vector');
  // TODO WRITE SOME MORE TRESTS

  const twoByThree = [[1, 1, 1], [1, 1, 1]];
  // need to add one to account for the first argument representing vertex positions
  const preppedTable = getNbyMTable(2 + 1, 3 + 1, b => ({x: 0, y: 0}));
  const twoByNewVector = translateTableToVector(preppedTable, twoByThree);
  t.equal(twoByNewVector.length, 10, 'should have the correct number of elements in it');
  t.deepEqual(
    twoByNewVector, [...new Array(10)].map(x => 0),
    'should correctly transform the constructed two by 3');
  t.end();
}
// tape('translateVectorToTable/translateTableToVector', );

export function findSumForTableTest(t) {
  const inputTable = [[1, 1, 3], [2, 3, 4]];
  t.equal(findSumForTable(inputTable), 14, 'should get correct result for basic sum');
  t.equal(findSumForTable(getNbyMTable(100, 100), 0), 0, 'should get zero for empty table');
  t.end();
}
// tape();


