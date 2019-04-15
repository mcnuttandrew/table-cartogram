import React from 'react';
import TableCartogram from './table-cartogram';
import {tableCartogramAdaptive} from '../../';

const farenheitToCelius = farenheit => Math.floor((farenheit - 32) * (5 / 9) * 100) / 100;

export default class HourCalendar extends React.Component {
  state = {
    loaded: false,
    gons: [],
    xLabels: [],
    yLabels: []
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

    console.log(houredData.reduce((acc, row) => {
      row.forEach(({Temperature}) => {
        acc.min = Math.min(acc.min, Temperature);
        acc.max = Math.max(acc.max, Temperature);
      })
      return acc;
    }, {min: Infinity, max: -Infinity}));
    Promise.resolve()
      .then(() => {
        const {gons} = tableCartogramAdaptive({
          data: houredData,
          targetAccuracy: 0.01,
          accessor: d => Number(d.Temperature)
        });
        const xLabels = gons.slice(0, 8).map((cell, index) => {
          const DAYS = ['S', 'Su', 'M', 'T', 'W', 'Th', 'F'];
          return DAYS[Number(cell.data.Day) % 7];
        });
        const yLabels = gons.filter(d => d.data.Day === '16').map((cell, index) => {
          const hour = Number(cell.data.Hour);
          return hour % 12 ?
            `${hour % 12} ${hour >= 12 ? 'PM' : 'AM'}` :
            (hour >= 12 ? 'NOON' : 'MIDNIGHT');
        });
        this.setState({
          gons,
          xLabels,
          yLabels,
          loaded: true
        });
      });
  }

  render() {
    const {gons, loaded, xLabels, yLabels} = this.state;
    if (loaded) {
      return (<TableCartogram
        data={gons}
        fillMode={'plasmaHeat'}
        showLabels={true}
        xLabels={xLabels}
        yLabels={yLabels}
        showAxisLabels={true}
        getLabel={cell => cell.data.Temperature}
        />);
    }
    return (<div>loading</div>);
  }
}
