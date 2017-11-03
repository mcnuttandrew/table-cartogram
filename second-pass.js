import {
  partitionTriangle,
  partitionQuadrangle,
  area,
  findEquidistantPoints
} from './utils';

function columnSum(table) {
  const numberOfColumns = table[0].length;
  return table.reduce((sumRow, row) =>{
    return row.map((cell, index) => sumRow[index] + cell);
  }, new Array(numberOfColumns).fill(0));
}

function getSumOfAllValues(table) {
  const summedRows = table.map(row => row.reduce((sum, cell) => sum + cell, 0))
  return summedRows.reduce((acc, rowVal) => acc + rowVal, 0);
}

export function getSplitPoint(table) {
  const summedRows = table.map(row => row.reduce((sum, cell) => sum + cell, 0))
  const sumOfAllValues = getSumOfAllValues(table);

  let k = 0;
  let subSum = 0;
  while (subSum < sumOfAllValues / 2) {
    subSum += summedRows[k];
    k++;
  }
  return (k - 1);
}

export function getLambda(splitPoint, table) {
  const summedRows = table.map(row => row.reduce((sum, cell) => sum + cell, 0));
  const sumOfAllValues = getSumOfAllValues(table);
  let subSum = 0;
  for (let i = 0; i < splitPoint; i++) {
    subSum += summedRows[i];
  }

  return (sumOfAllValues / 2 - subSum) / summedRows[splitPoint];
}

export function getSplitTable(table) {
  const splitPoint = getSplitPoint(table);
  const lambda = getLambda(splitPoint, table);

  const tableTop = [];
  for (let i = 0; i < splitPoint; i++) {
    tableTop.push(table[i]);
  }
  const finalRow = table[splitPoint].map(val => lambda * val);
  tableTop.push(finalRow);

  const tableBottom = [];
  const topRow = table[splitPoint].map(val => (1 - lambda) * val);
  tableBottom.push(topRow);
  // these loop bounds seems wrong
  for (let i = (splitPoint + 1); i < table.length; i++) {
    tableBottom.push(table[i]);
  }
  return {tableTop, tableBottom}
}

function getAreas(left, right, containingPolygon, table, row) {
  // would it be more elegant to destroy the table as we walk down it?
  const beta = table[row][left] || 0;
  const gamma = table[row][right] || 0;
  const alpha = table.slice(row + 1).reduce((sum, row) => {
    return sum + (row[left] || 0) + (row[right] || 0)
  }, 0);

  const containingArea = area(containingPolygon);
  const polygonSum = alpha + beta + gamma;

  return {
    alpha: alpha * containingArea / polygonSum,
    beta: beta * containingArea / polygonSum,
    gamma: gamma * containingArea / polygonSum
  };
}

function deepCopyTable(table) {
  return table.reduce((acc, row) => acc.concat([row.slice(0)]), []);
}

function iterativelyGeneratePartitions(args) {
  const {left, right, points, subTable, isTop, table} = args;

  // this function accesses the values in the main table
  const tableAccessor = (row, column) => {
    return isTop ?
      table[(subTable.length - 1) - row][column] :
      table[((table.length - 1) - (subTable.length - 1)) + row][column]
  }
  const partitions = []
  let currentPoints = points;
  const tableCopy =  deepCopyTable(subTable);
  // if we are above the zig zag, we need to build in the opposite order
  if (isTop) {
    tableCopy.reverse();
  }

  for (let row = isTop ? 0 : 1; row < tableCopy.length; row++) {
    const areas = getAreas(left, right, currentPoints, tableCopy, row);
    const partionedArea = partitionTriangle(currentPoints, areas);
    // maybe use a concat instead?
    // now is the time to associate the value of the cells with the partitions
    // not accurately mapping value to table value?

    // if we find a size zero polygon, ignore it
    if (areas.beta) {
      partitions.push({vertices: partionedArea.beta, value: tableAccessor(row, left)});
    }
    if (areas.gamma) {
      partitions.push({vertices: partionedArea.gamma, value: tableAccessor(row, right)});
    }
    // use the alpha as the next area to sub-divide against
    currentPoints = partionedArea.alpha;
  }
  return partitions;
}

