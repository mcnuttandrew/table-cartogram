import ZionVisitors from './zion-visitors';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
export const ZION_VISITORS = ZionVisitors.map(year => MONTHS.map(month => year[month])).slice(0, 5);

export const ZION_VISITORS_WITH_ANNOTATION = ZionVisitors.map(year =>
  MONTHS.map(month => ({year: year.Year, month, value: year[month]}))
).slice(0, 10);
