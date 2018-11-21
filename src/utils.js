import pointInPolygon from 'point-in-polygon';
import {union} from 'polybooljs';

/* eslint-disable complexity */
/**
 * Reformat a vector representation of a layout into a table representation
 * @param  {Array of Numbers} vector The vector to reconstruct, size 2 n m - 2
 * @param  {Array of Array of Numbers} targetTable The input data table
 * @param  {Number} height the coordinate space measurement of the upper edge of the table
 * @param  {Number} width the coordinate space measurement of the right edge of the table
 * @return {Array of Array of {x: Number, y: Number}} The (n + 1) x (m + 1) table of coordinates
 */
export function translateVectorToTable(vector, targetTable, height, width) {
  // vector index tracks the position in the vector as the double loop moves across
  // the form of the output table
  let vectorIndex = 0;
  const newTable = [];
  for (let i = 0; i <= targetTable.length; i++) {
    const newRow = [];
    for (let j = 0; j <= targetTable[0].length; j++) {
      const inFirstRow = i === 0;
      const inLeftColumn = j === 0;
      const inRightColumn = j === targetTable[0].length;
      const inLastRow = i === targetTable.length;
      const inCorner = ((inFirstRow && (inLeftColumn || inRightColumn))) ||
              ((inLastRow && (inLeftColumn || inRightColumn)));
      if (inCorner) {
        newRow.push({x: inLeftColumn ? 0 : width, y: inFirstRow ? 0 : height});
      } else if (inFirstRow || inLastRow) {
        newRow.push({x: vector[vectorIndex], y: inFirstRow ? 0 : height});
        vectorIndex = vectorIndex + 1;
      } else if (inLeftColumn || inRightColumn) {
        newRow.push({x: inLeftColumn ? 0 : width, y: vector[vectorIndex]});
        vectorIndex = vectorIndex + 1;
      } else {
        newRow.push({x: vector[vectorIndex], y: vector[vectorIndex + 1]});
        vectorIndex = vectorIndex + 2;
      }
    }
    newTable.push(newRow);
  }
  return newTable;
}

/**
 * Translate a table representation of a layout into a vector representation
 * Vector representation is useful for numerics
 * @param  {Array of Array of {x: Number, y: Number}} table the table representation (n + 1) x (m + 1)
 * @return {Array of Numbers} vector representation 2 m n - 2
 */
export function translateTableToVector(table) {
  const vector = [];
  for (let i = 0; i < table.length; i++) {
    for (let j = 0; j < table[0].length; j++) {
      const inFirstRow = i === 0;
      const inLeftColumn = j === 0;
      const inRightColumn = j === (table[0].length - 1);
      const inLastRow = i === (table.length - 1);

      const inCorner = ((inFirstRow && (inLeftColumn || inRightColumn))) ||
              ((inLastRow && (inLeftColumn || inRightColumn)));

      const cell = table[i][j];
      if (inCorner) {
        // do nothing
      } else if (inFirstRow || inLastRow) {
        vector.push(cell.x);
      } else if (inLeftColumn || inRightColumn) {
        vector.push(cell.y);
      } else {
        vector.push(cell.x);
        vector.push(cell.y);
      }
    }
  }
  return vector;
}

/**
 * Get a list of indices that are in the current coordinate descent phase
 * Coordinate descent executes gradient descent on four sets maximally independent sets
 * There computation is akin to walking around the edge of a box
 * @param  {Array of Array of {x: Number, y: Number}} table Table representation of the current phase
 * @param  {Number in [0, 3]} phase which of the four coordinate descent phases being computed
 * @return {Array of indices (numbers)} the indices in the numeric vector that are in phase
 */
