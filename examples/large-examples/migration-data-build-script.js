const fs = require('fs');

/* eslint-disable no-console */
// DATA FROM CENSUS
fs.readFile('./examples/large-examples/migration-data-raw.json', (err, strData) => {
  if (err) {
    console.log(err);
    return;
  }
  const data = JSON.parse(strData).map(row => {
    return Object.entries(row).reduce((acc, cell) => {
      if (cell[0] === 'State of residence') {
        acc[cell[0]] = cell[1];
        return acc;
      }
      const isZeroOrNaN = Number(cell[1]) === 0 || !isFinite(Number(cell[1]));
      acc[cell[0]] = !isZeroOrNaN ? (Number(cell[1]) + 1) : 1;
      return acc;
    }, {});
  });

  fs.writeFile('state-migration-data.json', JSON.stringify(data, null, 2), error => {
    if (error) {
      console.log('error', error);
    } else {
      console.log('file written');
    }
  });
});

/* eslint-enable no-console */
