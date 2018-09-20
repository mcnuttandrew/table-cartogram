const fs = require('fs');
import {tableCartogramAdaptive} from '../';
import data from '../test/tenByten.json';
// import data from '../test/hundredByHundred.json';

/* eslint-disable no-console */
const log = msg => console.log(msg);
/* eslint-enable no-console */

const writeToFile = results => {
  fs.writeFile('./scripts/hundred-run-data.json', JSON.stringify(results, null, 2), err => {
    if (err) {
      log('There was an error!');
      log(err);
      return;
    }
    log(`File written in ${results.runTime}`);
  });
};

const timer = toCall => {
  const startTime = (new Date()).getTime();
  const result = toCall();
  const endTime = (new Date()).getTime();
  result.runTime = endTime - startTime;
  return result;
};

const measureCheckerBoardPerformance = () => {
  const result = timer(() => tableCartogramAdaptive({
    data,
    maxNumberOfSteps: Infinity,
    targetAccuracy: 0.1,
    iterationStepSize: 2,
    technique: 'coordinate',
    logging: true
  }));
  writeToFile(result);
};

measureCheckerBoardPerformance();
