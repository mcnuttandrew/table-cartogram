import {area, generatePolygon, fusePolygons} from '../src/utils';
import SavedBirdStrikes from './saved-bird-strikes.json';

test('area', () => {
  const SQUARE = [
    {x: 10, y: 10},
    {x: 20, y: 10},
    {x: 20, y: 20},
    {x: 10, y: 20},
  ];
  expect(area(SQUARE)).toEqual(100);

  const TRIANGLE = [
    {x: 10, y: 10},
    {x: 20, y: 10},
    {x: 20, y: 20},
  ];
  expect(area(TRIANGLE)).toEqual(50);

  const POLYGON = generatePolygon(5, 10, {x: 10, y: 15});
  expect(area(POLYGON)).toEqual(237.7641290737884);
});

test('fusePolygons', () => {
  const results = fusePolygons(SavedBirdStrikes, (d) => d.data.name);
  expect(results).toMatchSnapshot();
});
