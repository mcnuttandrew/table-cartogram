import {area, round} from '../old-stuff/utils';
import {hierarchy, treemap} from 'd3-hierarchy';

/**
 * Computes the average cartographic error for a particular table arrangement
 * @param  {Array of Arrays of Numbers} data The input table
 * @param  {Array of Arrays of Numbers} gons The test layout
 * @return {Number} the average error for the test layout
 */
export function computeErrors(data, gons) {
  const tableSum = data.reduce((acc, row) => acc + row.reduce((mem, cell) => mem + cell, 0), 0);
  const expectedAreas = data.map(row => row.map(cell => cell / tableSum));
  const errors = [];
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[0].length; j++) {
      const gonArea = area(gons[i * data[0].length + j].vertices);
      // TODO i think this max term is correct from the quantitative cartogram paper but i am unsure
      const computedErr = Math.abs(gonArea - expectedAreas[i][j]) / Math.max(gonArea, expectedAreas[i][j]);
      // const computedErr = Math.abs(gonArea - expectedAreas[i][j]) / expectedAreas[i][j];
      errors.push(computedErr);
    }
  }
  let error = errors.reduce((acc, row) => acc + row, 0);
  // console.log('sum error', error, error / errors.length)
  error /= errors.length;
  return error;
}

/**
 * Try constructing a treemap for a data table
 * @param  {Array of Arrays of Positive Numbers} data
 * @return {Number}      The cartographic error associated with the produced tree map
 */
export function checkErrorOfTreemap(data) {
  const treeIzedData = {
    children: data.reduce((acc, row) => acc.concat(row), [])
  };

  const root = hierarchy(treeIzedData).sum(d => d);
  const gons = treemap()(root).descendants().map(leaf => ({
    vertices: [
      {x: leaf.x0, y: leaf.y0},
      {x: leaf.x1, y: leaf.y0},
      {x: leaf.x1, y: leaf.y1},
      {x: leaf.x0, y: leaf.y1}
    ],
    value: leaf.data
  }));

  return round(
    computeErrors(data, gons.filter(({value}) => typeof value === 'number')),
    Math.pow(10, 12)
  );
}
