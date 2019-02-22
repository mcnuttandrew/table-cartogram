import StateMigration from './state-to-state.json';
import REGIONS from './us-regions.json';
export const originalMigrationStuff = StateMigration;
const StatesNames = StateMigration.map(d => d.STATE);

const STATE_TO_REGION = REGIONS.reduce((acc, region) => {
  region.states.forEach(state => {
    acc[state] = region.name;
  });
  return acc;
}, {});

const REGION_TO_REGION = REGIONS.reduce((acc, fromRegion) => {
  acc[fromRegion.name] = REGIONS.reduce((mem, toRegion) => {
    mem[toRegion.name] = 0;
    return mem;
  }, {});
  return acc;
}, {});

export const stateMigration = StateMigration.reverse()
  .map(row => StatesNames.map(state => row[state]));
StateMigration.forEach(fromState => {
  const stateName = fromState.STATE;
  StatesNames.forEach(toState => {
    const fromRegion = STATE_TO_REGION[stateName];
    const toRegion = STATE_TO_REGION[toState];
    const num = Number(`${fromState[toState]}`.replace(/\,/g, ''));
    // if (!isFinite(num)) {
    //   console.log(num, fromState[toState])
    // }
    REGION_TO_REGION[fromRegion][toRegion] += num || 0;
  });
});

const NICKNAMES = {
  Northeast: 'NE',
  Midwest: 'MW',
  South: 'South',
  West: 'West',
  'US Islands': 'Islands'
};

export const namedRegions = [
  'South',
  'West',
  'Northeast',
  'Midwest',
  'US Islands',
];
// export const namedRegions = Object.keys(NICKNAMES);
export const REGION_NET = REGION_TO_REGION;
export const MIGRATION_REGION_TO_REGION = namedRegions.map(fromRegion => {
  return namedRegions.map(toRegion => ({
    value: REGION_TO_REGION[fromRegion][toRegion],
    name: `${NICKNAMES[fromRegion]} -> ${NICKNAMES[toRegion]}`
  }));
});
