import React from 'react';

import {interpolatePlasma} from 'd3-scale-chromatic';

import {
  XYPlot,
  PolygonSeries,
  LabelSeries
} from 'react-vis';

import {
  tableCartogramAdaptive
} from '../../';

import {geoCenter} from '../../iterative-methods/utils';

function decorateGonsWithData(data, gons) {
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[0].length; j++) {
      gons[i * data[0].length + j].data = data[i][j];
    }
  }
  return gons;
}

const farenheitToCelius = farenheit => Math.floor((farenheit - 32) * (5 / 9) * 100) / 100;

export default class HourCalendar extends React.Component {
  state = {
    loaded: false,
    gons: []
  }

  componentDidMount() {
    const {data, celius} = this.props;
    const houredData = Object.entries(data.reduce((acc, row) => {
      const hour = Number(row.Hour);
      if (!acc[hour]) {
        acc[hour] = [];
      }
      acc[hour].push(row);
      return acc;
    }, {}))
    .sort((a, b) => a[0] - b[0])
    .map(d => d[1]
      .map(row => ({...row, Temperature: celius ? farenheitToCelius(row.Temperature) : row.Temperature}))
      .sort((a, b) => Number(a.Day) - Number(b.Day)));
    // console.log(houredData)
    Promise.resolve()
      .then(() => {
        const {gons} = tableCartogramAdaptive({
          data: houredData,
          targetAccuracy: 0.01,
          accessor: d => Number(d.Temperature)
        });
        // console.log(gons)
        this.setState({
          gons: decorateGonsWithData(data, gons),
          loaded: true,
          converged: true
        });
      });

  }

  render() {
    const {celius} = this.props;
    const {gons, loaded} = this.state;
    console.log(gons)
    const {min, max} = this.state.gons.reduce((acc, row) => {
      return {
        min: Math.min(acc.min, Number(row.value)),
        max: Math.max(acc.max, Number(row.value))
      };
    }, {min: Infinity, max: -Infinity});
    console.log(min, max)
    return (
      <div style={{display: 'flex', alignItems: 'center'}}>
        {loaded && <XYPlot
          animation
          colorType="linear"
          yDomain={[1, 0]}
          margin={65}
          width={650}
          height={650}>
          {gons.map((cell, index) => {
            return (<PolygonSeries
              key={`triangle-${index}`}
              data={cell.vertices}
              style={{
                strokeWidth: 1,
                stroke: 'black',
                strokeOpacity: 1,
                opacity: 0.5,
                fill: interpolatePlasma((cell.data.Temperature - min) / (max - min))
              }}/>);
          })}
          <PolygonSeries
            style={{
              fill: 'none',
              strokeOpacity: 1,
              strokeWidth: 1,
              stroke: 'black'
            }}
            data={[{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 1, y: 0}]} />
          <LabelSeries data={gons.map((cell, index) => {
            return ({
              ...geoCenter(cell.vertices),
              label: `${cell.data.Temperature}`,
              style: {
                textAnchor: 'middle',
                alignmentBaseline: 'middle',
                fontSize: 12
              }
            });
          })} />
          <LabelSeries
            data={gons.slice(0, 8).map((cell, index) => {
              const {x} = geoCenter(cell.vertices);
              const DAYS = ['S', 'Su', 'M', 'T', 'W', 'Th', 'F'];
              return ({
                x,
                y: -0.01,
                label: DAYS[Number(cell.data.Day) % 7],
                style: {
                  textAnchor: 'middle',
                  alignmentBaseline: 'middle',
                  fontSize: 11
                }
              });
            })} />
          <LabelSeries
            data={gons.filter(d => d.data.Day === '16').map((cell, index) => {
              const {y} = geoCenter(cell.vertices);
              const hour = Number(cell.data.Hour);
              return ({
                x: -0.01,
                y,
                label: hour % 12 ?
                  `${hour % 12} ${hour >= 12 ? 'PM' : 'AM'}` :
                  (hour >= 12 ? 'NOON' : 'MIDNIGHT'),
                style: {
                  textAnchor: 'end',
                  alignmentBaseline: 'middle',
                  fontSize: 11
                }
              });
            })} />
        </XYPlot>}
      </div>
    );
  }
}
