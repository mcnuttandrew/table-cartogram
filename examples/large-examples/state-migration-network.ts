import StateMigration from './state-to-state.json';
import REGIONS from './us-regions-2.json';
export const originalMigrationStuff = StateMigration;
const StatesNames = StateMigration.map((d: any) => d.STATE);

const STATE_TO_REGION = REGIONS.reduce((acc: any, region: any) => {
  region.states.forEach((state: any) => {
    acc[state] = region.name;
  });
  return acc;
}, {} as any);

const REGION_TO_REGION = REGIONS.reduce((acc: any, fromRegion: any) => {
  acc[fromRegion.name] = REGIONS.reduce((mem: any, toRegion: any) => {
    mem[toRegion.name] = 0;
    return mem;
  }, {} as any);
  return acc;
}, {} as any);

export const stateMigration = StateMigration.reverse().map((row: any) =>
  StatesNames.map((state: any) => row[state]),
);
StateMigration.forEach((fromState: any) => {
  const stateName = fromState.STATE;
  StatesNames.forEach((toState: any) => {
    const fromRegion = STATE_TO_REGION[stateName];
    const toRegion = STATE_TO_REGION[toState];
    // eslint-disable-next-line no-useless-escape
    const num = Number(`${fromState[toState]}`.replace(/\,/g, ''));
    // if (!isFinite(num)) {
    //   console.log(num, fromState[toState])
    // }
    REGION_TO_REGION[fromRegion][toRegion] += num || 0;
  });
});

const NICKNAMES: {[x: string]: string} = {
  Northeast: 'NE',
  Midwest: 'MW',
  South: 'South',
  West: 'West',
  // 'US Islands': 'Islands'
};

export const namedRegions = [
  // 1
  // 'South',
  // 'West',
  // 'Northeast',
  // 'Midwest',
  // // 'US Islands',

  // 2
  'Midwest',
  'Northeast',
  'West',
  'South',

  // 3
  // 'Midwest',
  // 'West',
  // 'South',
  // 'Northeast',
];
// export const namedRegions = Object.keys(NICKNAMES);
export const REGION_NET = REGION_TO_REGION;
export const MIGRATION_REGION_TO_REGION = namedRegions.map((fromRegion: any) => {
  return namedRegions.map((toRegion) => ({
    value: REGION_TO_REGION[fromRegion][toRegion],
    name: `${NICKNAMES[fromRegion]} -> ${NICKNAMES[toRegion]}`,
  }));
});
