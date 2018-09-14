const fs = require('fs');
import {tableCartogramAdaptive} from '../';

/* eslint-disable no-console */
const log = msg => console.log(msg);
/* eslint-enable no-console */

const timer = toCall => {
  const startTime = (new Date()).getTime();
  const result = toCall();
  const endTime = (new Date()).getTime();
  result.runTime = endTime - startTime;
  return result;
};

const nStopCheckerBoardGenerator = (width, height, vals, offset = 0) =>
  [...new Array(height)].map((_, ydx) =>
    [...new Array(width)].map((d, xdx) =>
      vals[(xdx + (ydx % vals.length) + offset) % (vals.length)]
    )
  );

const writeToFile = results => {
  fs.writeFile('runData.json', JSON.stringify(results, null, 2), err => {
    if (err) {
      log('There was an error!');
      log(err);
      return;
    }
    log(`File written ${results.length} runs`);
  });
};

const measureCheckerBoardPerformance = () => {
  const results = [];
  let numRuns = 0;
  const inputLayouts = [
    'gridLayout',
    'zigZagOnX',
    'zigZagOnY',
    'zigZagOnXY',
    'psuedoCartogramLayout',
    'psuedoCartogramLayoutZigZag',
    // 'partialPsuedoCartogram'
  ];
  // const inputLayouts = ['pickBest', 'pickWorst'];
  const lowerBound = 4;
  const upperBound = 5;
  const expectedNumberOfRuns = (upperBound - lowerBound) * (upperBound - lowerBound) * inputLayouts.length;
  inputLayouts.forEach(layout => {
  // forEach(layout => {
    for (let i = lowerBound; i < upperBound; i++) {
      for (let j = lowerBound; j < upperBound; j++) {
        const result = timer(() => tableCartogramAdaptive({
          data: nStopCheckerBoardGenerator(i, j, [1, 5]),
          layout,
          technique: 'coordinate'
        }));
        result.width = i;
        result.height = j;
        result.gons = [];
        result.layout = layout;
        results.push(result);
        numRuns += 1;
        log(`${numRuns} out of ${expectedNumberOfRuns} complete`);
      }
    }
  });
  writeToFile(results);
};

measureCheckerBoardPerformance();
