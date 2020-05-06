import ZionVisitors from './zion-visitors';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
export const ZION_VISITORS = ZionVisitors.map((year) => MONTHS.map((month) => year[month])).slice(0, 5);

export const ZION_VISITORS_WITH_ANNOTATION = ZionVisitors.map((year) =>
  MONTHS.map((month) => ({year: year.Year, month, value: year[month]})),
).slice(0, 10);

const zeroes = MONTHS.reduce((acc, month) => {
  acc[month] = 0;
  return acc;
}, {});
export const monthMargin = ZION_VISITORS_WITH_ANNOTATION.reduce((acc, row) => {
  row.forEach(({month, value}) => {
    acc[month] += value;
  });
  return acc;
}, zeroes);

export const ZION_VISITORS_WITH_ANNOTATION_DOMAIN = ZION_VISITORS_WITH_ANNOTATION.reduce(
  (acc, row) => {
    row.forEach(({value}) => {
      acc.min = Math.min(value, acc.min);
      acc.max = Math.max(value, acc.max);
    });
    return acc;
  },
  {min: Infinity, max: -Infinity},
);