export function getIndicesInVectorOfInterest(table, phase) {
  /* eslint-disable max-depth */
  const vector = [];
  let vecIdx = 0;
  for (let i = 0; i < table.length; i++) {
    for (let j = 0; j < table[0].length; j++) {
      const inFirstRow = i === 0;
      const inLeftColumn = j === 0;
      const inRightColumn = j === (table[0].length - 1);
      const inLastRow = i === (table.length - 1);

      const inCorner = ((inFirstRow && (inLeftColumn || inRightColumn))) ||
              ((inLastRow && (inLeftColumn || inRightColumn)));

      const evenRow = (i % 2);
      const evenColumn = (j % 2);
      const inPhase = ((phase < 2 && !evenRow) || (phase >= 2 && evenRow)) && (evenColumn === (phase % 2));
      if (inCorner) {
        // do nothing
      } else if (inFirstRow || inLastRow) {
        if (inPhase) {
          vector.push(vecIdx);
        }
        vecIdx += 1;
      } else if (inLeftColumn || inRightColumn) {
        if (inPhase) {
          vector.push(vecIdx);
        }
        vecIdx += 1;
      } else {
        if (inPhase) {
          vector.push(vecIdx);
          vector.push(vecIdx + 1);
        }
        vecIdx += 2;
      }
    }
  }
  /* eslint-disable max-depth */
  return vector;
}

/**
 * Transform a table of coordinates into table of rectangles
 * @param  {Array of Array of {x: Number, y: Number}} table The table to manipulate
 * @return {Array of Array of [{x: Number, y: Number}]} table of rectangles
 */
export function getRectsFromTable(table) {
  const rects = [];
  for (let i = 0; i < table.length - 1; i++) {
    const rowRects = [];
    for (let j = 0; j < table[0].length - 1; j++) {

      rowRects.push([
        table[i][j],
        table[i + 1][j],
        table[i + 1][j + 1],
        table[i][j + 1]
      ]);
    }
    rects.push(rowRects);
  }
  return rects;
}

export function findSumForTable(areas) {
  return areas.reduce((sum, row) => row.reduce((acc, cell) => acc + cell, sum), 0);
}

export function findMaxForTable(areas) {
  return areas.reduce((max, row) => row.reduce((acc, cell) => Math.max(acc, cell), max), -Infinity);
}

const diffVecs = (a, b) => ({x: a.x - b.x, y: a.y - b.y});
const dotVecs = (a, b) => a.x * b.x + a.y * b.y;
const normVec = a => Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2));
/**
 * Evaluate whether a rectange has concave angles
 * @param  {Array of {x: Number, y: Number}} rect Rectange to check for concave angles
 * @return {Boolean}
 */
export function checkForConcaveAngles(rect) {
  for (let i = 1; i < 4; i++) {
    const aVec = diffVecs(rect[i], rect[i - 1]);
    const bVec = diffVecs(rect[i], rect[(i + 1) === 4 ? 0 : (i + 1)]);
    const cosVal = dotVecs(aVec, bVec) / (normVec(aVec) * normVec(bVec));
    const angle = Math.acos(cosVal);
    if (angle >= Math.PI) {
      return true;
    }
  }
  return false;
}

/**
 * Transpose a given matrix
 * @param  {Array of Arrays} mat matrix to transpose
 * @return {Array of Arrays}     transposed matrix
 */
export const transposeMatrix = mat => mat[0].map((col, i) => mat.map(row => row[i]));

/** Compute the area for a polygon with no holes
 * @param {array} points - array of objects formatted {x, y}
 * @returns {Number} the computed area
 */
export function area(points) {
  return Math.abs(signedArea(points));
}

export function signedArea(points) {
  const segmentSum = points
  .reduce((acc, row, index) => {
    const nextRow = points[(index + 1) % points.length];
    return acc + (row.x * nextRow.y - nextRow.x * row.y);
  }, 0);
  return 0.5 * segmentSum;
}

/** Round a value
 * @param {number} number - the number to be rounded
 * @param {number} precision - the precision of the rounding, expressed in powers of 10
 * @returns {number} the rounded value
 */
export function round(number, precision = Math.pow(10, 12)) {
  return Math.floor(number * precision) / precision;
}

const avgPoints = (a, b) => ({x: (a.x + b.x) / 2, y: (a.y + b.y) / 2});
const dist = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

function diagCenter(points) {
  const diag1 = avgPoints(points[0], points[2]);
  const diag2 = avgPoints(points[1], points[3]);
  return dist(points[0], points[2]) < dist(points[1], points[3]) ? diag1 : diag2;
}

/** Compute geometric center of a polygon
 * @param {array} points - list of points in polygon, present as {x, y}
 * @returns {object} center point of polygon
 */
