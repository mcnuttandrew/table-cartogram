import {
  area,
  findEquidistantPoints,
  partitionTriangle,
  round,
  generatePolygon
} from '../utils';
import tape from 'tape';

tape("findEquidistantPoints", function(t) {
  const xIntleft = {x: 0, y: 0};
  const xIntright = {x: 1, y: 0};
  const xIntExpectedPoints = [
    {x: 0, y: 0},
    {x: 0.25, y: 0},
    {x: 0.5, y: 0},
    {x: 0.75, y: 0},
    {x: 1, y: 0}
  ]
  t.deepEqual(findEquidistantPoints(xIntleft, xIntright, 5), xIntExpectedPoints, 'should find the correct points for x interpolation');

  const yIntleft = {x: 0, y: 1};
  const yIntright = {x: 0, y: 0};
  const yIntExpectedPoints = [
    {x: 0, y: 1},
    {x: 0, y: 0.75},
    {x: 0, y: 0.5},
    {x: 0, y: 0.25},
    {x: 0, y: 0}
  ];
  t.deepEqual(findEquidistantPoints(yIntleft, yIntright, 5), yIntExpectedPoints, 'should find the correct points for y interpolation');

  const left = {x: 0, y: 1};
  const right = {x: 1, y: 0};
  const expectedPoints = [
    {x: 0, y: 1},
    {x: 0.25, y: 0.75},
    {x: 0.5, y: 0.5},
    {x: 0.75, y: 0.25},
    {x: 1, y: 0}
  ];
  t.deepEqual(findEquidistantPoints(left, right, 5), expectedPoints, 'should find the correct points for diagonal interpolation');

  t.end();
});


tape("area", function(t) {
  const SQUARE = [
    {x: 10, y: 10},
    {x: 20, y: 10},
    {x: 20, y: 20},
    {x: 10, y: 20}
  ];
  t.equal(area(SQUARE), 100, 'should find the correct area for a square');

  const TRIANGLE = [
    {x: 10, y: 10},
    {x: 20, y: 10},
    {x: 20, y: 20}
  ];
  t.equal(area(TRIANGLE), 50, 'should find the correct area for a triangle');

  const POLYGON = generatePolygon(5, 10, {x: 10, y: 15});
  t.equal(area(POLYGON), 237.76412907378844, 'should find the correct area for a polygon');
  t.end();
});



tape("partitionTriangle - Equal Partition", function(t) {
  const equilateral = generatePolygon(3, 5, {x: 10, y: 10});
  const equalArea = area(equilateral) / 3;
  const partitions = partitionTriangle(equilateral, {alpha: equalArea, beta: equalArea, gamma: equalArea});
  ['alpha', 'beta', 'gamma'].forEach(areaSector => {
    const foundArea = round(area(partitions[areaSector]));
    const predictedarea = round(equalArea);
    t.equal(foundArea, predictedarea, `should find the correct ${areaSector} partition for an equal partition`);
  });

  t.end();
});

tape("partitionTriangle - Unequal Partition", function(t) {
  const equilateral = generatePolygon(3, 5, {x: 10, y: 10});
  const totalArea = area(equilateral);
  const areas = {
    alpha: totalArea * 0.7,
    beta: totalArea * 0.2,
    gamma: totalArea * 0.1
  }
  const partitions = partitionTriangle(equilateral, areas);

  ['alpha', 'beta', 'gamma'].forEach(areaSector => {
    const foundArea = round(area(partitions[areaSector]));
    const predictedarea = round(areas[areaSector]);
    t.equal(foundArea, predictedarea, `should find the correct ${areaSector} partition for an unequal partition`);
  });

  t.end();
});

tape("partitionTriangle - Real triangle example", function(t) {
  const triangle = [
    {x: 4.659090909090909, y: 1},
    {x: 0, y: 0},
    {x: 11.363636363636363, y: 0}
  ].map(({x, y}) => ({x: x + 10, y: y + 10}));
  const totalArea = area(triangle);
  const areas = {
    alpha: 4.305166199439327,
    beta: 0.8259911894273129,
    gamma: 0.5506607929515418
  }
  const partitions = partitionTriangle(triangle, areas);
  ['alpha', 'beta', 'gamma'].forEach(areaSector => {
    const foundArea = round(area(partitions[areaSector]));
    const predictedarea = round(areas[areaSector]);
    t.equal(foundArea, predictedarea, `should find the correct ${areaSector} partition for a real partition`);
  });
  const sumFoundArea = ['alpha', 'beta', 'gamma'].reduce((sum, key) => sum + area(partitions[key]), 0);
  t.equal(round(sumFoundArea), round(totalArea), 'should find the correct total area');

  t.end();
});
