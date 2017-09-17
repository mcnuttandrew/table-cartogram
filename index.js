// def area(p):
//     return 0.5 * abs(sum(x0*y1 - x1*y0
//                          for ((x0, y0), (x1, y1)) in segments(p)))
//
// def segments(p):
//     return zip(p, p[1:] + [p[0]])

function area(p) {
  const segmentSum = p.reduce((acc, row, index) => {
    const nextRow = p[index % p.length];
    return row.x * nextRow.y + nextRow.x * row.y;
  }, 0);
  return 0.5 * Math.abs(segmentSum)
}

export default function() {
  var height = 1;
  var width = 1;

  function tableCartogram(table) {
    const summedRows = table.map(row => row.reduce((mem, cell) => mem + cell, 0))
    const sumOfAllValues = summedRows.reduce((acc, rowVal) => acc + rowVal, 0);

    const rowSums = summedRows.reduce((acc, row, index) => {
      if (acc.sum > sumOfAllValues / 2) {
        return acc;
      }
      return {
        sum: acc.sum + row,
        index
      };
    }, {sum: 0, index: 0});
    const splitPoint = rowSums.index;

    let subSum = 0;
    for (var i = 0; i < splitPoint; i++) {
      subSum += summedRows[i];
    }
    const lambda = (sumOfAllValues / 2 - subSum) / summedRows[splitPoint];

    const upperSplit = [...new Array(splitPoint)]
      .map((e, i) => table[i])
      .concat([table[splitPoint].map(cell => cell * lambda)]);

    const lowerSplit = [table[splitPoint].map(cell => cell * (1 - lambda))]
      .concat([...new Array(table.length - (splitPoint + 1))].map((e, i) => table[i + splitPoint + 1]));

    const upperSums = [];
    for (let j = 1; j < Math.floor(table[0].length / 2 + 1); j++) {
      const firstSum = upperSplit.reduce((acc, row) => acc + (row[(2 * j - 2) - 1] || 0), 0);
      const secondSum = upperSplit.reduce((acc, row) => acc + (row[(2 * j - 1) - 1] || 0), 0);

      const prevCell = upperSums[upperSums.length -1]
      const runningSum = prevCell ? prevCell.x : 0;
      upperSums.push({x: firstSum + secondSum + runningSum, y: height});
    }

    const lowerSums = [];
    for (let j = 1; j < Math.ceil(table[0].length / 2); j++) {
      const firstSum = lowerSplit.reduce((acc, row) => acc + (row[(2 * j - 1) - 1] || 0), 0);
      const secondSum = lowerSplit.reduce((acc, row) => acc + (row[(2 * j) - 1] || 0), 0);

      const prevCell = lowerSums[lowerSums.length -1]
      const runningSum = prevCell ? prevCell.x : 0;
      lowerSums.push({x: firstSum + secondSum + runningSum, y: 0});
    }

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
    // console.log(zigZag)
    // now do z's
    // B1
    // B2
    const tableMin = table.reduce((acc, row) => row.reduce((mem, cell) => Math.min(mem, cell), acc), Infinity);
    const convexifyValue = 2 * tableMin / sumOfAllValues;
    const zPrimes = zigZag.map(({x, y}, index) => ({x, y: y + (index % 2 ? -1 : 1) * convexifyValue}));
    console.log(convexifyValue, zPrimes)

    return table;
  }

  tableCartogram.size = function(x) {
    // stolen from d3, so check in on that
    return arguments.length ? (width = +x[0], height = +x[1], tableCartogram) : [width, height];
  };

  // padding?

  return tableCartogram;
}