export function geoCenter(points) {
  const sum = points.reduce((center, row) => {
    return {x: center.x + row.x, y: center.y + row.y};
  }, {x: 0, y: 0});
  const centerPoint = {x: sum.x / points.length, y: sum.y / points.length};
  return pointInPolygon(centerPoint, points) ? centerPoint : diagCenter(points);
}

/**
 * Transform a modeled table into an array of polygons
 * @param {Array of Array of {x: Number, y: Number}} outputTable [description]
 * @param {Array of Array of Numbers} table input data table
 * @param {Function} accessor retrive the data value from the original table
 * @return {Array of {vertices: [{x: Number, y: Number}], value: Number}}}
 */
export function prepareRects(outputTable, table, accessor) {
  const rects = [];
  for (let i = 0; i < outputTable.length - 1; i++) {
    for (let j = 0; j < outputTable[0].length - 1; j++) {
      const newRect = [
        outputTable[i][j],
        outputTable[i + 1][j],
        outputTable[i + 1][j + 1],
        outputTable[i][j + 1]
      ];

      rects.push(table ? {
        vertices: newRect,
        value: accessor(table[i][j]),
        data: table[i][j]
      } : newRect);
    }
  }
  return rects;
}

/**
 * Computes the average cartographic error for a particular table arrangement
 * @param  {Array of Arrays of Numbers} data The input table
 * @param  {Array of Arrays of Numbers} gons The test layout
 * @param  {Function} accessor get the value
 * @param  {Object: {height: Number, width: Number}} dims
 *  - The dimensions of the table cartogram being assembled
 * @return {Number} the average error for the test layout
 */
export function computeErrors(data, gons, accessor, dims) {
  const tableSum = data.reduce((acc, row) => acc + row.reduce((mem, cell) => accessor(cell) + mem, 0), 0);
  let maxError = -Infinity;
  let sumError = 0;
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[0].length; j++) {
      const gonArea = area(gons[i * data[0].length + j].vertices);
      const expectedArea = accessor(data[i][j]) / tableSum;
      const computedArea = gonArea / (dims.height * dims.width);
      const computedErr = Math.abs(computedArea - expectedArea) / Math.max(computedArea, expectedArea);
      sumError += computedErr;
      if (maxError < computedErr) {
        maxError = computedErr;
      }
    }
  }

  return {
    error: sumError / (data.length * data[0].length),
    maxError
  };
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}
const DETERMINISTIC = false;
export const phaseShuffle = DETERMINISTIC ? () => [0, 1, 2, 3] : () => shuffle([0, 1, 2, 3]);

export function trace(mat) {
  let ret = 0;
  for (let i = 0; i < mat.length; i++) {
    ret += Math.abs(mat[i][i]);
  }
  return ret;
}

/* eslint-disable no-console */
export function log(content) {
  console.log(...content);
}

export function error(content) {
  console.error(...content);
}
/* eslint-enable no-console */

/** Generate a polygon
 * @param {number} number - the number of sides in the polygon
 * @param {number} radius - the radius of the polygon
 * @param {object} offset - the offset of the polygon from zero, {x, y}
 * @returns {array} list of points in polygon
 */
export function generatePolygon(numberOfSides, radius, offset) {
  return new Array(numberOfSides).fill(0).map((point, index) => {
    const angle = Math.PI * 2 * index / numberOfSides + Math.PI / 3;
    return {x: radius * Math.cos(angle) + offset.x, y: radius * Math.sin(angle) + offset.y};
  });
}

export function fusePolygons(polygons, accessor) {
  const gonGroups = polygons.reduce((acc, row) => {
    const key = accessor(row);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(row);
    return acc;
  }, {});

  const fusions = Object.entries(gonGroups).reduce((acc, row) => {
    const accumlator = {
      regions: [[]],
      inverted: false
    };
    acc[row[0]] = row[1].reduce((mem, d) => union({
      regions: [d.vertices.map(vertex => [vertex.x, vertex.y])],
      inverted: false
    }, mem), accumlator).regions[0].map(d => ({x: d[0], y: d[1]}));
    return acc;
  }, {});

  return Object.entries(fusions).map(row => ({
    vertices: row[1],
    key: row[0]
  }));
}
