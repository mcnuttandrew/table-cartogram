import {
  partitionTriangle,
  partitionQuadrangle,
  area,
  findEquidistantPoints,
  deepCopyTable,
  round,
  fractionalInterpolation
} from './utils';

function columnSum(table) {
  const numberOfColumns = table[0].length;
  return table.reduce((sumRow, row) => {
    return row.map((cell, index) => sumRow[index] + cell);
  }, new Array(numberOfColumns).fill(0));
}

function getSumOfAllValues(table) {
  const summedRows = table.map(row => row.reduce((sum, cell) => sum + cell, 0));
  return summedRows.reduce((acc, rowVal) => acc + rowVal, 0);
}

export function getSplitPoint(table) {
  const summedRows = table.map(row => row.reduce((sum, cell) => sum + cell, 0));
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
  // split point (referred to as k in the paper)
  // is the greatest point in such that the preceding rows are less than S/2
  const splitPoint = getSplitPoint(table);
  const lambda = getLambda(splitPoint, table);
  // console.log(splitPoint, lambda)

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
  return {tableTop, tableBottom};
}

function getAreas(left, right, containingPolygon, table, row) {
  // would it be more elegant to destroy the table as we walk down it?
  const beta = table[row][left] || 0;
  const gamma = table[row][right] || 0;
  const alpha = table.slice(row + 1).reduce((sum, trow) => {
    return sum + (trow[left] || 0) + (trow[right] || 0);
  }, 0);

  const containingArea = area(containingPolygon);
  // handle case when sum is zero
  const polygonSum = (alpha + beta + gamma) || 1;

  return {
    alpha: alpha * containingArea / polygonSum,
    beta: beta * containingArea / polygonSum,
    gamma: gamma * containingArea / polygonSum
  };
}

