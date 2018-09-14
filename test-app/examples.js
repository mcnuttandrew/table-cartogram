import ZionVisitors from '../test/zion-visitors';
// Source Wikipedia
import Elements from '../test/elements';

const elementLookUp = Elements.reduce((acc, row) => {
  acc[row.Symbol] = row;
  return acc;
}, {});

const ElementsOfInterest = [[
  'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn'
], [
  'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd'
], [
  'La', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pr', 'Au', 'Hg'
]].map(row => row.map(symbol => elementLookUp[symbol]));
const generateElementTable = key => ElementsOfInterest.map(row => row.map(cell => Number(cell[key])));

const ELELMENTS_THERMAL = generateElementTable('C');
// dont have molar volume
const ELELMENTS_DENSITY = generateElementTable('Density');
const ELELMENTS_BOIL = generateElementTable('Boil');
const ELELMENTS_MASS = generateElementTable('Atomic weight');

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const ZION_VISITORS = ZionVisitors.map(year => MONTHS.map(month => year[month])).slice(0, 5);

import Speeding from '../test/speeding';
function getWeekNumber(day) {
  const thisDate = new Date(day);
  const dayNum = ((thisDate.getUTCDay() || 7) + 0) % 7;
  thisDate.setUTCDate(thisDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(thisDate.getUTCFullYear(), 0, 1));
  return Math.ceil((((thisDate.getTime() - yearStart) / 86400000) + 0) / 7);
}

export const CAL = Object.entries(Speeding.filter(d => {
  const day = new Date(d.date);
  const inJuly = day.getTime() > new Date('June 30 2018').getTime();
  const beforeSecondWeekOfAugust = day.getTime() < new Date('August 5 2018').getTime();
  return inJuly && beforeSecondWeekOfAugust;
}).reduce((acc, row) => {
  const weekNum = getWeekNumber(row.date);
  if (!acc[weekNum]) {
    acc[weekNum] = [];
  }
  acc[weekNum].push(row);
  return acc;
}, {})).sort((a, b) => a[0] - b[0]).map(d => d[1]);

// EXAMPLES FROM PAPER

// EVANS ET Et have a typo NI -> MI
/* eslint-disable max-len */
const USA_USA_USA_LABELS = [
  [['WA', 6.7250], ['MT', 0.9890], ['ND', 0.673], ['MN', 5.3040], ['WI', 5.687], ['NY', 19.378], ['VT', 0.6260], ['ME', 1.328]],
  [['OR', 3.8310], ['ID', 1.5680], ['SD', 0.814], ['IA', 3.0460], ['MI', 9.884], ['PA', 12.702], ['NH', 1.3160], ['MA', 6.548]],
  [['NV', 2.7010], ['WY', 0.5640], ['NE', 1.826], ['IL', 12.831], ['IN', 6.484], ['OH', 11.537], ['CT', 3.5740], ['RI', 1.053]],
  [['UT', 2.7640], ['CO', 5.0290], ['KS', 2.853], ['MO', 5.9890], ['KY', 4.339], ['WV', 1.8530], ['MD', 5.7740], ['NJ', 8.792]],
  [['CA', 37.254], ['NM', 2.0590], ['OR', 3.751], ['AR', 2.9160], ['TN', 6.346], ['SC', 4.6250], ['VA', 8.0010], ['DE', 0.898]],
  [['AZ', 6.3920], ['TX', 25.146], ['LA', 4.533], ['MS', 2.9670], ['AL', 4.780], ['GA', 9.6880], ['FL', 18.801], ['NC', 9.535]]
];
/* eslint-enable max-len*/
const USA_USA_USA = USA_USA_USA_LABELS.map(row => row.map(cell => cell[1]));

const EXAMPLE_TABLE = [
  [2, 3, 2, 4],
  [3, 9, 3, 7],
  [2, 3, 4, 9],
  [3, 2, 2, 3]
];

const EXAMPLE_TABLE_SLIGHT_DIFF = EXAMPLE_TABLE.map(d => d.slice());
EXAMPLE_TABLE_SLIGHT_DIFF[1][1] = 10;
EXAMPLE_TABLE_SLIGHT_DIFF[2][3] = 8;

const BLACK_AND_WHITE_TABLE = [
  [4.5, 4.5, 16, 2.5],
  [4, 3, 4.5, 3],
  [2.5, 6, 4.5, 10.5],
  [7, 9, 9, 6]
];

