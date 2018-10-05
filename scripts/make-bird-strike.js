// src https://www.kaggle.com/breana/bird-strikes/version/1
import BirdStrikes from './bird-strikes.json';
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
      'Puerto Rico'
    ]
  }
];

const STATE_TO_REGION = REGIONS.reduce((acc, region) => {
  region.states.forEach(state => {
    acc[state] = region.name;
  });
  return acc;
}, {});

const OTHER = {};

const REGION_STRIKES = BirdStrikes.reduce((acc, row) => {
  const strikeRegion = STATE_TO_REGION[row['Origin State']];
  if (!strikeRegion || row['Origin State'] === 'N/A') {
    // console.log(row['Origin State'])
    OTHER[row['Origin State']] = true;
    return acc;
  }
  if (!acc[strikeRegion]) {
    acc[strikeRegion] = 0;
  }
  acc[strikeRegion] += 1;
  return acc;
}, {});

console.log(JSON.stringify(OTHER, null, 2));
console.log(JSON.stringify(REGION_STRIKES, null, 2));

const RESULTS = {
  Midwest: 12869,
  South: 21423,
  West: 13593,
  Canada: 237,
  Northeast: 9550,
  'US Islands': 1491
};
