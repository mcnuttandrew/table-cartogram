/**
 * Support React 0.13 and greater where refs are React components, not DOM
 * @param {*} ref React's ref.
 * @returns {Array} DOM element.
 */
export function findEquidistantPoints(left, right, numberOfPoints) {
  const slope = (right.y - left.y) / (right.x - left.x);
  const offset = left.y - slope * left.x;
  const xRange = right.x - left.x;
  const yRange = right.y - left.y;
  const slopeIsVertical = Number.isNaN(slope) || Math.abs(slope) === Infinity;

  const points = [];
  for (var i = 0; i < numberOfPoints; i++) {
    const fraction = i / (numberOfPoints - 1);
    const xVal = fraction * xRange + left.x;
    const newPoint = {
      x: slopeIsVertical ? left.x : xVal,
      y: slopeIsVertical ? fraction * yRange + left.y : (slope * xVal + offset)
    }
    points.push(newPoint)
  }
  return points;
}

function area(p) {
  // compute double the signed area for the polygon
  const segmentSum = p.reduce((acc, row, index) => {
    const nextRow = p[index % p.length];
    return row.x * nextRow.y + nextRow.x * row.y;
  }, 0);
  return 0.5 * Math.abs(segmentSum)
}

export function getSplitPoint(summedRows, sumOfAllValues) {
  const rowSums = summedRows.reduce((acc, row, index) => {
    if (acc.sum > sumOfAllValues / 2) {
      return acc;
    }
    return {
      sum: acc.sum + row,
      index
    };
  }, {sum: 0, index: 0});
  return rowSums.index;
}

export function generateDtDb(table, splitPoint, lambda, height) {
  // then go ahead and split the table in two
  // (at and ab in paper, upperSplit and lowerSplit here)
  const upperSplit = [...new Array(splitPoint)]
    .map((e, i) => table[i])
    .concat([table[splitPoint].map(cell => cell * lambda)]);

  const lowerSplit = [table[splitPoint].map(cell => cell * (1 - lambda))]
    .concat([...new Array(table.length - (splitPoint + 1))].map((e, i) => table[i + splitPoint + 1]));

  // also called D^t
  const upperSums = [];
  for (let j = 1; j < Math.floor(table[0].length / 2 + 1); j++) {
    const firstSum = upperSplit.reduce((acc, row) => acc + (row[(2 * j - 2) - 1] || 0), 0);
    const secondSum = upperSplit.reduce((acc, row) => acc + (row[(2 * j - 1) - 1] || 0), 0);

    const prevCell = upperSums[upperSums.length -1]
    const runningSum = prevCell ? prevCell.x : 0;
    upperSums.push({x: firstSum + secondSum + runningSum, y: height});
  }

  // also called D^b
  const lowerSums = [];
  for (let j = 1; j < Math.ceil(table[0].length / 2); j++) {
    const firstSum = lowerSplit.reduce((acc, row) => acc + (row[(2 * j - 1) - 1] || 0), 0);
    const secondSum = lowerSplit.reduce((acc, row) => acc + (row[(2 * j) - 1] || 0), 0);

    const prevCell = lowerSums[lowerSums.length -1]
    const runningSum = prevCell ? prevCell.x : 0;
    lowerSums.push({x: firstSum + secondSum + runningSum, y: 0});
  }

  return {Db: lowerSums, Dt: upperSums};
}

export function generateZigZag(lowerSums, upperSums, table, sumOfAllValues, height) {
  const zigZag = [{x: 0, y: 0}];
  lowerSums.reverse();
  upperSums.reverse();
  while (lowerSums.length || upperSums.length) {
    if (upperSums.length) {
      zigZag.push(upperSums.pop())
    }
    if (lowerSums.length) {
      zigZag.push(lowerSums.pop())
    }
  }

  zigZag.push({x: sumOfAllValues / 2, y: table[0].length % 2 ? height : 0});
  return zigZag;
}

export function generateZigZagPrime(table, sumOfAllValues, zigZag) {
  const tableMin = table.reduce((acc, row) => row.reduce((mem, cell) => Math.min(mem, cell), acc), Infinity);
  const convexifyValue = 2 * tableMin / sumOfAllValues;
  return zigZag.map(({x, y}, index) => ({x, y: y + (index % 2 ? -1 : 1) * convexifyValue}));
}


