import React from 'react';

import {Sankey} from 'react-vis';

// API REFERENCE
// const nodes = [{name: 'a', rotation: 0}, {name: 'b'}, {name: 'c'}];
// const links = [
//   {source: 0, target: 1, value: 10, opacity: 0.2},
//   {source: 0, target: 2, value: 20},
//   {source: 1, target: 2, value: 20}
// ];
import {REGION_NET} from '../../examples/large-examples/state-migration-network';
const REGIONS = Object.keys(REGION_NET).filter(d => d !== 'Canada');
const nodes = REGIONS.map(name => ({name: `${name}`})).concat(
  REGIONS.map(name => ({name: `${name}`}))
).map(d => ({...d, rotation: 0}));
const links = REGIONS.reduce((acc, from, idx) => {
  return acc.concat(REGIONS.map((to, jdx) => {
    return {source: idx, target: jdx + REGIONS.length, value: REGION_NET[from][to]};
  }));
}, []);

export default function BasicSankeyExample() {
  return (
    <Sankey
      nodes={nodes}
      links={links}
      width={300}
      height={300}
      labelRotation={45}
    />
  );
}
