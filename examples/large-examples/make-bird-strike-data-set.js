// src https://www.kaggle.com/breana/bird-strikes/version/1
// import BirdStrikes from './bird-strikes.json';
const REGIONS = [
  {
    name: 'Northeast',
    states: [
      'Connecticut',
      'Maine',
      'Massachusetts',
      'New Hampshire',
      'Rhode Island',
      'Vermont',
      'New Jersey',
      'New York',
      'Pennsylvania'
    ]
  },
  {
    name: 'Midwest',
    states: [
      'Illinois',
      'Indiana',
      'Michigan',
      'Ohio',
      'Wisconsin',
      'Iowa',
      'Kansas',
      'Minnesota',
      'Missouri',
      'Nebraska',
      'North Dakota',
      'South Dakota'
    ]
  },

  {
    name: 'South',
    states: [
      'Delaware',
      'Florida',
      'Georgia',
      'Maryland',
      'North Carolina',
      'South Carolina',
      'Virginia',
      'District of Columbia',
      'DC',
      'West Virginia',
      'Alabama',
      'Kentucky',
      'Mississippi',
      'Tennessee',
      'Arkansas',
      'Louisiana',
      'Oklahoma',
      'Texas'
    ]
  },
  {
    name: 'West',
    states: [
      'Arizona',
      'Colorado',
      'Idaho',
      'Montana',
      'Nevada',
      'New Mexico',
      'Utah',
      'Wyoming',
      'Alaska',
      'California',
      'Oregon',
      'Washington'
    ]
  },
  {
    name: 'Canada',
    states: [
      'Ontario',
      'Prince Edward Island',
      'British Columbia',
      'Quebec',
      'Alberta',
      'Manitoba',
      'Newfoundland and Labrador',
      'Saskatchewan',
      'Nova Scotia'
    ]
  },
  {
    name: 'US Islands',
    states: [
      'Hawaii',
      'Virgin Islands',
      'Puerto Rico',
      'Philippines'
    ]
  }
];

const STATE_MAP = {
  Alabama: 'AL',
  Alaska: 'AK',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  'District of Columbia': 'DC',
  Florida: 'FL',
  Georgia: 'GA',
  Hawaii: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY',

  'Virgin Islands': 'VI',
  'Puerto Rico': 'PR',
  Philippines: 'PI',

  Alberta: 'AB',
  'British Columbia': 'BC',
  Manitoba: 'MB',
  'New Brunswick': 'NB',
  'Newfoundland and Labrador': 'NL',
  'Nova Scotia': 'NS',
  'Northwest Territories': 'NT',
  Nunavut: 'NU',
  Ontario: 'ON',
  'Prince Edward Island': 'PE',
  Quebec: 'QC',
  Saskatchewan: 'SK',
  Yukon: 'YT'
};

const INV_STATE_MAP = Object.entries(STATE_MAP).reduce((acc, row) => {
  acc[row[1]] = row[0];
  return acc;
}, {});

const STATE_TO_REGION = REGIONS.reduce((acc, region) => {
  region.states.forEach(state => {
    acc[state] = region.name;
  });
  return acc;
}, {});

const strikeCounts = [
  [17913, 'TX'],
  [15546, 'CA'],
  [13148, 'FL'],
  [10580, 'NY'],
  [8879, 'IL'],
  [8324, 'CO'],
  [6470, 'PA'],
  [6359, 'OH'],
  [6050, 'TN'],
  [5675, 'NJ'],
  [4938, 'MI'],
  [4653, 'MO'],
  [4530, 'KY'],
  [4068, 'HI'],
  [3946, 'NC'],
  [3427, 'GA'],
  [3367, 'DC'],
  [3304, 'LA'],
  [3072, 'WA'],
  [2984, 'IN'],
  [2930, 'OR'],
  [2823, 'UT'],
  [2780, 'AZ'],
  [2704, 'MA'],
  [2276, 'MD'],
  [2263, 'VA'],
  [2195, 'WI'],
  [2138, 'MN'],
  [2137, 'NE'],
  [1996, 'OK'],
  [1769, 'CT'],
  [1636, 'SC'],
  [1602, 'AL'],
  [1411, 'IA'],
  [1152, 'AK'],
  [1095, 'AR'],
  [1046, 'NH'],
  [1015, 'MS'],
  [925, 'NV'],
  [904, 'ND'],
  [881, 'RI'],
  [789, 'KS'],
  [709, 'ME'],
  [655, 'SD'],
  [625, 'NM'],
  [625, 'ID'],
  [546, 'WV'],
  [466, 'PI'],
  [448, 'MT'],
  [384, 'PR'],
  [308, 'VT'],
  [231, 'WY'],
  [193, 'VI'],
  [193, 'DE'],
  [171, 'ON'],
  [114, 'BC'],
  [61, 'QC'],
  [49, 'AB'],
  [15, 'MB'],
  [8, 'NL'],
  [6, 'SK'],
  [5, 'NS']
];
const OTHER = {};
const REGION_STRIKES = strikeCounts.reduce((acc, row) => {
  const strikeRegion = STATE_TO_REGION[INV_STATE_MAP[row[1]]];
  if (!strikeRegion || row[1] === 'N/A') {
    // console.log(row['Origin State'])
    OTHER[row[1]] = true;
    return acc;
  }
  if (!acc[strikeRegion]) {
    acc[strikeRegion] = 0;
  }
  acc[strikeRegion] += row[0];
  return acc;
}, {});

console.log(JSON.stringify(OTHER, null, 2));
console.log(JSON.stringify(REGION_STRIKES, null, 2));

// PROVINENCE IS MILDLY UNCLEAR
// STARTS FEB 1990
// ENDS JUNE 2018
// sample results
// const RESULTS = {
//   Midwest: 12869,
//   South: 21423,
//   West: 13593,
//   Canada: 237,
//   Northeast: 9550,
//   'US Islands': 1491
// };
//
// total results
// {
//   "South": 68307,
//   "West": 39481,
//   "Northeast": 30142,
//   "Midwest": 38042,
//   "US Islands": 5111,
//   "Canada": 429
// }
