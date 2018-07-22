import {area, geoCenter} from './utils';
import {buildForceDirectedTable} from './force-directed';
// import {minimizePowell} from './gradient-stuff';
// import area from 'area-polygon';
import minimizePowell from 'minimize-powell';
import {gradientDescent} from 'fmin';
import {minimize_L_BFGS, minimize_GradientDescent} from 'optimization-js';
import oldCartogram from './';

export function translateTableToVector(table, targetTable) {
  const vector = [];
  for (let i = 0; i < table.length; i++) {
    for (let j = 0; j < table[0].length; j++) {
      const inFirstRow = i === 0;
      const inLeftColumn = j === 0;
      const inRightColumn = j === targetTable[0].length;
      const inLastRow = i === targetTable.length;
      const cell = table[i][j];
      const inCorner = ((inFirstRow && (inLeftColumn || inRightColumn))) ||
              ((inLastRow && (inLeftColumn || inRightColumn)));
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

/* eslint-disable complexity */
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

export function findSumForTable(areas) {
  return areas.reduce((sum, row) => row.reduce((acc, cell) => acc + cell, sum), 0);
}

export function findMaxForTable(areas) {
  return areas.reduce((max, row) => row.reduce((acc, cell) => Math.max(acc, cell), max), -Infinity);
}

function buildPenalties(newTable) {
  let penalties = 0;
  for (let i = 0; i < newTable.length; i++) {
    for (let j = 0; j < newTable[0].length; j++) {
      const inFirstRow = i === 0;
      const inLeftColumn = j === 0;
      // bounds are probably wrong
      const inRightColumn = j === (newTable[0].length - 1);
      const inLastRow = i === (newTable.length - 1);
      const inCorner = ((inFirstRow && (inLeftColumn || inRightColumn))) ||
              ((inLastRow && (inLeftColumn || inRightColumn)));
      const cell = newTable[i][j];
      // dont allow the values to move outside of the box
      if (cell.x > 1 || cell.x < 0 || cell.y > 1 || cell.y < 0) {
        return 5000;
      }
      // don't allow values to move out of correct order
      let violates = false;
      if (inCorner) {
        // no penaltys for corners, they are not manipualted
      } else if (inFirstRow || inLastRow) {
        violates = ![
          {lessThan: true, dim: 'x', val: newTable[i][j - 1].x},
          {lessThan: false, dim: 'x', val: newTable[i][j + 1].x},
          {lessThan: !inFirstRow, dim: 'y', val: newTable[i + (inFirstRow ? 1 : -1)][j].y}
        ].every(({val, dim, lessThan}) => lessThan ? cell[dim] > val : cell[dim] < val);
      } else if (inLeftColumn || inRightColumn) {
        violates = ![
          {lessThan: true, dim: 'y', val: newTable[i - 1][j].y},
          {lessThan: false, dim: 'y', val: newTable[i + 1][j].y},
          {lessThan: !inLeftColumn, dim: 'x', val: newTable[i][j + (inLeftColumn ? 1 : -1)].x}
        ].every(({val, dim, lessThan}) => lessThan ? cell[dim] > val : cell[dim] < val);
      } else {
        violates = ![
          {lessThan: true, dim: 'y', val: newTable[i - 1][j].y},
          {lessThan: false, dim: 'y', val: newTable[i + 1][j].y},
          {lessThan: true, dim: 'x', val: newTable[i][j - 1].x},
          {lessThan: false, dim: 'x', val: newTable[i][j + 1].x}
        ].every(({val, dim, lessThan}) => lessThan ? cell[dim] > val : cell[dim] < val);
      }

      if (violates) {
        penalties = 1000;
      }
    }
  }
  return penalties;
}


const diffVecs = (a, b) => ({x: a.x - b.x, y: a.y - b.y});
const dotVecs = (a, b) => a.x * b.x + a.y * b.y;
const normVec = a => Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2));
function checkForConcaveAngles(rect) {
  for (let i = 1; i < 4; i++) {
    const aVec = diffVecs(rect[i], rect[i - 1]);
    const bVec = diffVecs(rect[i], rect[(i + 1) === 4 ? 0 : (i + 1)]);
    const cosVal = dotVecs(aVec, bVec) / (normVec(aVec) * normVec(bVec));
    const angle = Math.acos(cosVal);
    // console.log(angle)
    if (angle >= Math.PI) {
      return true;
      // console.log(rect)
    }
  }
  return false;
}

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

export function objectiveFunction(vector, targetTable) {
  // PROBABLY SOME GOOD SAVINGS BY NOT TRANSLATING back and forth constantly
  const newTable = translateVectorToTable(vector, targetTable, 1, 1);
  const rects = getRectsFromTable(newTable);
  // sum up the relative amount of "error"
  // generate the areas of each of the boxes
  const areas = rects.map(row => row.map(rect => area(rect)));
  const sumArea = findSumForTable(areas);
  const sumTrueArea = findSumForTable(targetTable);
  // compare the areas and generate absolute error
  // TODO: is using the abs error right? (like as opposed to relative error?)
  const errors = [];
  for (let i = 0; i < rects.length; i++) {
    const rowErrors = [];
    for (let j = 0; j < rects[0].length; j++) {
      const foundArea = area(rects[i][j]);
      // const error = targetTable[i][j] / sumTrueArea - foundArea / sumArea;
      // const error = Math.abs(targetTable[i][j] / sumTrueArea - foundArea) / foundArea;
      // const error = sumTrueArea * Math.abs(targetTable[i][j] / sumTrueArea - foundArea) / targetTable[i][j];
      const error = Math.abs(targetTable[i][j] - sumTrueArea / sumArea * foundArea) / targetTable[i][j];

      rowErrors.push((error));
    }
    errors.push(rowErrors);
  }
  // if the proposed table doesn't conform to the "rules" then throw it out
  // penalty is always 0 or infinity
  const penal = buildPenalties(newTable);
  // TODO could include another penalty to try to force convexity
  // return findMaxForTable(errors) + penal;
  // return findSumForTable(errors) + penal;
  return findSumForTable(errors) / (errors.length * errors[0].length) + penal;
}

function psuedoCartogramLayout(numRows, numCols, colSums, rowSums, total) {
  return [...new Array(numCols + 1)].map((i, y) => {
    return [...new Array(numRows + 1)].map((j, x) => ({
      // linear grid
      // x: x / numRows,
      // y: y / numCols
      // PSUEDO CARTOGRAM TECHNIQUE
      x: x ? (colSums[x - 1] / total) : 0,
      y: y ? (rowSums[y - 1] / total) : 0,
    }));
  });
}

function gridLayout(numRows, numCols, colSums, rowSums, total) {
  return [...new Array(numCols + 1)].map((i, y) => {
    return [...new Array(numRows + 1)].map((j, x) => ({
      x: x / numRows,
      y: y / numCols
    }));
  });
}

// use the indexes of the auto generated arrays for positioning
export function generateInitialTable(tableHeight, tableWidth, table, objFunc) {
  const numCols = tableHeight;
  const numRows = tableWidth;
  const rowSums = table.map(row => findSumForTable([row]));
  const tableTranspose = table[0].map((col, i) => table.map(row => row[i]));
  const colSums = tableTranspose.map(row => findSumForTable([row]));
  for (let i = 1; i < rowSums.length; i++) {
    rowSums[i] += rowSums[i - 1];
  }
  for (let i = 1; i < colSums.length; i++) {
    colSums[i] += colSums[i - 1];
  }
  const total = findSumForTable(table);
  // EFFORTS TO BRING IN TABLE CARTOGRAM TRIANGLE LAYOUT
  // const generator = oldCartogram().mode('triangle');
  // const seenVertices = {};
  // const tabledLayout = generator(table)
  //   .reduce((acc, row) => {
  //     console.log(row)
  //     return acc.concat(row.vertices);
  //   }, [])
  //   .filter(({x, y}) => {
  //     const key = `${Math.abs(x)}-${Math.abs(y)}`;
  //     if (seenVertices[key]) {
  //       return false;
  //     }
  //     seenVertices[key] = true;
  //     return true;
  //   })
  //   .sort((a, b) => a.y - b.y);
  // .reduce((acc, row) => {
  //   acc[row.coords.y] = acc[row.coords.y].concat();
  //   return acc;
  // }, [...new Array(numCols)].map(d => []));
  // tabledLayout.map(row => row.)
  // console.log(tabledLayout);
  // console.log(rowSums, total)
  const layout = 'pickBest';
  switch (layout) {
  default:
  case 'psuedoCartogram':
    return psuedoCartogramLayout(numRows, numCols, colSums, rowSums, total);
  case 'grid':
    return gridLayout(numRows, numCols, colSums, rowSums, total);
  case 'pickBest':
    const layouts = [
      psuedoCartogramLayout(numRows, numCols, colSums, rowSums, total),
      gridLayout(numRows, numCols, colSums, rowSums, total)
    ];
    const measurements = layouts.reduce((acc, newTable, idx) => {
      const newScore = objFunc(translateTableToVector(newTable, table));
      // console.log(newScore)
      if (acc.bestScore > newScore) {
        return {
          bestIndex: idx,
          bestScore: newScore
        };
      }
      return acc;
    }, {bestIndex: -1, bestScore: Infinity});
    console.log(measurements.bestIndex)
    return layouts[measurements.bestIndex];
  }
  // const candidateVector = translateTableToVector(newTable, table);
  // almost done writing, system for automatically picking best starting layout

}

// TODO im not confident in the accuracy of this function
// NOT SURE HOW I'D WRITE A TEST FOR IT SHRUG
function monteCarloPerturb(vector, stepSize = Math.pow(10, -2)) {
  return vector.map(cell => cell + (Math.random() - 0.5) * stepSize);
}

function monteCarloOptimization(objFunc, candidateVector, numIterations) {
  let iteratVector = candidateVector.slice(0);
  let oldScore = objFunc(candidateVector);
  for (let i = 0; i < numIterations; i++) {
    const stepSize = Math.pow(10, -(i / numIterations * 4 + 2));
    // everybody fucking loves adaptive step size
    const newVector = monteCarloPerturb(iteratVector, stepSize);
    const newScore = objFunc(newVector);
    if (newScore < oldScore) {
      iteratVector = newVector;
      oldScore = newScore;
    }
  }
  return iteratVector;
}

// monte carlo with adjustment on a single direction per pass
function altMonteCarloOptimization(objFunc, candidateVector, numIterations) {
  let iteratVector = candidateVector.slice(0);
  let oldScore = objFunc(candidateVector);
  for (let i = 0; i < numIterations; i++) {
    const stepSize = Math.pow(10, -(i / numIterations * 4 + 2));
    // everybody fucking loves adaptive step size
    // const tempVector = monteCarloPerturb(iteratVector, stepSize);
    const vals = iteratVector.reduce((acc, _, idx) => {
      const leftVec = iteratVector.map((d, jdx) => jdx === idx ? d - stepSize : d);
      const newScoreLeft = objFunc(leftVec);
      const rightVec = iteratVector.map((d, jdx) => jdx === idx ? d + stepSize : d);
      const newScoreRight = objFunc(rightVec);
      if (newScoreLeft < acc.newScore && newScoreLeft < newScoreRight) {
        return {
          newScore: newScoreLeft,
          newVector: leftVec
        };
      }
      if (newScoreRight < acc.newScore && newScoreRight < newScoreLeft) {
        return {
          newScore: newScoreRight,
          newVector: rightVec
        };
      }

      return acc;
    }, {
      newScore: Infinity,
      newVector: iteratVector
    });
    const {newScore, newVector} = vals;
    // const newScore = objFunc(newVector);
    if (newScore < oldScore) {
      // console.log('!')
      iteratVector = newVector;
      oldScore = newScore;
    }
  }
  return iteratVector;
}

function matrixIterate(width, height, cell) {
  const output = [];
  for (let i = 0; i < width; i++) {
    const row = [];
    for (let j = 0; j < height; j++) {
      row.push(cell(j, i));
    }
    output.push(row);
  }
  return output;
}

const matrixAdd = (matA, matB) =>
  matrixIterate(matA[0].length, matA.length, (x, y) => matA[y][x] + matB[y][x]);
const transposeMatrix = mat => mat[0].map((col, i) => mat.map(row => row[i]));

// function numericalGradient(obj, currentVec, stepSize) {
// //   Numb = Length[Flatten[x]];
// // fi = N[f[x]];
// // DataMat = Table[Flatten[x], {k, Numb}] + \[CapitalDelta] IdentityMatrix[Numb];
// // DataMat =
// //  Transpose[Table[{DataMat[[j, i]], DataMat[[j, i + 1]]}, {i, 1, 2 Num, 2}, {j, 2 Num}]];
// // fbump = Table[N[f[DataMat[[k]] ] ], {k, 2 Num}];
// // grad = Table[Sum[(fbump[[k]] - fi)[[j]], {j, Length[fi]}], {k, 2 Num}]/\[CapitalDelta];
// // grad = Table[{grad[[i]], grad[[i + 1]]}, {i, 1, 2 Num, 2}];
// // Return[grad];
//   const len = currentVec.len;
//   const initialScore = obj(currentVec);// wrong
//   const matrixizedInput = [...new Array(len)].map(x => currentVec.map(i => i));
//   const identityBump = matrixIterate(len, len, (i, j) => i === j ? stepSize : 0);
//   const dataMat = matrixAdd(matrixizedInput, identityBump);
//   const secondMat = transposeMatrix(matrixIterate(2 * len, 2 * len, (i, j) =>
//     [dataMat[j][2 * i], dataMat[j][2 * i + 1]]));
//   const fbump = [...new Array(2 * len)].map((x, k) => obj(secondMat[k]));
//   const grad = [...new Array(2 * len)].map((x, k) => )
//
// }
const DELTA = 1;
function finiteDiference(obj, currentPos, stepSize) {
  // console.log(obj, currentPos)
  // const stepForward = [...new Array(currentPos.length)].map((x, i) => currentPos[i] + stepSize);
  // const stepBackward = [...new Array(currentPos.length)].map((x, i) => currentPos[i] - stepSize);
  // return (obj(stepForward) - obj(stepBackward)) / 2 * stepSize;

  // const outputVector = [];
  const output = currentPos.map((d, i) => {
    const forward = obj(currentPos.map((row, idx) => row + (idx === i ? DELTA : 0)));
    const backward = obj(currentPos.map((row, idx) => row - (idx === i ? DELTA : 0)));
    // console.log(forward, backward)
    return (forward - backward) / 2;
  });
  // console.log(output)
  return output;

  // return currentPos;
  // const outputVector = [];
  // for (let i = 0; i < currentPos.length; i++) {
  //   const leftTerm = (i ? currentPos[i - 1] : currentPos[currentPos.length - 1]);
  //   const rightTerm = (i === (currentPos.length - 1) ? currentPos[0] : currentPos[i + 1]);
  //   outputVector[i] = leftTerm + rightTerm - 2 * currentPos[i];
  //   outputVector[i] /= Math.pow(DELTA, 2);
  // }
  // const sum = outputVector.reduce((acc, row) => acc + row, 0);
  // console.log('THERE', sum, outputVector)
  // return outputVector.map(row => row / sum);
  // outputVector.push(0);
  // return outputVector;
}

const MAX_ITERATIONS = 3000;
export function buildIterativeCartogram(table, numIterations = MAX_ITERATIONS, technique) {
  // TODO need to add a mechanism for scaling. This computation
  const width = table[0].length;
  const height = table.length;

  const objFunc = vec => objectiveFunction(vec, table);
  const newTable = generateInitialTable(height, width, table, objFunc);
  // STILL TODO, add a notion of scaling so it doesnt come out all wonky
  // initial implementation can monte carlo
  const candidateVector = translateTableToVector(newTable, table);
  // console.log(table)

  switch (technique) {
  case 'powell':
    const powellFinalVec = minimizePowell(objFunc, candidateVector, {maxIter: 100});
    return translateVectorToTable(powellFinalVec, table, 1, 1);
  case 'gradient':
    const gradient = minimize_L_BFGS(objFunc, x => {
      // console.log(x)
      // console.log("WHJHASOJDJASDP")
      // return 0;
      return finiteDiference(objFunc, x.argument || x, 0.01);
    }, candidateVector);
    // console.log(gradient)
    return translateVectorToTable(gradient.argument, table, 1, 1);
  case 'altMonteCarlo':
    const altMonteFinalVec = altMonteCarloOptimization(objFunc, candidateVector, numIterations);
    return translateVectorToTable(altMonteFinalVec, table, 1, 1);
  default:
  case 'monteCarlo':
    const monteFinalVec = monteCarloOptimization(objFunc, candidateVector, numIterations);
    return translateVectorToTable(monteFinalVec, table, 1, 1);
  }
}

export function convertToManyPolygons(table) {
  const rects = [];
  for (let i = 0; i < table.length - 1; i++) {
    for (let j = 0; j < table[0].length - 1; j++) {
      const newRect = [
        table[i][j],
        table[i + 1][j],
        table[i + 1][j + 1],
        table[i][j + 1]
      ];
      rects.push(newRect);
    }
  }
  return rects;
}

const inputTableIsInvalid = table => !table.every(row => row.every(cell => cell));
export function tableCartogram(table, numIterations = MAX_ITERATIONS, technique) {
  if (inputTableIsInvalid(table)) {
    console.error('INVALID INPUT TABLE')
    return [];
  }
  // console.log(buildForceDirectedTable(table).map)
  // const outputTable = buildForceDirectedTable(table).reduce((acc, cell, idx) => {
  //   acc[idx % (table.length + 1)][Math.floor(idx / (table.length + 1))] = cell;
  //   return acc;
  // }, [...Array(table.length + 1)].map(d => []));
  // console.log(outputTable)
  const outputTable = buildIterativeCartogram(table, numIterations, technique);
  // TODO if using monte carlo launch some configurable number at once and pick the one
  // this would be an ensemble technique
  // that minimizes the error
  // const targetArea = findSumForTable(table);
  // console.log(outputTable)
  const rects = [];
  for (let i = 0; i < outputTable.length - 1; i++) {
    for (let j = 0; j < outputTable[0].length - 1; j++) {
      const newRect = [
        outputTable[i][j],
        outputTable[i + 1][j],
        outputTable[i + 1][j + 1],
        outputTable[i][j + 1]
      ];
      const value = table[i][j];

      rects.push({vertices: newRect, value, error: 1});
    }
  }
  // console.log(rects)
  return rects;
}
