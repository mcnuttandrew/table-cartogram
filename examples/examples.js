const POWER_ARRANGEMENTS = [
  [[0, 1], [3, 2]],
  [[0, 2], [3, 1]],
  [[0, 1], [2, 3]]
];

const applyPower = matrix => matrix.map(row => row.map(d => Math.pow(5, d)));

// EXAMPLES FROM PAPER

// EVANS ET AL have a typo NI -> MI
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
  [4.50, 4.50, 16.0, 2.50],
  [4.00, 3.00, 4.50, 3.00],
  [2.50, 6.00, 4.50, 10.5],
  [7.00, 9.00, 9.00, 6.00]
];

const HAND_SYMMETRIC_OLD = [
  [9, 1, 1, 1, 1, 1, 1, 9],
  [1, 1, 1, 2, 2, 1, 1, 1],
  [1, 1, 5, 1, 1, 5, 1, 1],
  [1, 2, 1, 4, 4, 1, 2, 1],
  [1, 2, 1, 4, 4, 1, 2, 1],
  [1, 1, 5, 1, 1, 5, 1, 1],
  [1, 1, 1, 2, 2, 1, 1, 1],
  [9, 1, 1, 1, 1, 1, 1, 9]
];

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

const BLOCKS = [
  [10, 10, 1, 1],
  [10, 10, 1, 1],
  [50, 50, 100, 100],
  [50, 50, 100, 100]
];



const SUB_BLOCKS = [
  [40, 4],
  [100, 400]
];

// DND ALIGNMENTS POPULARITY
// https://www.reddit.com/r/DnD/comments/1ejnft/alignment_survey_results/
const DND_ALIGNMENTS = [
  [
    {name: 'Lawful Good', percent: 6.99, count: 70},
    {name: 'Neutral Good', percent: 23.88, count: 239},
    {name: 'Chaotic Good', percent: 24.98, count: 250}
  ],
  [
    {name: 'Lawful Neutral', percent: 7.69, count: 77},
    {name: 'True Neutral', percent: 9.49, count: 95},
    {name: 'Chaotic Neutral', percent: 16.38, count: 164}
  ],
  [
    {name: 'Lawful Evil', percent: 5.00, count: 50},
    {name: 'Neutral Evil', percent: 3.90, count: 39},
    {name: 'Chaotic Evil', percent: 1.7, count: 17}
  ]
];

const infColor = (val, idx) => ({val, color: (idx % 2) ? 'red' : 'blue'});
const SYSTEMS_TIMING = [
  [22380.39, 1135.6, 3374.33879, 301.4665706].map(infColor),
  [524.9617267, 116.6426814, 653.8473961, 162.6940126].map(infColor),
  [12504.90642, 654.984771, 2455.719995, 156.6454175].map(infColor),
  [16011.18683, 840.4974971, 2738.569166, 270.9505813].map(infColor),
  [897.2846205, 233.7842667, 714.8889534, 155.0058439].map(infColor),
  [4623.46108, 279.8359892, 1823.133411, 120.4488714].map(infColor)
];

const AHNB_SURVEY_RESULTS = [
  [5, 4, 3],
  [4, 5, 4],
  [4, 5, 3],
  [5, 4, 4],
  [4, 5, 4],
  [1, 1, 1],
  [3, 2, 1],
  [1, 1, 1],
  [1, 1, 1],
  [2, 1, 1]
];

const WIKI_CONFUSION_GRAM_OK_CLASSIFIER = [
  [{size: 1.5, show: 5},	{size: 1.373938769, show: 2},	{size: 1.000000000, show: 0}],
  [{size: 1.5, show: 3},	{size: 1.500000000, show: 3},	{size: 1.373938769, show: 2}],
  [{size: 1.0, show: 0},	{size: 1.238313555, show: 1},	{size: 1.373938769, show: 1}]
];

const WIKI_CONFUSION_GRAM_BAD_CLASSIFIER = [
  [{size: 1.0, show: 8}, {size: 1.891805812, show: 6}, {size: 3.266785285, show: 13}],
  [{size: 1.0, show: 0}, {size: 1.891805812, show: 0}, {size: 1.000000000, show: 0}],
  [{size: 1.0, show: 0}, {size: 1.000000000, show: 0}, {size: 3.266785285, show: 0}]
];

const WIKI_CONFUSION_GRAM_PERFECT_CLASSIFIER = [
  [{size: 1.0, show: 8}, {size: 1.0, show: 0}, {size: 1.0, show: 0}],
  [{size: 1.0, show: 0}, {size: 1.0, show: 6}, {size: 1.0, show: 0}],
  [{size: 1.0, show: 0}, {size: 1.0, show: 0}, {size: 1.0, show: 13}]
];

