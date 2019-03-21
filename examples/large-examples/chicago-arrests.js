// {
//   "CENTRAL": [
//     08, 32, 33
//   ],
//   "NORTH": [
//     05, 06, 07, 21, 22, 01, 02,
//     03, 04, 09, 10, 11, 12, 13,
//     14, 76, 77, 15, 16, 17, 18,
//     19, 20
//   ],
//   "WEST": [
//     23, 24, 25, 26, 27, 28, 29,
//     30, 31
//   ],
//   "SOUTH": [
//     34, 35, 36, 37, 38, 39, 40, 41,
//     42, 43, 60, 69, 56, 57, 58, 59,
//     61, 62, 63, 64, 65, 66, 67, 68,
//     44, 45, 46, 47, 48, 49, 50, 51,
//     52, 53, 54, 55, 70, 71, 72, 73,
//     74, 75
//   ]
// }

const COLORS = [
  '#88572C',
  '#FF991F',
  '#F15C17',
  '#19CDD7'
];

// PRE 2018
const zones2012to2018 = [92082, 26386, 4253, 924, 266722, 59799, 32218, 9002, 474016, 168817, 119575, 27581, 243473, 126326, 55163, 12606]
const zones2006to2012 = [98293, 40654, 4586, 866, 371881, 104736, 39251, 12511, 703709, 283079, 144758, 32449, 321605, 194900, 57275, 15249]

const zones2012to2018SUM = zones2012to2018.reduce((acc, row) => row + acc, 0);
// 171,8943
const zones2006to2012SUM = zones2006to2012.reduce((acc, row) => row + acc, 0);
// 242,5802


const zones = [
  {zone: 'CENTRAL', domestic: false, arrest: false, color: COLORS[0]},
  {zone: 'CENTRAL', domestic: false, arrest: true, color: COLORS[0]},
  {zone: 'CENTRAL', domestic: true, arrest: false, color: COLORS[0]},
  {zone: 'CENTRAL', domestic: true, arrest: true, color: COLORS[0]},
  {zone: 'NORTH', domestic: false, arrest: false, color: COLORS[1]},
  {zone: 'NORTH', domestic: false, arrest: true, color: COLORS[1]},
  {zone: 'NORTH', domestic: true, arrest: false, color: COLORS[1]},
  {zone: 'NORTH', domestic: true, arrest: true, color: COLORS[1]},
  {zone: 'SOUTH', domestic: false, arrest: false, color: COLORS[2]},
  {zone: 'SOUTH', domestic: false, arrest: true, color: COLORS[2]},
  {zone: 'SOUTH', domestic: true, arrest: false, color: COLORS[2]},
  {zone: 'SOUTH', domestic: true, arrest: true, color: COLORS[2]},
  {zone: 'WEST', domestic: false, arrest: false, color: COLORS[3]},
  {zone: 'WEST', domestic: false, arrest: true, color: COLORS[3]},
  {zone: 'WEST', domestic: true, arrest: false, color: COLORS[3]},
  {zone: 'WEST', domestic: true, arrest: true, color: COLORS[3]}
].map((d, idx) => ({...d, count: zones2006to2012[idx]}));

// this doubles the number of arrests made during the time period under conisderation
// important for the alpha simulation figure
const MODIFY_ARRESTS_PROPTION = false;
if (MODIFY_ARRESTS_PROPTION) {
  for (let i = 0; i < zones.length; i++) {
    if (zones[i].arrest) {
      zones[i].count *= 2;
    }
  }
}

export const PREPPED_ZONES = zones;

// OLD VERSION FOR DIVIDING CITY
//
// const zones = [
//   {zone: 'NORTH', domestic: false, arrest: false, count: 943119, color: COLORS[1]},
//   {zone: 'NORTH', domestic: false, arrest: true, count: 256723, color: COLORS[1]},
//   {zone: 'NORTH', domestic: true, arrest: false, count: 101729, color: COLORS[1]},
//   {zone: 'NORTH', domestic: true, arrest: true, count: 31449, color: COLORS[1]},
//   {zone: 'SOUTH', domestic: false, arrest: false, count: 1749272, color: COLORS[2]},
//   {zone: 'SOUTH', domestic: false, arrest: true, count: 674192, color: COLORS[2]},
//   {zone: 'SOUTH', domestic: true, arrest: false, count: 372711, color: COLORS[2]},
//   {zone: 'SOUTH', domestic: true, arrest: true, count: 85908, color: COLORS[2]},
//   {zone: 'WEST', domestic: false, arrest: false, count: 826649, color: COLORS[3]},
//   {zone: 'WEST', domestic: false, arrest: true, count: 488395, color: COLORS[3]},
//   {zone: 'WEST', domestic: true, arrest: false, count: 161632, color: COLORS[3]},
//   {zone: 'WEST', domestic: true, arrest: true, count: 39931, color: COLORS[3]}
// ];
// const CENTER = [
//   {zone: 'CENTRAL', domestic: false, arrest: false, count: 275964, color: COLORS[0]},
//   {zone: 'CENTRAL', domestic: false, arrest: true, count: 107770, color: COLORS[0]},
//   {zone: 'CENTRAL', domestic: true, arrest: false, count: 13312, color: COLORS[0]},
//   {zone: 'CENTRAL', domestic: true, arrest: true, count: 2826, color: COLORS[0]}
// ];
//
// const zones1 = [...zones];
// const ADD_TO_NORTH = false;
// for (let i = 0; i < 4; i++) {
//   zones1[i + (ADD_TO_NORTH ? 4 : 0)].count += CENTER[i].count;
// }

// const TABLE_CART_DATA = [
//   [zones[0], zones[2]],
//   [zones[1], zones[3]],
//   [zones[4], zones[6]],
//   [zones[5], zones[7]],
//   [zones[8], zones[10]],
//   [zones[9], zones[11]],
//   [zones[12], zones[14]],
//   [zones[13], zones[15]]
// ];
const TABLE_CART_DATA = [];
for (let i = 0; i < zones.length / 2; i++) {
  TABLE_CART_DATA.push([zones[2 * i + 0], zones[2 * i + 1]]);
}
export const CHICAGO_ARRESTS = TABLE_CART_DATA;

const SUNBURST = {children: []};
['CENTRAL', 'NORTH', 'SOUTH', 'WEST'].forEach((zone, idx) => {
  SUNBURST.children.push({
    // title: zone,
    children: [],
    color: COLORS[idx]
  });
  ['NON_DOMESTIC', 'DOMESTIC'].forEach((dom, jdx) => {
    SUNBURST.children[idx].children.push({
      // title: dom,
      children: [],
      color: COLORS[idx],
      opacity: !jdx ? 1 : 0.5
    });
    ['ARREST', 'NO_ARREST'].forEach((arrest, kdx) => {
      SUNBURST.children[idx].children[jdx].children.push({
        // title: arrest,
        size: 0,
        color: COLORS[idx],
        opacity: !jdx ? (!kdx ? 1 : 0.75) : (!kdx ? 0.5 : 0.25)
      });
      // SUNBURST[zone][dom][arrest] = {};
    });
  });
});
zones.forEach(row => {
  const zone = ['CENTRAL', 'NORTH', 'SOUTH', 'WEST'].findIndex(d => d === row.zone);
  const dom = !row.domestic ? 1 : 0;
  const arrest = row.arrest ? 1 : 0;
  SUNBURST.children[zone].children[dom].children[arrest].size += row.count;
  SUNBURST.children[zone].children[dom].children[arrest].label = `${Math.round(row.count / 1000)}k`;
});

export const SUNBURST_DATA = SUNBURST;
