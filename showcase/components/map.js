import React from 'react';
import {geoPath, geoAlbersUsa} from 'd3-geo';
import Regions from '../../examples/large-examples/us-regions.json';
import geoData from '../../examples/large-examples/us-states.json';

const STATE_TO_REGIONS = Regions.reduce((acc, {name, states}) => {
  states.forEach(state => {
    acc[state] = name;
  });
  return acc;
}, {});

export default class MapExample extends React.Component {
  render() {
    const projection = geoAlbersUsa();
    const geoGenerator = geoPath(projection);
    // const geoRegions = geoData.features.reduce((acc, row) => {
    //   const {properties: {name}} = row;
    //   const region = STATE_TO_REGIONS[name];
    //   if (!acc[region]) {
    //     acc[region] = [];
    //   }
    //   acc[region].push(row);
    //   return acc;
    // }, {});
    return (
      <div>
        {[
          'Northeast',
          'Midwest',
          'South',
          'West',
          'US Islands'
        ].map(region => {
          return (
            <svg height={500} width={1000} key={region} className={region}>
              {geoData.features.map(({geometry, properties: {name}}) => {
                return (<path
                  fill={STATE_TO_REGIONS[name] === region ? '#D0021B' : '#fff'}
                  stroke="#000"
                  strokeWidth={0.5}
                  key={`${name}-${region}`}
                  d={geoGenerator(geometry)} />);
              })}
            </svg>
          );
        })}
      </div>

    );
  }
}
