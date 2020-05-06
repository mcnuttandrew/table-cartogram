import ZionVisitors from './zion-visitors.json';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
export const ZION_VISITORS = ZionVisitors.map((year: any) =>
  MONTHS.map((month: string) => year[month]),
).slice(0, 5);

export const ZION_VISITORS_WITH_ANNOTATION = ZionVisitors.map((year: any) =>
  MONTHS.map((month) => ({year: year.Year, month, value: year[month]})),
).slice(0, 10);

const zeroes = MONTHS.reduce((acc: any, month: any) => {
  acc[month] = 0;
  return acc;
}, {});
export const monthMargin = ZION_VISITORS_WITH_ANNOTATION.reduce((acc: any, row: any) => {
  row.forEach(({month, value}: any) => {
    acc[month] += value;
  });
  return acc;
}, zeroes);

export const ZION_VISITORS_WITH_ANNOTATION_DOMAIN = ZION_VISITORS_WITH_ANNOTATION.reduce(
  (acc: any, row: any) => {
    row.forEach(({value}: any) => {
      acc.min = Math.min(value, acc.min);
      acc.max = Math.max(value, acc.max);
    });
    return acc;
  },
  {min: Infinity, max: -Infinity},
);