function generateBaseParition(table, tableTop, tableBottom, zigZag) {
  const m = tableTop[0].length;
  const zigZagUpperLeft = {x: 0, y: zigZag[1].y};
  const zigZagUpperRight = {x: zigZag[zigZag.length - 1].x, y: zigZag[1].y};
  // 0 and 1 are used in the proof bc the table is only mx2
  let partitions = [];
  // top
  for (let j = 1; j <= Math.floor(m / 2 + 1); j++) {
  // for (let j = Math.floor(m / 2 + 1); j >= 1; j--) {
    const left = (2 * j - 1) - 1;
    const right = (2 * j - 2) - 1;

    let points = [
      zigZag[2 * j - 2],
      zigZag[2 * j - 3] || zigZagUpperLeft,
      zigZag[2 * j - 1] || zigZagUpperRight
    ];
    partitions = partitions.concat(
      iterativelyGeneratePartitions({
        left,
        right,
        points,
        subTable: tableTop,
        isTop: true,
        table
      })
    );
  }
  // bottom
  for (let l = 1; l <= Math.ceil(m / 2); l++) {
    const left = (2 * l) - 1;
    const right = (2 * l - 1) - 1;
    let points = [
      zigZag[2 * l - 1],
      zigZag[2 * l - 2] || zigZagUpperLeft,
      zigZag[2 * l] || zigZagUpperRight
    ];
    partitions = partitions.concat(
      iterativelyGeneratePartitions({
        left,
        right,
        points,
        subTable: tableBottom,
        isTop: false,
        table
      })
    );
  }

  return partitions;
}

export function generateZigZag(table, tableTop, tableBottom, height) {
  const m = tableTop[0].length;
  // build column sums
  const Dt = [];
  const columnSumTop = columnSum(tableTop);
  for (let j = 1; j < Math.floor(m / 2 + 1); j++) {
    Dt.push((columnSumTop[(2 * j - 2) - 1] || 0) + (columnSumTop[(2 * j - 1) - 1] || 0));
  }
  const columnSumBottom = columnSum(tableBottom);
  const Db = [];
  for (let l = 1; l < Math.ceil(m / 2); l++) {
    Db.push((columnSumBottom[(2 * l - 1) - 1] || 0) + (columnSumBottom[(2 * l) - 1] || 0));
  }
  // generate zigzag
  const zigZag = [{x: 0, y: 0}];
  const summedDt = Dt.reduce((row, val) => row.concat((row[row.length - 1] || 0) + val), []);
  const summedDb = Db.reduce((row, val) => row.concat((row[row.length - 1] || 0) + val), []);
  // remember, reverse is mutatation
  summedDt.reverse();
  summedDb.reverse();
  while (summedDt.length || summedDb.length) {
    if (summedDt.length) {
      zigZag.push({x: summedDt.pop(), y: height});
    }
    if (summedDb.length) {
      zigZag.push({x: summedDb.pop(), y: 0});
    }
  }
  zigZag.push({x: getSumOfAllValues(table) / 2, y: m % 2 ? height : 0});
  return zigZag;
}

// use for convexification
export function generateZigZagPrime(table, zigZag) {
  const sumOfAllValues = getSumOfAllValues(table);
  const tableMin = table.reduce((acc, row) => row.reduce((mem, cell) => Math.min(mem, cell), acc), Infinity);
  const convexifyValue = 2 * tableMin / sumOfAllValues;
  return zigZag.map(({x, y}, index) => ({x, y: y + (index % 2 ? -1 : 1) * convexifyValue}));
}

function generateFPolygons(table, zigZag, zigZagPrime) {
  const sumOfAllValues = getSumOfAllValues(table);
  // TODO FIX
  const height = 1;

  const fPolygons = [{vertices: [
    {x: 0, y: height},
    zigZag[1],
    zigZagPrime[1],
    zigZagPrime[0],
  ]}];
  // the loop bounds account for degenerate polygons on the left and right
  for (let i = 1; i < (zigZag.length - 1); i++) {
    fPolygons.push({
      vertices: [
        // zigZag[i - 1],
        // zigZag[i + 1],
        // zigZagPrime[i + 1],
        // zigZagPrime[i],
        // zigZagPrime[i - 1]
        zigZag[i + 1],
        zigZagPrime[i + 1],
        zigZagPrime[i],
        zigZagPrime[i - 1],
        zigZag[i - 1]
      ]
    })
  }
  // add in right-most "degenerate 5-gon", a 4-gon
  fPolygons.push({vertices: [
    {x: sumOfAllValues / 2, y: (zigZag.length % 2) ? height : 0},
    zigZag[zigZag.length - 2],
    zigZagPrime[zigZagPrime.length - 2],
    zigZagPrime[zigZagPrime.length - 1],
  ]});

  // i think i also need to convexify this? whatever that means
  return fPolygons;
}

