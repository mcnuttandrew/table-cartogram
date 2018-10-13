import pointInPolygon from 'point-in-polygon';

function continuousMax(x, y) {
  return 0.5 * (x + y + Math.abs(x - y));
}

function expPenalty(x) {
  return continuousMax(0, -x) * Math.exp(-x) * 100;
}

/**
 * Determine where an index (j, i) is in a table
 * @param  {Array of Arrays} table - table in question
 * @param  {Number} i     - the y or vertical index
 * @param  {Number} j     - the x or horizontal index
 * @return {Object}
 */
function computeEdges(table, i, j) {
  const inFirstRow = i === 0;
  const inLeftColumn = j === 0;

  const inRightColumn = j === (table[0].length - 1);
  const inLastRow = i === (table.length - 1);
  const inCorner = ((inFirstRow && (inLeftColumn || inRightColumn))) ||
          ((inLastRow && (inLeftColumn || inRightColumn)));

  return {
    inFirstRow,
    inLeftColumn,
    inRightColumn,
    inLastRow,
    inCorner
  };
}

function continOverlapPenalty(props) {
  const {
    cell,
    newTable,
    inCorner,
    inFirstRow,
    inLastRow,
    i,
    j,
    inLeftColumn,
    inRightColumn
  } = props;
  let neighbors = [];
  if (inCorner) {
    // no penaltys for corners, they are not manipualted
  } else if (inFirstRow) {
    neighbors = [
      {y: -newTable[i + 1][j - 1].y, x: newTable[i + 1][j - 1].x},
      {y: -newTable[i + 1][j + 1].y, x: newTable[i + 1][j + 1].x},
      newTable[i][j + 1],
      newTable[i + 1][j + 1],
      newTable[i + 1][j],
      newTable[i + 1][j - 1],
      newTable[i][j - 1]
    ];
  } else if (inLastRow) {
    const delta = Math.max(
      Math.abs(newTable[i - 1][j - 1].y - newTable[i][j - 1].y),
      Math.abs(newTable[i - 1][j + 1].y - newTable[i][j + 1].y)
    );
    neighbors = [
      newTable[i - 1][j - 1],
      newTable[i - 1][j],
      newTable[i - 1][j + 1],
      newTable[i][j + 1],
      {x: newTable[i][j + 1].x, y: newTable[i][j + 1].y + delta},
      {x: newTable[i][j - 1].x, y: newTable[i][j - 1].y + delta},
      newTable[i][j - 1]
    ];
  } else if (inLeftColumn) {
    neighbors = [
      {x: -newTable[i - 1][j + 1].x, y: newTable[i - 1][j + 1].y},
      newTable[i - 1][j],
      newTable[i - 1][j + 1],
      newTable[i][j + 1],
      newTable[i + 1][j + 1],
      newTable[i + 1][j],
      {x: -newTable[i + 1][j + 1].x, y: newTable[i + 1][j + 1].y}
    ];
  } else if (inRightColumn) {
    const delta = Math.max(
      Math.abs(newTable[i - 1][j - 1].x - newTable[i - 1][j].x),
      Math.abs(newTable[i + 1][j - 1].x - newTable[i + 1][j].x)
    );
    neighbors = [
      newTable[i - 1][j - 1],
      newTable[i - 1][j],
      {x: newTable[i - 1][j].x + delta, y: newTable[i - 1][j].y},
      {x: newTable[i + 1][j].x + delta, y: newTable[i + 1][j].y},
      newTable[i + 1][j],
      newTable[i + 1][j - 1],
      newTable[i][j - 1]
    ];
  } else {
    neighbors = [
      newTable[i - 1][j - 1],
      newTable[i - 1][j],
      newTable[i - 1][j + 1],
      newTable[i][j + 1],
      newTable[i + 1][j + 1],
      newTable[i + 1][j],
      newTable[i + 1][j - 1],
      newTable[i][j - 1]
    ];
  }
  const points = neighbors.map(({x, y}) => [x, y]);
  if (neighbors.length && !pointInPolygon([cell.x, cell.y], points)) {
    return true;
  }
  return false;
}

function contOrderPenalty(props) {
  const {
    cell,
    inFirstRow,
    inLastRow,
    inRightColumn,
    inLeftColumn,
    newTable,
    inCorner,
    i, j
  } = props;

  let evalTarget = [];
  // don't allow values to move out of correct order
  if (inCorner) {
    // no penaltys for corners, they are not manipualted
  } else if (inFirstRow || inLastRow) {
    evalTarget = [
      {lessThan: true, dim: 'x', val: newTable[i][j - 1].x},
      {lessThan: false, dim: 'x', val: newTable[i][j + 1].x},
      {lessThan: !inFirstRow, dim: 'y', val: newTable[i + (inFirstRow ? 1 : -1)][j].y}
    ];
  } else if (inLeftColumn || inRightColumn) {
    evalTarget = [
      {lessThan: true, dim: 'y', val: newTable[i - 1][j].y},
      {lessThan: false, dim: 'y', val: newTable[i + 1][j].y},
      {lessThan: !inLeftColumn, dim: 'x', val: newTable[i][j + (inLeftColumn ? 1 : -1)].x}
    ];
  } else {
    evalTarget = [
      {lessThan: true, dim: 'y', val: newTable[i - 1][j].y},
      {lessThan: false, dim: 'y', val: newTable[i + 1][j].y},
      {lessThan: true, dim: 'x', val: newTable[i][j - 1].x},
      {lessThan: false, dim: 'x', val: newTable[i][j + 1].x}
    ];
  }
  return evalTarget.reduce((acc, {val, dim, lessThan}) => {
    return acc + expPenalty(lessThan ? cell[dim] - val : val - cell[dim]);
  }, 0);
}

/**
 * Construct penalities for a evaluations requiring continuity
 * @param  {Array of Array of {x: Number, y: Number}} newTable - the table to be evaluaated
 * @return {Number} The evaluated penalties
 */
export function hasPenalties(newTable, dims) {
  for (let i = 0; i < newTable.length; i++) {
    for (let j = 0; j < newTable[0].length; j++) {
      const {
        inFirstRow,
        inLeftColumn,
        inRightColumn,
        inLastRow,
        inCorner
      } = computeEdges(newTable, i, j);
      const cell = newTable[i][j];

      // boundary penalties
      // dont allow the values to move outside of the box

      if (contOrderPenalty({
        cell,
        inFirstRow,
        inLastRow,
        inRightColumn,
        inLeftColumn,
        newTable,
        inCorner,
        i, j
      })) {
        return true;
      }

      if (continOverlapPenalty({
        cell,
        newTable,
        inCorner,
        inFirstRow,
        inLastRow,
        i,
        j,
        inLeftColumn,
        inRightColumn
      })) {
        return true;
      }
    }
  }

  return false;
}
