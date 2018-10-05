const fs = require('fs');
import {tableCartogramAdaptive} from '../';
import {stateMigration as data, ZION_VISITORS_WITH_ANNOTATION} from '../test-app/examples';
// import data from '../test/tenByten.json';
// import data from '../test/hundredByHundred.json';

/* eslint-disable no-console */
const log = msg => console.log(msg);
/* eslint-enable no-console */

const writeToFile = results => {
  fs.writeFile('./scripts/zion-run.json', JSON.stringify(results, null, 2), err => {
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
    data: ZION_VISITORS_WITH_ANNOTATION,
    maxNumberOfSteps: Infinity,
    targetAccuracy: 0.001,
    iterationStepSize: 100,
    technique: 'coordinate',
    logging: true,
    accessor: d => d.value
  }));
  writeToFile(result);
};

measureCheckerBoardPerformance();
