import {round, computeErrors} from '../iterative-methods/utils';
import {hierarchy, treemap} from 'd3-hierarchy';

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
    computeErrors(data, gons.filter(({value}) => typeof value === 'number'), d => d),
    Math.pow(10, 12)
  );
}
