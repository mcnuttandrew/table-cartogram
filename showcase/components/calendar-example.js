import React from 'react';

import {interpolateReds} from 'd3-scale-chromatic';
import moment from 'moment';

import {
  XYPlot,
  PolygonSeries,
  LabelSeries
} from 'react-vis';

import {
  tableCartogramAdaptive
} from '../../';

import {geoCenter} from '../../src/utils';
import Speeding from '../../examples/large-examples/speeding';

function decorateGonsWithData(data, gons) {
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[0].length; j++) {
      gons[i * data[0].length + j].data = data[i][j];
    }
  }
  return gons;
}

const MONTH_NAMES = [
  'Janurary',
  'Feburary',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];
const DAYS = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'];
const DAYS_OF_WEEK_OFFSET = 0;
const getDayOfWeekName = idx => DAYS[(idx + DAYS_OF_WEEK_OFFSET) % 7];
const weekStarts = MONTH_NAMES.map((month, idx) =>
  moment(`2017-${idx + 1}-01`, 'YYYY-MM-DD').week() - 1
);

const monthsToWeeks = weekStarts.reduce((acc, row, idx) => {
  const nextBarrier = weekStarts[idx + 1] || 53;
  const validWeeks = [];
  for (let jdx = row; jdx <= nextBarrier; jdx++) {
    validWeeks.push(jdx);
  }
  acc[idx] = validWeeks;
  return acc;
}, {});

const CAL = Object.entries(Speeding
  .map(d => {
    const date = moment(d.date);
    // if it is the first week of the next year do some special handling
    const nye = (
      (date.year() === 2017 && date.date() === 31 && date.month() === 11) ||
      (date.year() === 2018 && date.week() === 1)
    );

    return {
      week: nye ? 53 : date.week(),
      year: date.year(),
      dayOfWeek: date.day() + DAYS_OF_WEEK_OFFSET,
      dayOfMonth: date.date(),
      month: date.month(),
      count: d.count
    };
  })
  .reduce((acc, row) => {
    // again border handling
    if (!(row.year === 2017 || (row.year === 2018 && row.week === 53))) {
      return acc;
    }
    if (!acc[row.week]) {
      acc[row.week] = [];
    }
    acc[row.week].push(row);
    return acc;
  }, {}))
  .sort((a, b) => a[0] - b[0])
  .map(d => d[1]);

const DATA_DOMAIN = CAL
  .reduce((acc, row) => acc.concat(row))
  .reduce((acc, row) => {
    return {
      min: Math.min(acc.min, row.count),
      max: Math.max(acc.max, row.count)
    };
  }, {min: Infinity, max: -Infinity});

const findMinObject = (data, comparator) => {
  const minPoint = data.reduce((acc, row, idx) => {
    const newMin = comparator(row);
    if (newMin > acc.min) {
      return acc;
    }
    return {
      min: newMin,
      idx
    };
  }, {min: comparator(data[0]), idx: 0});

  return data[minPoint.idx];
};

const MONTHS = Object.entries(monthsToWeeks).reduce((acc, row) => {
  const month = Number(row[0]);
  acc[month] = row[1].map(idx => CAL[idx]).filter(d => d);
  const firstDay = findMinObject(acc[month][0], d => d.dayOfMonth);
  if (firstDay.dayOfWeek === 6) {
    acc[month] = acc[month].slice(1);
  }
  const monthString = `2017-${month > 9 ? (month + 1) : `0${(month + 1)}`}`;
  // console.log(MONTH_NAMES[month], moment(monthString, 'YYYY-MM').daysInMonth(), firstDay)
  // console.log(firstDay.dayOfWeek === 5, moment(monthString, 'YYYY-MM').daysInMonth() === 30, monthString)
  if (firstDay.dayOfWeek === 5 && moment(monthString, 'YYYY-MM').daysInMonth() === 30) {
    // console.log('!!')
    acc[month] = acc[month].slice(0, acc[month].length - 1);
  }
  return acc;
}, {});

function renderMonth(gons, month) {
  const clipToMonth = gons.filter(d => d.data.month === month);
  return (
    <div key={month}>
      <XYPlot
        className={MONTH_NAMES[month]}
        yDomain={[1, 0]}
        margin={60}
        width={500}
        height={500}>
        {clipToMonth.map((cell, index) => {
          console.log(cell.data.count)
          return (<PolygonSeries
            key={`triangle-${index}`}
            data={cell.vertices}
            style={{
              strokeWidth: 1,
              stroke: 'black',
              strokeOpacity: 1,
              opacity: 0.5,
              fill: interpolateReds(
                1 - Math.sqrt(1 - (cell.data.count - DATA_DOMAIN.min) / (DATA_DOMAIN.max - DATA_DOMAIN.min))
              )
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
        <LabelSeries data={clipToMonth.map((cell, index) => {
          return ({
            ...geoCenter(cell.vertices),
            label: `${cell.data.dayOfMonth}`,
            style: {
              textAnchor: 'middle',
              alignmentBaseline: 'middle',
              fontFamily: 'GillSans'
            }
          });
        })} />
        <LabelSeries
          data={gons.slice(0, 7).map((cell, index) => {
            const {x} = geoCenter(cell.vertices);
            return ({
              x,
              y: -0.05,
              label: getDayOfWeekName(cell.data.dayOfWeek),
              style: {
                textAnchor: 'middle',
                alignmentBaseline: 'middle',
                fontSize: 18,
                fontFamily: 'GillSans'
              }
            });
          })} />
        <LabelSeries
          data={[{
            x: 1,
            y: -0.1,
            label: MONTH_NAMES[month],
            style: {
              textAnchor: 'end',
              alignmentBaseline: 'end',
              fontFamily: 'GillSans',
              fontSize: 24
            }
          }]}/>
      </XYPlot>
    </div>
  );
}

class CalendarDisplay extends React.Component {
  state = {
    loaded: false,
    ...MONTH_NAMES.reduce((acc, row) => {
      acc[row] = false;
      return acc;
    }, {})
  }

  componentDidMount() {
    Promise.resolve()
      .then(() => {
        Object.keys(MONTHS).filter((d, i) => true).forEach(month => {
          const {gons} = tableCartogramAdaptive({
            data: MONTHS[month],
            targetAccuracy: 0.001,
            maxNumberOfSteps: Infinity,
            accessor: d => d.count,
            logging: false
          });
          this.setState({
            [MONTH_NAMES[month]]: decorateGonsWithData(MONTHS[month], gons)
          });
        });
      });

  }

  render() {
    return (
      <div style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}>
        {MONTH_NAMES.map((monthName, idx) => {
          if (!this.state[monthName]) {
            return <div key={idx}/>;
          }
          return renderMonth(this.state[monthName], idx);
        })}
      </div>
    );
  }
}

export default CalendarDisplay;
