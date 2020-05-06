import {transposeMatrix} from '../../src/utils';

const countries = [
  {country: 'USA', GDP: 19390, color: '#e41a1c', pop: 330},
  {country: 'EU', GDP: 17277, color: '#2171b5', pop: 510},
  {country: 'China', GDP: 12237, color: '#4daf4a', pop: 1380},
  // {country: 'Japan',	GDP: 4872, color: '#984ea3', pop: 130},
  // {country: 'Other EU',	GDP: 8396, color: '#2171b5', pop: 290},
  // {country: 'Germany',	GDP: 3677, color: '#eff3ff', pop: 80},
  // {country: 'UK',	GDP: 2622, color: '#bdd7e7', pop: 70},
  // {country: 'France',	GDP: 2582, color: '#6baed6', pop: 70},
  // {country: 'India',	GDP: 2597, color: '#ff7f00', pop: 1300},
  // {country: 'Brazil',	GDP: 2055, color: '#ffff33', pop: 210}
];

const COUNTRY_CELLS = countries.reduce((acc, row) => {
  const newCells = [...new Array(row.pop / 10 + 1)].map((_) => row);
  return acc.concat(newCells);
}, []);

// const NESTED_POP_WAFFLE_WIDTH = 73;
// const NESTED_POP_WAFFLE_HEIGHT = 5;
const NESTED_POP_WAFFLE_WIDTH = 37;
const NESTED_POP_WAFFLE_HEIGHT = 6;
export const NESTED_POPS = transposeMatrix(
  [...new Array(NESTED_POP_WAFFLE_WIDTH)].map((_, idx) => {
    return COUNTRY_CELLS.slice(idx * NESTED_POP_WAFFLE_HEIGHT, (idx + 1) * NESTED_POP_WAFFLE_HEIGHT);
  }),
);
