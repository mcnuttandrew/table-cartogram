import React from 'react';
import {geoPath, geoAlbersUsa} from 'd3-geo';
import Regions from '../../examples/large-examples/us-regions.json';
import geoData from '../../examples/large-examples/us-states.json';

import AroundTheLakeCities from '../../examples/large-examples/around-the-lake-city-locations.json';

const STATE_TO_REGIONS = Regions.reduce((acc, {name, states}) => {
  states.forEach((state) => {
    acc[state] = name;
  });
  return acc;
}, {});

const citypath = {
  type: 'Polygon',
  coordinates: [AroundTheLakeCities.map(({location}) => location)],
};

export default class MapExample extends React.Component {
  render() {
    const projection = geoAlbersUsa().scale(4500).translate([200, 700]);
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
          // 'Northeast',
          'Midwest',
          // 'South',
          // 'West',
          // 'US Islands'
        ].map((region) => {
          return (
            <svg height={500} width={1000} key={region} className={region}>
              {geoData.features.map(({geometry, properties: {name}}) => {
                return (
                  <path
                    fill={STATE_TO_REGIONS[name] === region ? '#D0021B' : '#fff'}
                    stroke="#000"
                    strokeWidth={0.5}
                    key={`${name}-${region}`}
                    d={geoGenerator(geometry)}
                  />
                );
              })}
              <path d={geoGenerator(citypath)} stroke="#000" fill="transparent" />
              {citypath.coordinates[0].map((coord, idx) => {
                const [cx, cy] = projection(coord) || [0, 0];
                return <circle cx={cx} cy={cy} r={5} key={idx} className={idx} fill="black" />;
              })}

              {AroundTheLakeCities.map(({location, name}, idx) => {
                const [x, y] = projection(location) || [0, 0];
                return (
                  <text x={x} y={y} key={name} className={idx}>
                    {name}
                  </text>
                );
              })}
            </svg>
          );
        })}
      </div>
    );
  }
}