// XAXIS HAIR COLOR: BLACK/BROWN/RED/BLOND
const FRIENDLY_MOSAIC = [
  // MALE
  // BLUE
  [{value: 11, sex: 'M'}, {value: 50, sex: 'M'}, {value: 10, sex: 'M'}, {value: 30, sex: 'M'}],
  // GREEN
  [{value: 3, sex: 'M'}, {value: 15, sex: 'M'}, {value: 7, sex: 'M'}, {value: 8, sex: 'M'}],
  // HAZEL
  [{value: 10, sex: 'M'}, {value: 25, sex: 'M'}, {value: 7, sex: 'M'}, {value: 5, sex: 'M'}],
  // BROWN
  [{value: 32, sex: 'M'}, {value: 38, sex: 'M'}, {value: 10, sex: 'M'}, {value: 3, sex: 'M'}],

  // FEMALE
  // BLUE
  [{value: 9, sex: 'F'}, {value: 34, sex: 'F'}, {value: 7, sex: 'F'}, {value: 64, sex: 'F'}],
  // GREEN
  [{value: 2, sex: 'F'}, {value: 14, sex: 'F'}, {value: 7, sex: 'F'}, {value: 8, sex: 'F'}],
  // HAZEL
  [{value: 5, sex: 'F'}, {value: 29, sex: 'F'}, {value: 7, sex: 'F'}, {value: 5, sex: 'F'}],
  // BROWN
  [{value: 36, sex: 'F'}, {value: 81, sex: 'F'}, {value: 16, sex: 'F'}, {value: 4, sex: 'F'}]
];

const FRIENDLY_MOSAIC_2 = [...new Array(4)].map((_, idx) => {
  const maleRow = FRIENDLY_MOSAIC[idx + 0];
  const femaleRow = FRIENDLY_MOSAIC[idx + 4];
  return maleRow
    .reduce((acc, __, jdx) => acc
      .concat({...maleRow[jdx], index: `${idx}-${jdx}`})
      .concat({...femaleRow[jdx], index: `${idx}-${jdx}`}
    ), []);
});

const CANDIDATE_SIM = [
  [1, 0.7620186491, 0.6631815174, 0.6958878285, 0.6193363005, 0.7427370062],
  [0.7620186491, 1, 0.6368192806, 0.7319941129, 0.6366867638, 0.6943891165],
  [0.6631815174, 0.6368192806, 1, 0.5982555652, 0.5574229325, 0.7203751903],
  [0.6958878285, 0.7319941129, 0.5982555652, 1, 0.6939045049, 0.6429074659],
  [0.6193363005, 0.6366867638, 0.5574229325, 0.6939045049, 1, 0.5859119638],
  [0.7427370062, 0.6943891165, 0.7203751903, 0.6429074659, 0.5859119638, 1]
];

const BIG_ONES = checkerBoardGenerator(9, 9, 1, 1);
BIG_ONES[4][4] = 30;

export default {
  BLOCKS,
  SUB_BLOCKS,
  BIG_ONES,
  LONG_RAMP: checkerBoardGenerator(1, 15, 1, 10),
  SMALL_RAMP: ramp(3, 3),
  DUMB_CALENDER: ramp(7, 4),
  twoByThree: checkerBoardGenerator(3, 2, 1, 1),
  ONE_BY: checkerBoardGenerator(3, 3, 1, 2),
  ONE_BYS,
  USA_USA_USA,
  EXAMPLE_TABLE,
  EXAMPLE_TABLE_SLIGHT_DIFF,
  oneByOnesUpper2,
  oneByOnesLower2,
  BLACK_AND_WHITE_TABLE,
  BIG_TOP,
  BIG_BOTTOM,
  CHECKER_BOARD: checkerBoardGenerator(10, 10, 5, 1),
  CHECKER_BOARD_SMALL: checkerBoardGenerator(4, 4, 5, 1),
  PATHOLOGICAL_2_BY,
  MULTIPLICATION_TABLE,
  TEST_TABLE: [[1, 2], [2, 1]],

  TRI_BOARD: nStopCheckerBoardGenerator(12, 12, [5, 1, 20]),

  HAND_SYMMETRIC,
  HAND_SYMMETRIC_OLD,
  RIBBONS,
  USA_USA_USA_LABELS,

  DND_ALIGNMENTS,

  SYSTEMS_TIMING,
  AHNB_SURVEY_RESULTS,

  WIKI_CONFUSION_GRAM_OK_CLASSIFIER,
  WIKI_CONFUSION_GRAM_BAD_CLASSIFIER,
  WIKI_CONFUSION_GRAM_PERFECT_CLASSIFIER,

  FRIENDLY_MOSAIC,
  FRIENDLY_MOSAIC_2,

  POWER_1: applyPower(POWER_ARRANGEMENTS[0]),
  POWER_2: applyPower(POWER_ARRANGEMENTS[1]),
  POWER_3: applyPower(POWER_ARRANGEMENTS[2]),

  CANDIDATE_SIM,
};
