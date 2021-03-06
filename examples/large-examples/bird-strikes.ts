import {transposeMatrix} from '../../src/utils';
import {RV_COLORS} from '../../showcase/colors';

// MAKE DICT INTO WAFFLE PLOT
// https://en.wikipedia.org/wiki/List_of_regions_of_the_United_States
const WAFFLE_WIDTH = 20;
const WAFFLE_HEIGHT = 5;
const WAFFLE_CELLS = WAFFLE_WIDTH * WAFFLE_HEIGHT;

const BIRD_STRIKES_BY_REGION: {[x: string]: number} = {
  Midwest: 38042,
  Canada: 429,
  South: 68307,
  West: 39481,
  Northeast: 30142,
  'US Islands': 5111,
};

const BIRD_SUM: number = Object.values(BIRD_STRIKES_BY_REGION).reduce((acc, row) => acc + row, 0);
const BIRDS = Object.entries(BIRD_STRIKES_BY_REGION).map((row: [string, number]) => ({
  name: row[0],
  size: Math.ceil((row[1] / BIRD_SUM) * WAFFLE_CELLS),
}));
BIRDS[0].size -= 2;
// console.log(BIRDS, BIRDS.reduce((acc, {size}) => acc + size, 0))
const REGION_COLOR = Object.keys(BIRD_STRIKES_BY_REGION).reduce((acc: any, region: any, idx: number) => {
  acc[region] = RV_COLORS[idx];
  return acc;
}, {});

const BIRD_CELLS = BIRDS.reduce((acc, {name, size}) => {
  return acc.concat(
    [...new Array(size)].map(() => ({
      // size: 0.5 + (
      //   ((size % 2) && idx === (size - 1)) ? 0.5 :
      //     (!(idx % 2) ? 1.0 : 0)
      // ),
      size: BIRD_STRIKES_BY_REGION[name] / size,
      name,
      // size: 1,
      color: REGION_COLOR[name],
    })),
  );
}, []).slice(0, 100);
BIRD_CELLS[99].size = 3;

export const BIRD_STRIKES = transposeMatrix(
  [...new Array(WAFFLE_WIDTH)].map((_, idx) => {
    return BIRD_CELLS.slice(idx * WAFFLE_HEIGHT, (idx + 1) * WAFFLE_HEIGHT);
  }),
);
