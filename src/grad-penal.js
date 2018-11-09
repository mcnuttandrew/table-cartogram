import pointInPolygon from 'point-in-polygon';
import {
  translateVectorToTable,
  translateTableToVector,
  getRectsFromTable,
  findSumForTable,
  signedArea
} from './utils';

import {
  derivPenalty,
  computeMinDistPoint,
  computeEdges
} from './objective-function';

function gradOrderPenalty(props) {
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
  return evalTarget.reduce((grad, {val, dim, lessThan}) => {
    grad[dim] += (lessThan ? -1 : 1) * derivPenalty(lessThan ? cell[dim] - val : val - cell[dim]);
    return grad;
  }, {x: 0, y: 0});
}

function gradOverlapPenalty(props) {
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
    const {minPoint, minDist} = computeMinDistPoint(points, cell);
    const xDeriv = derivPenalty((isFinite(minDist) ? minDist : 0)) * (cell.x - minPoint[0]);
    const yDeriv = derivPenalty((isFinite(minDist) ? minDist : 0)) * (cell.y - minPoint[1]);
    return {
      x: xDeriv ? xDeriv / 1 : 0,
      y: yDeriv ? yDeriv / 1 : 0
    };
    // return derivPenalty(-(isFinite(minDist) ? minDist : 0));
  }
  return {x: 0, y: 0};
}

export function gradBuildPenalties(newTable, dims) {
  const tableGradient = [];
  for (let i = 0; i < newTable.length; i++) {
    const rowGradient = [];
    for (let j = 0; j < newTable[0].length; j++) {
      const cell = newTable[i][j];
      const grad = {x: 0, y: 0};

      // boundary penalties
      // dont allow the values to move outside of the box
      grad.x += derivPenalty(dims.width - cell.x);
      grad.x += -derivPenalty(cell.x);
      grad.y += derivPenalty(dims.height - cell.y);
      grad.y += -derivPenalty(cell.y);
      const penalArgs = {
        ...computeEdges(newTable, i, j),
        cell,
        newTable,
        i, j
      };
      const orderGrad = gradOrderPenalty(penalArgs);
      grad.x += orderGrad.x;
      grad.y += orderGrad.y;
      const overlapGrad = gradOverlapPenalty(penalArgs);
      grad.x += overlapGrad.x * 4;
      grad.y += overlapGrad.y * 4;
      rowGradient.push(grad);
    }
    tableGradient.push(rowGradient);
  }

  return tableGradient;
}

function errorGrad(newTable, targetTable) {
  // sum up the relative amount of "error"
  // generate the areas of each of the boxes
  const rects = getRectsFromTable(newTable);
  const areas = rects.map(row => row.map(rect => signedArea(rect)));
  const sumArea = findSumForTable(areas);
  const sumTrueArea = findSumForTable(targetTable);
  const sumRatio = sumTrueArea / sumArea;
  const gradientTable = newTable.map(row => row.map(() => ({x: 0, y: 0}))).reverse();
  for (let i = 0; i < rects.length; i++) {
    for (let j = 0; j < rects[0].length; j++) {
      const target = targetTable[i][j];
      const cellArea = areas[i][j];
      const gradPrefix = (target - cellArea * sumRatio) / target;
      const offsets = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}];
      offsets.forEach((offset, index) => {
        const idx = i + offset.y;
        const jdx = j + offset.x;
        const nextOffset = offsets[(index + 1) % offsets.length];
        const nextVertex = newTable[i + nextOffset.y][j + nextOffset.x];
        const prevOffset = offsets[(index - 1) >= 0 ? (index - 1) : 3];
        const prevVertex = newTable[i + prevOffset.y][j + prevOffset.x];
        const {
          inFirstRow,
          inLeftColumn,
          inRightColumn,
          inLastRow,
          inCorner
        } = computeEdges(newTable, idx, jdx);
        if (inCorner) {
          // NO ACTION
        } else if (inFirstRow || inLastRow) {
          const prevX = newTable[idx][jdx - 1];
          const nextX = newTable[idx][jdx + 1];
          const xGrad = gradPrefix * (
             -sumRatio * (nextVertex.y - prevVertex.y) +
             cellArea * sumRatio / sumArea * (prevX.y - nextX.y)
           );
          gradientTable[idx][jdx].x += xGrad;
        } else if (inLeftColumn || inRightColumn) {
          const prevY = newTable[idx - 1][jdx];
          const nextY = newTable[idx + 1][jdx];
          const yGrad = gradPrefix * (
             -sumRatio * (nextVertex.x - prevVertex.x) +
             cellArea * sumRatio / sumArea * (prevY.x - nextY.x)
           );
          gradientTable[idx][jdx].y -= yGrad;
        } else {
          // return;
          const xGrad = gradPrefix * -sumRatio * (nextVertex.y - prevVertex.y);
          const yGrad = gradPrefix * -sumRatio * (nextVertex.x - prevVertex.x);
          gradientTable[idx][jdx].x += xGrad;
          gradientTable[idx][jdx].y -= yGrad;
        }
      });

    }
  }

  return gradientTable;
}

export function buildErrorGradient(vector, targetTable, dims, searchIndices, onlyShowPenalty) {
  const newTable = translateVectorToTable(vector, targetTable, dims.height, dims.width);
  const gradientTable = errorGrad(newTable, targetTable);
  const gradPenal = gradBuildPenalties(newTable, dims);
  const divisor = gradPenal.length * gradPenal[0].length;
  for (let i = 0; i < gradPenal.length; i++) {
    for (let j = 0; j < gradPenal[0].length; j++) {
      if (onlyShowPenalty) {
        gradientTable[i][j].x = gradPenal[i][j].x;
        gradientTable[i][j].y = gradPenal[i][j].y;
      } else {
        gradientTable[i][j].x += gradPenal[i][j].x;
        gradientTable[i][j].y += gradPenal[i][j].y;
        gradientTable[i][j].x /= divisor;
        gradientTable[i][j].y /= divisor;
      }
      gradientTable[i][j].x *= -1;
      gradientTable[i][j].y *= -1;
    }
  }
  const allowedIndices = searchIndices.reduce((acc, idx) => {
    acc[idx] = true;
    return acc;
  }, {});
  const gradVec = translateTableToVector(gradientTable);
  return gradVec.filter((_, idx) => allowedIndices[idx]);
}
