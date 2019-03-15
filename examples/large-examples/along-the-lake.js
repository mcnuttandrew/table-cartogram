import AlongTheLakeData from './around-the-lake.json';
import {transposeMatrix} from '../../src/utils';

const ALONG_LAKE_STATE_NAMES = {
  Manistique:	'Michigan 1',
  Gladstone:	'Michigan 1',
  Escanaba:	'Michigan 1',
  Menominee:	'Michigan 1',
  Marinette:	'Wisconsin 1',
  Oconto:	'Wisconsin 1',
  'Green Bay':	'Wisconsin 1',
  Algoma:	'Wisconsin 1',
  Kewaunee:	'Wisconsin 1',
  'Two Rivers':	'Wisconsin 1',
  Manitowoc:	'Wisconsin 1',
  Sheboygan:	'Wisconsin 1',
  'Port Washington':	'Wisconsin 1',
  Milwaukee:	'Wisconsin 1',
  'St. Francis':	'Wisconsin 1',
  Cudahy:	'Wisconsin 1',
  'South Milwaukee':	'Wisconsin 1',
  'Oak Creek':	'Wisconsin 1',
  Racine:	'Wisconsin 1',
  Kenosha:	'Wisconsin 1',
  Waukegan:	'Illinois 1',
  'North Chicago':	'Illinois 1',
  'Lake Forest':	'Illinois 1',
  Highwood:	'Illinois 1',
  'Highland Park':	'Illinois 1',
  Evanston:	'Illinois 1',
  Chicago:	'Illinois 1',
  Hammond:	'Indiana 1',
  Whiting:	'Indiana 1',
  'East Chicago':	'Indiana 1',
  Gary:	'Indiana 1',
  Portage:	'Indiana 1',
  'Michigan City':	'Indiana 1',
  'New Buffalo':	'Michigan 2',
  Bridgman:	'Michigan 2',
  'St. Joseph':	'Michigan 2',
  'Benton Harbor':	'Michigan 2',
  'South Haven':	'Michigan 2',
  Douglas:	'Michigan 2',
  Saugatuck:	'Michigan 2',
  Holland:	'Michigan 2',
  'Grand Haven':	'Michigan 2',
  Ferrysburg:	'Michigan 2',
  'Norton Shores':	'Michigan 2',
  Muskegon:	'Michigan 2',
  Ludington:	'Michigan 2',
  Manistee:	'Michigan 2',
  Frankfort:	'Michigan 2',
  'Traverse City':	'Michigan 2',
  Charlevoix:	'Michigan 2',
  Petoskey:	'Michigan 2',
  'Harbor Springs':	'Michigan 2'
};

const years = [
  // '1880',
  // '1890',
  // '1900',
  '1910',
  '1920',
  '1930',
  '1940',
  '1950',
  '1960',
  '1970',
  '1980',
  '1990',
  '2000',
  '2010'
];
const exclude = [
  'St. Francis',
  'Oak Creek',
  'Portage',
  'Bridgman',
  'Ferrysburg',
  'Norton Shores'
].reduce((acc, row) => {
  acc[row] = true;
  return acc;
}, {});

const topRow = AlongTheLakeData.filter(({name}) => !exclude[name]).map(({name}) => name);
const mainTable = years.map((year, idx) => AlongTheLakeData
  .filter(({name}) => !exclude[name])
  .map(({populations, name}) => ({
    value: populations[year] || 'NA',
    state: ALONG_LAKE_STATE_NAMES[name],
    name,
    year
  })));
  // uncomment to switch to 'reative change mode'
  // .reduce((acc, {populations, name}) => {
  //   const prevRow = acc[acc.length - 1];
  //   const newRow = ({
  //     value: populations[year] || 'NA',
  //     change: prevRow ? populations[year] / prevRow.value : 0,
  //     state: ALONG_LAKE_STATE_NAMES[name],
  //     year
  //   });
  //   acc.push(newRow);
  //   return acc;
  // }, []))
  // .map(row => row.slice(1).map(cell => {
  //   return ({...cell, value: cell.change});
  // }));
export const AlongTheLakeXLabels = topRow;
export const AlongTheLakeYLabels = years;
export const AlongTheLake = [...mainTable];

// prepping for a third order tree map that kinda fell apart
// const groupedData = transposeMatrix([topRow, ...mainTable]).reduce((acc, row) => {
//   const stateName = ALONG_LAKE_STATE_NAMES[row[0]];
//   if (!acc[stateName]) {
//     acc[stateName] = [];
//   }
//   acc[stateName].push(row);
//   return acc;
// }, {});
// export const treemappedLakeData = {
//   children: [
//     'Michigan 1',
//     'Wisconsin 1',
//     'Illinois 1',
//     'Indiana 1',
//     'Michigan 2'
//   ].map(stateName => ({
//     children: groupedData[stateName]
//       .map(row => ({children: row.slice(1).map(city => ({city: row[0], ...city}))}))
//   }))
// };