function iterativelyGeneratePartitions(args) {
  const {left, right, points, subTable, isTop, table} = args;

  // this function accesses the values in the main table
  const tableAccessor = (row, column) => {
    return isTop ?
      table[(subTable.length - 1) - row][column] :
      table[((table.length - 1) - (subTable.length - 1)) + row][column];
  };
  const tableLabel = (row, column) => {
    return isTop ?
      {y: (subTable.length - 1) - row, x: column} :
      {y: ((table.length - 1) - (subTable.length - 1)) + row, x: column};
  };
  const partitions = [];
  let currentPoints = points;
  const tableCopy = deepCopyTable(subTable);
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
      partitions.push({
        vertices: partionedArea.beta,
        value: tableAccessor(row, left),
        coords: tableLabel(row, left)
      });
    }
    if (areas.gamma) {
      partitions.push({
        vertices: partionedArea.gamma,
        value: tableAccessor(row, right),
        coords: tableLabel(row, right)
      });
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

    const points = [
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
    const points = [
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
  for (let j = 0; j < Math.floor(m / 2 + 1); j++) {
    // bizzare indices due to paper being in 1 index, and js being in 0 index
    Dt.push((columnSumTop[(2 * (j + 1) - 2) - 1] || 0) + (columnSumTop[(2 * (j + 1) - 1) - 1] || 0));
  }
  const columnSumBottom = columnSum(tableBottom);
  const Db = [];
  for (let l = 1; l < Math.ceil((m + 1) / 2); l++) {
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
  // zigZag.push({x: getSumOfAllValues(table) / 2, y: m % 2 ? height : 0});
  if (zigZag[zigZag.length - 1].x === zigZag[zigZag.length - 2].x) {
    zigZag.pop();
  }
  return zigZag;
}

// use for convexification
export function generateZigZagPrime(table, zigZag, tableTop, tableBottom) {
  const sumOfAllValues = getSumOfAllValues(table);
  const splitPoint = getSplitPoint(table) + 1;
  const tableTopSum = getSumOfAllValues(table.slice(0, splitPoint));
  const tableBottomSum = getSumOfAllValues(table.slice(splitPoint));

  const tableMin = table.reduce((acc, row) =>
    row.reduce((mem, cell) => Math.min(mem, cell), acc), Infinity);
  const zigZagHeight = zigZag[1].y - zigZag[0].y;
  // const splitPoint = getSplitPoint(table);
  // const lambda = getLambda(getSplitPoint(table), table);
  const lambda = tableTopSum / (tableTopSum + tableBottomSum);
  // console.log('????', lambda * zigZagHeight, (1 - lambda) * zigZagHeight)
  const convexifyValue = 2 * tableMin / sumOfAllValues;
  // console.log('zz height', zigZagHeight)
  return zigZag.map(({x, y}, index) => {
    // if the bottom table is empty, just dont draw it at all
    if (!tableBottomSum) {
      return {x, y: 0};
    }
    const newY = lambda > 0.5 ?
        ((!(index % 2) ? convexifyValue : (1 - lambda + convexifyValue)) * zigZagHeight) :
      lambda === 0.5 ?
        lambda * zigZagHeight :
      ((index % 2) ? convexifyValue : lambda - convexifyValue) * zigZagHeight;
    // const newY = (lambda > 0.5 ?
    //   !(index % 2) ? lambda - convexifyValue : (1 - lambda + convexifyValue) :
    //   (index % 2) ? lambda - convexifyValue : (1 - lambda + convexifyValue)) * zigZagHeight;
    // const newY = lambda + (index % 2) ? convexifyValue : -convexifyValue;
    // seems like we could probably math this one out?
    // like it seems likly
    // this is a weird constant one
    // const newY =  (1 - lambda) * zigZagHeig  ht;
    return {
      x,
      y: newY
    };
  });
  // return zigZag.map(({x, y}, index) => ({x, y: y + (index % 2 ? -1 : 1) * convexifyValue}));
}

function generateFPolygons(table, zigZag, zigZagPrime, height) {
  const sumOfAllValues = getSumOfAllValues(table);

  const fPolygons = [{vertices: [
    {x: 0, y: height},
    zigZag[1],
    zigZagPrime[1],
    zigZagPrime[0]
  ]}];
  // the loop bounds account for degenerate polygons on the left and right
  for (let i = 1; i < (zigZag.length - 1); i++) {
    fPolygons.push({
      // the order of the vertices is important!
      vertices: [
        zigZag[i + 1],
        zigZagPrime[i + 1],
        zigZagPrime[i],
        zigZagPrime[i - 1],
        zigZag[i - 1]
      ]
    });
  }
  // add in right-most "degenerate 5-gon", a 4-gon
  fPolygons.push({vertices: [
    {x: sumOfAllValues / 2, y: (zigZag.length % 2) ? height : 0},
    zigZag[zigZag.length - 2],
    zigZagPrime[zigZagPrime.length - 2],
    zigZagPrime[zigZagPrime.length - 1]
  ]});

  // i think i also need to convexify this? whatever that means
  return fPolygons;
}

function getPolygonOutline(vertices, index, maxLen) {
  if (index && (index < maxLen)) {
    return {
      leftA: vertices[4],
      leftB: vertices[3],
      focalPoint: vertices[2],
      rightA: vertices[0],
      rightB: vertices[1]
    };
  }
  const isLeftEdge = !index;

  const virtualLeftA = {x: -vertices[1].x, y: vertices[1].y};
  const virtualLeftB = {x: -vertices[2].x, y: vertices[2].y};

  const farthestX = vertices[0].x;
  const virtualRightA = {x: 2 * farthestX - vertices[1].x, y: vertices[1].y};
  const virtualRightB = {x: 2 * farthestX - vertices[2].x, y: vertices[2].y};
  return {
    leftA: isLeftEdge ? virtualLeftA : vertices[1],
    leftB: isLeftEdge ? virtualLeftB : vertices[2],
    focalPoint: vertices[3],
    rightA: isLeftEdge ? vertices[1] : virtualRightA,
    rightB: isLeftEdge ? vertices[2] : virtualRightB
  };
}

function computeSubDivisionsOfPolygons(table, tableTop, tableBottom, fPolygons) {
  return fPolygons.reduce((acc, polygon, index) => {
    // if (index !== 1) {
    //   return acc;
    // }
    const isTop = !(index % 2);
    const subTable = isTop ? tableTop : tableBottom;
    const tableCopy = deepCopyTable(subTable);
    if (isTop) {
      tableCopy.reverse();
    }
    // okay here it is, right here, we are going to modify the table copy
    const lambda = getLambda(getSplitPoint(table), table);
    tableCopy[0] = tableCopy[0].map(cell => cell / (isTop ? lambda : (1 - lambda)));
    // console.log(tableCopy[])
    const tableAccessor = (rowIndex, column) => {
      return isTop ?
        table[(subTable.length - 1) - rowIndex][column] :
        table[((table.length - 1) - (subTable.length - 1)) + rowIndex][column];
    };
    const numberOfPoints = subTable.length;

    const {
      leftA,
      leftB,
      focalPoint,
      rightB,
      rightA
    } = getPolygonOutline(polygon.vertices, index, fPolygons.length - 1);

    // ternarys denote edge casing
    const isLeftEdge = !index;
    const isRightEdge = index >= (fPolygons.length - 1);

    let leftPoints = findEquidistantPoints(leftB, leftA, numberOfPoints);
    if (numberOfPoints === 1) {
      leftPoints = [leftA];
    }

    let rightPoints = findEquidistantPoints(rightB, rightA, numberOfPoints);
    if (numberOfPoints === 1) {
      rightPoints = [rightA];
    }
    let currentPoints = [leftA, leftB, focalPoint, rightB, rightA];
    // console.log(currentPoints)
    const newPolygons = [];

    // im suspeicous of this
    // dont forget the non edge have been shifted to the left
    const left = isLeftEdge ? (index) : isRightEdge ? index - 1 : index - 1;
    const right = isRightEdge ? index - 1 : index;
    for (let j = (isTop ? 0 : 1); j < numberOfPoints; j++) {
      const areas = getAreas(right, left, currentPoints, tableCopy, j);
      // console.log(areas)
      const interpoints = [leftPoints[j], rightPoints[j]];

      // console.log(currentPoints, interpoints, areas)
      const subPolygons = partitionQuadrangle(currentPoints, interpoints, areas);
      if (!isLeftEdge && areas.beta) {
        newPolygons.push({
          value: tableAccessor(j, left),
          displayValue: `${tableAccessor(j, left)} - ${round(area(subPolygons.beta), Math.pow(10, 3))}`,
          vertices: subPolygons.beta
        });
      }
      if (!isRightEdge && areas.gamma) {
        newPolygons.push({
          value: tableAccessor(j, right),
          displayValue: `${tableAccessor(j, right)} - ${round(area(subPolygons.gamma), Math.pow(10, 3))}`,
          vertices: subPolygons.gamma
        });
      }
      currentPoints = subPolygons.alpha;
    }
    return acc.concat(newPolygons);
  }, []);
}

export default function() {
  let height = 1;
  let width = 1;
  let mode = 'quad';

  function tableCartogram(table) {
    // begin by determining the split point for the table
    // (known as k and lambda in the paper, splitPoint and lambda here)
    // sumOfAllValues is also known as S
    // TODO: paper notes this must be at least 4 check in later
    const {tableTop, tableBottom} = getSplitTable(table);
    const zigZag = generateZigZag(table, tableTop, tableBottom, height);
    if (mode === 'triangle') {
      return generateBaseParition(table, tableTop, tableBottom, zigZag);
    }
    // quad mode
    const zigZagPrime = generateZigZagPrime(table, zigZag, tableTop, tableBottom);
    // console.log(zigZagPrime)
    if (mode === 'zigzag') {
      return zigZagPrime;
    }
    const fPolygons = generateFPolygons(table, zigZag, zigZagPrime, height);

    if (mode === 'polygon') {
      return fPolygons;
    }
    const polys = computeSubDivisionsOfPolygons(table, tableTop, tableBottom, fPolygons);
    return polys;
  }

  tableCartogram.size = function sizeFunction(x) {
    // stolen from d3, so check in on that
    return arguments.length ? (width = +x[0], height = +x[1], tableCartogram) : [width, height];
  };

  // TODO ADD TESTS ABOUT MODE
  tableCartogram.mode = function modeFunction(x) {
    return arguments.length ? (mode = x, tableCartogram) : mode;
  };

  // TODO padding?
  // TODO steal other d3 args

  return tableCartogram;
}
