const POWER_ARRANGEMENTS = [
  [
    [0, 1],
    [3, 2],
  ],
  [
    [0, 2],
    [3, 1],
  ],
  [
    [0, 1],
    [2, 3],
  ],
];

const applyPower = (matrix: number[][]) => matrix.map(row => row.map(d => Math.pow(5, d)));

const EXAMPLE_TABLE = [
  [2, 3, 2, 4],
  [3, 9, 3, 7],
  [2, 3, 4, 9],
  [3, 2, 2, 3],
];

const EXAMPLE_TABLE_SLIGHT_DIFF = EXAMPLE_TABLE.map(d => d.slice());
EXAMPLE_TABLE_SLIGHT_DIFF[1][1] = 10;
EXAMPLE_TABLE_SLIGHT_DIFF[2][3] = 8;

const BLACK_AND_WHITE_TABLE = [
  [4.5, 4.5, 16.0, 2.5],
  [4.0, 3.0, 4.5, 3.0],
  [2.5, 6.0, 4.5, 10.5],
  [7.0, 9.0, 9.0, 6.0],
];

const HAND_SYMMETRIC_OLD = [
  [9, 1, 1, 1, 1, 1, 1, 9],
  [1, 1, 1, 2, 2, 1, 1, 1],
  [1, 1, 5, 1, 1, 5, 1, 1],
  [1, 2, 1, 4, 4, 1, 2, 1],
  [1, 2, 1, 4, 4, 1, 2, 1],
  [1, 1, 5, 1, 1, 5, 1, 1],
  [1, 1, 1, 2, 2, 1, 1, 1],
  [9, 1, 1, 1, 1, 1, 1, 9],
];

const HAND_SYMMETRIC = [
  [5, 1, 1, 1, 1, 3, 5, 9, 1, 7, 2, 1],
  [1, 1, 1, 1, 3, 5, 9, 5, 1, 7, 2, 1],
  [1, 1, 1, 3, 5, 9, 5, 3, 1, 7, 2, 1],
  [1, 1, 3, 5, 9, 5, 3, 1, 1, 7, 2, 1],
  [1, 3, 5, 9, 5, 3, 1, 1, 1, 7, 2, 1],
  [3, 5, 9, 5, 3, 1, 1, 1, 1, 7, 2, 1],
  [5, 9, 5, 3, 1, 1, 1, 1, 1, 7, 2, 1],
  [9, 5, 3, 1, 1, 1, 1, 5, 1, 7, 2, 1],
];

// PROGRAMATICALLY GENERATED EXAMPLES
const checkerBoardGenerator = (width: number, height: number, high: number, low: number, offset = 0) =>
  [...new Array(height)].map((_, ydx) =>
    [...new Array(width)].map((d, xdx) => ((xdx + (ydx % 2) + offset) % 2 ? high : low)),
  );

const nStopCheckerBoardGenerator = (width: number, height: number, vals: number[], offset = 0) =>
  [...new Array(height)].map((_, ydx) =>
    [...new Array(width)].map((d, xdx) => vals[(xdx + (ydx % vals.length) + offset) % vals.length]),
  );

const ramp = (width: number, height: number) =>
  checkerBoardGenerator(width, height, 1, 1).map((row, jdx) => row.map((d, idx) => jdx * width + idx + 1));

const oneByOnesUpper2 = checkerBoardGenerator(4, 4, 1, 1);
oneByOnesUpper2[1][1] = 2;
const oneByOnesLower2 = checkerBoardGenerator(4, 4, 1, 1);
oneByOnesLower2[2][2] = 2;
const ONE_BYS = checkerBoardGenerator(3, 3, 1, 1);
ONE_BYS[2][2] = 50;

const BIG_TOP = checkerBoardGenerator(3, 2, 1, 1);
BIG_TOP[0][0] = 20;
BIG_TOP[0][2] = 20;

const PATHOLOGICAL_2_BY = [
  [100, 1],
  [0.1, 10],
];

const MULTIPLICATION_TABLE = [...new Array(10)].map((d, i) =>
  [...new Array(10)].map((_, j) => (i + 1) * (j + 1)),
);

const RIBBONS = [...new Array(10)].map((d, i) =>
  [...new Array(10)].map((_, j) => (j + 1) * (i % 2 ? 20 : 1)),
);

const BLOCKS = [
  [10, 10, 1, 1],
  [10, 10, 1, 1],
  [50, 50, 100, 100],
  [50, 50, 100, 100],
];

const SUB_BLOCKS = [
  [40, 4],
  [100, 400],
];

const BIG_ONES = checkerBoardGenerator(9, 9, 1, 1);
BIG_ONES[4][4] = 30;

const examples: {[x: string]: number[][]} = {
  BLOCKS,
  SUB_BLOCKS,
  BIG_ONES,
  LONG_RAMP: checkerBoardGenerator(1, 15, 1, 10),
  SMALL_RAMP: ramp(3, 3),
  DUMB_CALENDER: ramp(7, 4),
  twoByThree: checkerBoardGenerator(3, 2, 1, 1),
  ONE_BY: checkerBoardGenerator(3, 3, 1, 2),
  ONE_BYS,
  EXAMPLE_TABLE,
  EXAMPLE_TABLE_SLIGHT_DIFF,
  oneByOnesUpper2,
  oneByOnesLower2,
  BLACK_AND_WHITE_TABLE,
  BIG_TOP,
  CHECKER_BOARD: checkerBoardGenerator(5, 5, 5, 1),
  CHECKER_BOARD_SMALL: checkerBoardGenerator(4, 4, 5, 1),
  PATHOLOGICAL_2_BY,
  MULTIPLICATION_TABLE,
  TEST_TABLE: [
    [1, 2],
    [2, 1],
  ],

  TRI_BOARD: nStopCheckerBoardGenerator(8, 8, [5, 1, 15]),

  HAND_SYMMETRIC,
  HAND_SYMMETRIC_OLD,
  RIBBONS,

  POWER_1: applyPower(POWER_ARRANGEMENTS[0]),
  POWER_2: applyPower(POWER_ARRANGEMENTS[1]),
  POWER_3: applyPower(POWER_ARRANGEMENTS[2]),
};
export default examples;
