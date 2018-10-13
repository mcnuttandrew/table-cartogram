const fs = require('fs');
import {
  translateVectorToTable,
  computeErrors,
  prepareRects
} from '../iterative-methods/utils';
import {
  hasPenalties
} from './lazy-penalties';

// const TARGET_TABLE = [
//   [1, 1, 1],
//   [1, 2, 1],
//   [1, 1, 1]
// ];
const TARGET_TABLE = [
  [2, 1],
  [1, 1]
];

const RESOLUTION = Math.pow(10, 1);

function checksIfLayoutIsValid(currentVec, dataTable) {
  const newTable = translateVectorToTable(currentVec, dataTable, 1, 1);
  const dims = {height: 1, width: 1};
  if (hasPenalties(newTable, dims)) {
    return false;
  }
  const rects = prepareRects(newTable, dataTable, d => d);
  const {error} = computeErrors(dataTable, rects, d => d, dims);
  const valid = error <= 0.001;
  if (valid) {
    console.log(`FOUND ERROR ${error}`)
  }
  return valid;
}

function writeToFile(name, layout) {
  fs.writeFileSync(`./manifold-scrape/solns/${name}.json`, JSON.stringify(layout, null, 2), err => {
    if (err) {
      console.log(err)
      return;
    }
    console.log('write file', checksIfLayoutIsValid(layout, TARGET_TABLE))
  });
}

function buildCounterBin(max) {
  let nextNode = null;
  let currentCount = 0;
  function binCounter() {
    return currentCount;
  }

  binCounter.setNextNode = function setNextNode(node) {
    nextNode = node;
  };

  binCounter.increment = function increment(node) {
    currentCount += 1;
    if (currentCount < max) {
      return;
    }
    currentCount = 0;
    if (nextNode) {
      nextNode.increment();
    }
  };

  return binCounter;
}

export function buildCounter(max, numDimensions) {
  // random
  // const dims = [...new Array(numDimensions)].map(() => 0);
  // return () => {
  //   for (let i = 0; i < numDimensions; i++) {
  //     dims[i] = Math.random();
  //   }
  //   return dims;
  // };

  // brute force
  const bins = [...new Array(numDimensions)].map(() => buildCounterBin(max));

  for (let i = 0; i < (numDimensions - 1); i++) {
    bins[i].setNextNode(bins[i + 1]);
  }
  return () => {
    bins[0].increment();
    return bins.map(bin => bin() / max);
  };
}

function scrapeManifold(dataTable, resolution = 10) {
  const numDims = 2 * dataTable.length * dataTable[0].length - 2;
  let currentVec = [...new Array(numDims)].map(() => 0);
  const generateNextBinTarget = buildCounter(resolution, numDims);
  const totalSteps = Math.pow(resolution, numDims);
  // const startTime = new Date().getTime();
  for (let i = 0; i < totalSteps; i++) {
    if (checksIfLayoutIsValid(currentVec, dataTable)) {
      writeToFile(`${i}`, currentVec);
    }
    // if (!(i % (totalSteps / 100))) {
    //   const currentTime = new Date().getTime();
    //   console.log(`${currentTime - startTime}: ${i} / ${totalSteps} steps taken`);
    //   // console.log()
    // }
    currentVec = generateNextBinTarget();
  }
}

scrapeManifold(TARGET_TABLE, RESOLUTION);