export default function() {
  var height = 1;
  var width = 1;

  function tableCartogram(table) {
    // begin by determining the split point for the table
    // (known as k and lambda in the paper, splitPoint and lambda here)
    const summedRows = table.map(row => row.reduce((mem, cell) => mem + cell, 0))
    const sumOfAllValues = summedRows.reduce((acc, rowVal) => acc + rowVal, 0);
    const splitPoint = getSplitPoint(summedRows, sumOfAllValues);
    // ugh refactor
    let subSum = 0;
    for (var i = 0; i < splitPoint; i++) {
      subSum += summedRows[i];
    }
    const lambda = (sumOfAllValues / 2 - subSum) / summedRows[splitPoint];
    // then go ahead and split the table in two
    // (at and ab in paper, upperSplit and lowerSplit here)
    const upperSplit = [...new Array(splitPoint)]
      .map((e, i) => table[i])
      .concat([table[splitPoint].map(cell => cell * lambda)]);

    const lowerSplit = [table[splitPoint].map(cell => cell * (1 - lambda))]
      .concat([...new Array(table.length - (splitPoint + 1))].map((e, i) => table[i + splitPoint + 1]));
    const columnSums = generateDtDb(table, splitPoint, lambda, height);
    const zigZag = generateZigZag(columnSums.Db, columnSums.Dt, table, sumOfAllValues, height);
    // we now modify the zigzag to create an inner line, zprime in paper, zigZagPrime here
    // this process involves selecting a "convexifyValue", known as v, in the paper
    // that is subserviant to conditions B1 and B2, here we just use B2 bc its stronger
    const zigZagPrime = generateZigZagPrime(table, sumOfAllValues, zigZag);
    // zigZag union zigZagPrime forms the "skeleton" of the cartogram
    // we use this union to form the consitutant polygons

    // regenerate
    // const {Db, Dt} = generateDtDb(table, splitPoint, lambda, height);
    // add in left-most "degenerate 5-gon", a 4-gon
    const fPolygons = [{vertices: [
      {x: 0, y: height},
      zigZag[1],
      zigZagPrime[1],
      zigZagPrime[0],
    ]}];
    // the strangeness of the loop bounds is justified by the including of the
    // degenerate polygons on the left and right
    for (let i = 1; i < (zigZag.length - 1); i++) {
      const k = table.length - (splitPoint + 1);
      // if odd k, if even m - k
      // m might be wrong here
      const numberOfPoints = i % 2 ? k : (table[0].length - k);
      const leftPoints = findEquidistantPoints(zigZag[i - 1], zigZagPrime[i - 1], numberOfPoints);
      const rightPoints = findEquidistantPoints(zigZag[i + 1], zigZagPrime[i + 1], numberOfPoints);

      let alpha = table.reduce((acc, row) => acc + row[i] + row[i + 1], 0);
      let beta = table[table.length - 1][i];
      let gamma = table[table.length - 1][i + 1];
      for (var j = 0; j < numberOfPoints; j++) {
        // magic construction here for how to find point

        alpha = alpha - beta - gamma;
        beta = table[table.length - 1 - j][i];
        gamma = table[table.length - 1 - j][i + 1];
      }

      // console.log(leftPoints, rightPoints)
      // fPolygons.push({
      //   vertices: [
      //     zigZag[i - 1],
      //     zigZag[i + 1],
      //     zigZagPrime[i + 1],
      //     zigZagPrime[i],
      //     zigZagPrime[i - 1]
      //   ]
      // })
    }
    // add in right-most "degenerate 5-gon", a 4-gon
    fPolygons.push({vertices: [
      {x: sumOfAllValues / 2, y: (zigZag.length % 2) ? height : 0},
      zigZag[zigZag.length - 2],
      zigZagPrime[zigZagPrime.length - 2],
      zigZagPrime[zigZagPrime.length - 1],
    ]});

    // we now subdivide these polygons to create the cartogram cells

    // console.log(JSON.stringify(fPolygons, null, 2))
    // i think i also need to convexify this? whatever that means
    // const areas = fPolygons.map(({vertices}) => area(vertices));
    // console.log(areas)
    return fPolygons;
  }

  tableCartogram.size = function(x) {
    // stolen from d3, so check in on that
    return arguments.length ? (width = +x[0], height = +x[1], tableCartogram) : [width, height];
  };

  // padding?

  return tableCartogram;
}
