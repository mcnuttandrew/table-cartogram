import StateMigration from './state-migration-data.json';
import REGIONS from './us-regions.json';
const StatesNames = StateMigration.map(d => d['State of residence']);

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
  const stateName = fromState['State of residence'];
  StatesNames.forEach(toState => {
    const fromRegion = STATE_TO_REGION[stateName];
    const toRegion = STATE_TO_REGION[toState];
    REGION_TO_REGION[fromRegion][toRegion] += fromState[toState];
  });
});

const NICKNAMES = {
  Northeast: 'NE',
  Midwest: 'MW',
  South: 'South',
  West: 'West',
  'US Islands': 'Islands'
};
export const namedRegions = Object.keys(NICKNAMES);
export const MIGRATION_REGION_TO_REGION = namedRegions.map(fromRegion => {
  return namedRegions.map(toRegion => ({
    value: REGION_TO_REGION[fromRegion][toRegion],
    name: `${NICKNAMES[fromRegion]} -> ${NICKNAMES[toRegion]}`
  }));
});
