import {
  findEquidistantPoints,
  fractionalInterpolation,
  generatePolygon,
  partitionTriangle,
  partitionQuadrangle
} from '../old-stuff/utils';
import {
  area,
  round
} from '../src/utils';
import tape from 'tape';

/* eslint-disable max-len*/

tape('fractionalInterpolation', t => {
  const a = {x: 0, y: 0};
  const b = {x: 0, y: 10};
  t.deepEqual(fractionalInterpolation(a, b, 0.9), {x: 0, y: 9}, 'should find the correct vertical interpolation');
  const c = {x: 10, y: 0};
  t.deepEqual(fractionalInterpolation(a, c, 0.9), {x: 9, y: 0}, 'should find the correct horizontal interpolation');
  const d = {x: 10, y: 10};
  t.deepEqual(fractionalInterpolation(a, d, 0.9), {x: 9, y: 9}, 'should find the correct diagonal interpolation');

  const testFraction = 0.5707317073170731;

  const pointA = {x: -4.659090909090909, y: 1};
  const pointB = {x: -4.659090909090909, y: 0.4590163934426229};
  const fracPointLeft = fractionalInterpolation(pointA, pointB, testFraction);

  const pointE = {x: 4.659090909090909, y: 1};
  const pointD = {x: 4.659090909090909, y: 0.4590163934426229};
  const fracPointRight = fractionalInterpolation(pointE, pointD, testFraction);

  t.equal(fracPointLeft.y, fracPointRight.y, 'should find a common y');
  t.end();
});

tape('findEquidistantPoints', t => {
  const xIntleft = {x: 0, y: 0};
  const xIntright = {x: 1, y: 0};
  const xIntExpectedPoints = [
    {x: 0, y: 0},
    {x: 0.25, y: 0},
    {x: 0.5, y: 0},
    {x: 0.75, y: 0},
    {x: 1, y: 0}
  ];
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

  const expectedEmptyPoints = [
    {x: 0, y: 1}
  ];
  t.deepEqual(findEquidistantPoints(left, right, 1), expectedEmptyPoints, 'should find the correct points for a single point');

  t.end();
});

tape('area', t => {
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

tape('partitionTriangle - Equal Partition', t => {
  const equilateral = generatePolygon(3, 5, {x: 10, y: 10});
  const equalArea = area(equilateral) / 3;
  const partitions = partitionTriangle(equilateral, {alpha: equalArea, beta: equalArea, gamma: equalArea});
  ['alpha', 'beta', 'gamma'].forEach(areaSector => {
    const foundArea = round(area(partitions[areaSector]));
    const predictedArea = round(equalArea);
    t.equal(foundArea, predictedArea, `should find the correct ${areaSector} partition for an equal partition`);
  });

  t.end();
});

tape('partitionTriangle - Unequal Partition', t => {
  const equilateral = generatePolygon(3, 5, {x: 10, y: 10});
  const totalArea = area(equilateral);
  const areas = {
    alpha: totalArea * 0.7,
    beta: totalArea * 0.2,
    gamma: totalArea * 0.1
  };
  const partitions = partitionTriangle(equilateral, areas);

  ['alpha', 'beta', 'gamma'].forEach(areaSector => {
    const foundArea = round(area(partitions[areaSector]));
    const predictedArea = round(areas[areaSector]);
    t.equal(foundArea, predictedArea, `should find the correct ${areaSector} partition for an unequal partition`);
  });

  t.end();
});

tape('partitionTriangle - Real triangle example', t => {
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
  };
  const partitions = partitionTriangle(triangle, areas);
  ['alpha', 'beta', 'gamma'].forEach(areaSector => {
    const foundArea = round(area(partitions[areaSector]));
    const predictedArea = round(areas[areaSector]);
    t.equal(foundArea, predictedArea, `should find the correct ${areaSector} partition for a real partition`);
  });
  const sumFoundArea = ['alpha', 'beta', 'gamma'].reduce((sum, key) => sum + area(partitions[key]), 0);
  t.equal(round(sumFoundArea), round(totalArea), 'should find the correct total area');

  t.end();
});

tape('partitionQuadrangle - Equal Partition', t => {
  const equilateral = generatePolygon(5, 5, {x: 10, y: 10});
  const equalArea = area(equilateral) / 3;
  const interpolatedA = findEquidistantPoints(equilateral[0], equilateral[1], 3);
  const interpolatedB = findEquidistantPoints(equilateral[3], equilateral[4], 3);

  const areas = {alpha: equalArea, beta: equalArea, gamma: equalArea};
  const startPoints = [interpolatedA[1], interpolatedB[1]];
  const partitions = partitionQuadrangle(equilateral, startPoints, areas);

  ['alpha', 'beta', 'gamma'].forEach(areaSector => {
    const foundArea = round(area(partitions[areaSector]));
    const predictedArea = round(equalArea);
    t.equal(foundArea, predictedArea, `should find the correct ${areaSector} partition for the correct partition`);
  });

  t.end();
});
// these tests are muted bc the stratagey made use of in paper doesn't actually obey these
// tape('partitionQuadrangle - Unequal Partition', t => {
//   const equilateral = generatePolygon(5, 5, {x: 10, y: 10});
//   const totalArea = area(equilateral);
//   const interpolatedA = findEquidistantPoints(equilateral[0], equilateral[1], 3);
//   const interpolatedB = findEquidistantPoints(equilateral[3], equilateral[4], 3);
//
//   const areas = {alpha: totalArea * 0.7, beta: totalArea * 0.2, gamma: totalArea * 0.1};
//   const startPoints = [interpolatedA[1], interpolatedB[1]];
//   const partitions = partitionQuadrangle(equilateral, startPoints, areas);
//
//   ['alpha', 'beta', 'gamma'].forEach(areaSector => {
//     const foundArea = round(area(partitions[areaSector]));
//     const predictedArea = round(areas[areaSector]);
//     t.equal(foundArea, predictedArea, `should find the correct ${areaSector} partition for the correct partition`);
//   });
//
//   t.end();
// });
//
tape('partitionQuadrangle - Square Partition', t => {
  const equilateral = [
    {x: -1, y: -1},
    {x: -1, y: 1},
    {x: -0.5, y: 1},
    {x: 1, y: 1},
    {x: 1, y: -1}
  ];
  const totalArea = area(equilateral);
  const interpolatedA = findEquidistantPoints(equilateral[0], equilateral[1], 3);
  const interpolatedB = findEquidistantPoints(equilateral[3], equilateral[4], 3);

  const areas = {alpha: totalArea * 0.5, beta: totalArea * 0.4, gamma: totalArea * 0.1};
  const startPoints = [interpolatedA[1], interpolatedB[1]];
  const partitions = partitionQuadrangle(equilateral, startPoints, areas);

  ['alpha', 'beta', 'gamma'].forEach(areaSector => {
    const foundArea = round(area(partitions[areaSector]));
    const predictedArea = round(areas[areaSector]);
    t.equal(foundArea, predictedArea, `should find the correct ${areaSector} partition for an equal partition`);
  });

  t.end();
});
