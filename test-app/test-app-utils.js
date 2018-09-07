import {area} from '../old-stuff/utils';

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
      const computedErr = Math.abs(gonArea - expectedAreas[i][j]) / Math.max(gonArea, expectedAreas[i][j]);
      errors.push(computedErr);
    }
  }
  let error = errors.reduce((acc, row) => acc + row, 0);
  // console.log('sum error', error, error / errors.length)
  error /= errors.length;
  return error;
}
