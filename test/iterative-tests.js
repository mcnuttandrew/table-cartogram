import tape from 'tape';
import {
  buildIterativeCartogram,
  translateVectorToTable,
  translateTableToVector,
  findSumForTable
} from '../iterative';

tape('buildIterativeCartogram', t => {
  const exampleTable = [[1, 3], [1, 3]];
  const foundTable = buildIterativeCartogram(exampleTable);
  const expectedTable = [
    [{x: 0, y: 0}, {x: 0.5, y: 0}, {x: 1, y: 0}],
    [{x: 0, y: 0.5}, {x: 0.5, y: 0.5}, {x: 1, y: 0.5}],
    [{x: 0, y: 1}, {x: 0.5, y: 1}, {x: 1, y: 1}]];
  t.deepEqual(foundTable, expectedTable, 'found table performs as expected');
  t.end();
});

function getNbyMTable(n, m) {
  return [...new Array(n)].map(a => [...new Array(m)].map(b => 0));
}

tape('translateVectorToTable/translateTableToVector', t => {
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
  t.deepEqual(newVector, VEC, 'should correctly transform table to original vector');
  // TODO WRITE SOME MORE TRESTS
  t.end();
});

tape('findSumForTable', t => {
  const inputTable = [[1, 1, 3], [2, 3, 4]];
  t.equal(findSumForTable(inputTable), 14, 'should get correct result for basic sum');
  t.equal(findSumForTable(getNbyMTable(100, 100), 0), 0, 'should get zero for empty table');
  t.end();
});