function computeSubDivisionsOfPolygons(table, tableTop, tableBottom, fPolygons) {
  return fPolygons.reduce((acc, polygon, index) => {
    // TODO handle edges
    // if (!index || index === fPolygons.length - 1) {
    if (index === fPolygons.length - 1) {
      return acc;//.concat(polygon);
    }
    const isTop = index % 2;
    const isEdgePiece = !index || index === fPolygons.length - 1;
    const subTable = isTop ? tableTop : tableBottom;
    const tableCopy =  deepCopyTable(subTable);
    const numberOfPoints = subTable.length;
    let currentPoints = polygon.vertices;
    // zigZag[i + 1],
    // zigZagPrime[i + 1],
    // zigZagPrime[i],
    // zigZagPrime[i - 1],
    // zigZag[i - 1]
    // this edge stuff is wrong
    const leftA = !isEdgePiece ? currentPoints[4] : currentPoints[0];
    const leftB = !isEdgePiece ? currentPoints[3] : currentPoints[3];
    const rightA = !isEdgePiece ? currentPoints[0] : currentPoints[1];
    const rightB = !isEdgePiece ? currentPoints[1] : currentPoints[2];
    const focalPoint = !isEdgePiece ? currentPoints[2] : currentPoints[3]
    const leftPoints = findEquidistantPoints(leftB, leftA, numberOfPoints);
    const rightPoints = findEquidistantPoints(rightB, rightA, numberOfPoints);
    currentPoints = [leftA, leftB, focalPoint, rightB, rightA];


    const newPolygons = [];

    // might need ot adjust
    // const lrIndex = isTop ? Math.floor(index / 2) + 1 : Math.ceil(index / 2);
    // const left = isTop ? (2 * lrIndex - 1) - 1 : (2 * lrIndex) - 1;
    // const right = isTop ? (2 * lrIndex - 2) - 1 : (2 * lrIndex - 1) - 1;
    const left = index;
    const right = index + 1;

    for (let j = 0; j < numberOfPoints; j++) {
      // add handling for edges
      const areas = getAreas(left, right, currentPoints, tableCopy, j);
      const interpoints = [leftPoints[j], rightPoints[j]];
      const subPolygons = partitionQuadrangle(currentPoints, interpoints, areas);
      if (subPolygons.beta) {
        newPolygons.push({value: 0, vertices: subPolygons.beta});
      }
      if (subPolygons.gamma) {
        newPolygons.push({value: 0, vertices: subPolygons.gamma});
      }
      // console.log(subPolygons.beta.length, subPolygons.gamma.length)
      currentPoints = subPolygons.alpha;
    }
    return acc.concat(newPolygons);
  }, []);
}

export default function() {
  var height = 1;
  var width = 1;

  function tableCartogram(table) {
    // begin by determining the split point for the table
    // (known as k and lambda in the paper, splitPoint and lambda here)
    // const summedRows = table.map(row => row.reduce((sum, cell) => sum + cell, 0))
    // sumOfAllValues is also known as S
    // TODO: paper notes this must be at least 4 check in later
    const {tableTop, tableBottom} = getSplitTable(table);
    const zigZag = generateZigZag(table, tableTop, tableBottom, height);
    const zigZagPrime = generateZigZagPrime(table, zigZag);
    // const partitions = generateBaseParition(table, tableTop, tableBottom, zigZag);
    // return partitions
    const fPolygons = generateFPolygons(table, zigZag, zigZagPrime);
    return computeSubDivisionsOfPolygons(table, tableTop, tableBottom, fPolygons);
  }

  tableCartogram.size = function(x) {
    // stolen from d3, so check in on that
    return arguments.length ? (width = +x[0], height = +x[1], tableCartogram) : [width, height];
  };

  // TODO padding?
  // TODO steal other d3 args

  return tableCartogram;
}
