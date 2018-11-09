const fs = require('fs');

fs.readdir('./manifold-scrape/solns', (err, names) => {
  if (err) {
    console.log(err);
    return;
  }
  Promise.all(
    names.map(name => {
      return new Promise((resolve, reject) => {
        fs.readFile(`./manifold-scrape/solns/${name}`, (error, file) => {
          if (error) {
            reject(error);
          }
          resolve(JSON.parse(file));
        });
      });
    })
  ).then(contents => {
    fs.writeFile('combined-4x-sampling-with-descent-on-1111.json', JSON.stringify(contents));
  })
  .catch(e => {
    console.log(e)
  });
});
