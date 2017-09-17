import tape from 'tape';
import tableCartogram from '../';

tape("tableCartogram ", function(t) {
  t.equal(typeof tableCartogram, 'function', 'should correctly find a function');
  t.end();
});


tape("tableCartogram - size", function(t) {
  var cartogram = tableCartogram();
  var initialSize = cartogram.size();
  t.deepEqual(initialSize, [1, 1], 'should find the correct defaults');
  cartogram.size([10, 10]);
  t.deepEqual(cartogram.size(), [10, 10], 'should save the set size values');
  t.end();
});


var EXAMPLE_TABLE = [
  [2, 3, 2, 4],
  [3, 9, 3, 7],
  [2, 3, 4, 9],
  [3, 2, 2, 3]
];
var EXPECTED_CARTOGRAM_EXAMPLE_TABLE = [
  [
    {value: 2, vertices: [{x: 0, y: 0}]},
    {value: 3, vertices: [{x: 0, y: 0}]},
    {value: 2, vertices: [{x: 0, y: 0}]},
    {value: 4, vertices: [{x: 0, y: 0}]}],
  [
    {value: 3, vertices: [{x: 0, y: 0}]},
    {value: 9, vertices: [{x: 0, y: 0}]},
    {value: 3, vertices: [{x: 0, y: 0}]},
    {value: 7, vertices: [{x: 0, y: 0}]}],
  [
    {value: 2, vertices: [{x: 0, y: 0}]},
    {value: 3, vertices: [{x: 0, y: 0}]},
    {value: 4, vertices: [{x: 0, y: 0}]},
    {value: 9, vertices: [{x: 0, y: 0}]}],
  [
    {value: 3, vertices: [{x: 0, y: 0}]},
    {value: 2, vertices: [{x: 0, y: 0}]},
    {value: 2, vertices: [{x: 0, y: 0}]},
    {value: 3, vertices: [{x: 0, y: 0}]}]
];
tape("tableCartogram - size", function(t) {
  var cartogram = tableCartogram();
  var mappedTable = cartogram(EXAMPLE_TABLE);
  t.deepEqual(mappedTable, EXPECTED_CARTOGRAM_EXAMPLE_TABLE, 'should find modified and updated table')
  t.end();
});