// const HAND_SYMMETRIC = [
//   [9, 1, 1, 1, 1, 1, 1, 9],
//   [1, 1, 1, 2, 2, 1, 1, 1],
//   [1, 1, 5, 1, 1, 5, 1, 1],
//   [1, 2, 1, 4, 4, 1, 2, 1],
//   [1, 2, 1, 4, 4, 1, 2, 1],
//   [1, 1, 5, 1, 1, 5, 1, 1],
//   [1, 1, 1, 2, 2, 1, 1, 1],
//   [9, 1, 1, 1, 1, 1, 1, 9]
// ];

const HAND_SYMMETRIC = [
  [5, 1, 1, 1, 1, 3, 5, 9, 1, 7, 2, 1],
  [1, 1, 1, 1, 3, 5, 9, 5, 1, 7, 2, 1],
  [1, 1, 1, 3, 5, 9, 5, 3, 1, 7, 2, 1],
  [1, 1, 3, 5, 9, 5, 3, 1, 1, 7, 2, 1],
  [1, 3, 5, 9, 5, 3, 1, 1, 1, 7, 2, 1],
  [3, 5, 9, 5, 3, 1, 1, 1, 1, 7, 2, 1],
  [5, 9, 5, 3, 1, 1, 1, 1, 1, 7, 2, 1],
  [9, 5, 3, 1, 1, 1, 1, 5, 1, 7, 2, 1]
];

// PROGRAMATICALLY GENERATED EXAMPLES
const checkerBoardGenerator = (width, height, high, low, offset = 0) =>
  [...new Array(height)].map((_, ydx) =>
    [...new Array(width)].map((d, xdx) => (xdx + (ydx % 2) + offset) % (2) ? high : low));

const nStopCheckerBoardGenerator = (width, height, vals, offset = 0) =>
  [...new Array(height)].map((_, ydx) =>
    [...new Array(width)].map((d, xdx) =>
      vals[(xdx + (ydx % vals.length) + offset) % (vals.length)]
    )
  );

const ramp = (width, height) => checkerBoardGenerator(width, height, 1, 1)
  .map((row, jdx) => row.map((d, idx) => jdx * width + idx + 1));

const oneByOnesUpper2 = checkerBoardGenerator(4, 4, 1, 1);
oneByOnesUpper2[1][1] = 2;
const oneByOnesLower2 = checkerBoardGenerator(4, 4, 1, 1);
oneByOnesLower2[2][2] = 2;
const ONE_BYS = checkerBoardGenerator(3, 3, 1, 1);
ONE_BYS[2][2] = 50;

const BIG_TOP = checkerBoardGenerator(3, 2, 1, 1);
BIG_TOP[0][0] = 20;
BIG_TOP[0][2] = 20;
const BIG_BOTTOM = checkerBoardGenerator(3, 2, 1, 1);
BIG_BOTTOM[1][0] = 20;

const PATHOLOGICAL_2_BY = [
  [100, 1],
  [0.1, 10]
];

const MULTIPLICATION_TABLE = [...new Array(10)].map((d, i) =>
  [...new Array(10)].map((_, j) => (i + 1) * (j + 1))
);

const RIBBONS = [...new Array(10)].map((d, i) =>
  [...new Array(10)].map((_, j) => ((j + 1) * (i % 2 ? 20 : 1)))
);

export default {
  LONG_RAMP: checkerBoardGenerator(1, 15, 1, 10),
  SMALL_RAMP: ramp(3, 3),
  DUMB_CALENDER: ramp(7, 4),
  twoByThree: checkerBoardGenerator(3, 2, 1, 1),
  ONE_BY: checkerBoardGenerator(2, 2, 2, 1),
  ONE_BYS,
  ZION_VISITORS,
  USA_USA_USA,
  EXAMPLE_TABLE,
  EXAMPLE_TABLE_SLIGHT_DIFF,
  oneByOnesUpper2,
  oneByOnesLower2,
  BLACK_AND_WHITE_TABLE,
  BIG_TOP,
  BIG_BOTTOM,
  CHECKER_BOARD: checkerBoardGenerator(5, 5, 10, 1),
  CHECKER_BOARD_SMALL: checkerBoardGenerator(4, 4, 5, 1),
  PATHOLOGICAL_2_BY,
  MULTIPLICATION_TABLE,

  ELELMENTS_THERMAL,
  ELELMENTS_DENSITY,
  ELELMENTS_BOIL,
  ELELMENTS_MASS,

  TRI_BOARD: nStopCheckerBoardGenerator(10, 10, [5, 1, 20]),

  HAND_SYMMETRIC,
  RIBBONS,
  USA_USA_USA_LABELS
};
