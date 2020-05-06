import {
  interpolateInferno,
  interpolateReds,
  interpolatePlasma,
  interpolateGreens,
  interpolateRdBu,
  interpolateViridis,
  interpolateYlGnBu,
} from 'd3-scale-chromatic';
import {hexOver} from 'hex-over';
import {color} from 'd3-color';
export const RV_COLORS = [
  '#19CDD7',
  '#DDB27C',
  '#88572C',
  '#FF991F',
  '#F15C17',
  '#223F9A',
  '#DA70BF',
  '#125C77',
  '#4DC19C',
  '#776E57',
  '#12939A',
  '#17B8BE',
  '#F6D18A',
  '#B7885E',
  '#FFCB99',
  '#F89570',
  '#829AE3',
  '#E79FD5',
  '#1E96BE',
  '#89DAC1',
  '#B3AD9E',
];

export const COLOR_BREWER_QUAL_10 = [
  '#8dd3c7',
  '#ffffb3',
  '#bebada',
  '#fb8072',
  '#80b1d3',
  '#fdb462',
  '#b3de69',
  '#fccde5',
  // '#d9d9d9',
  '#89DAC1',
  // '#bc80bd'
  '#88572C',
];

const clamp = (x: number, lb: number, ub: number): number => Math.max(Math.min(x, ub), lb);
const clampWithDefault = (v: number): number => (isFinite(v) ? clamp(v, 0, 1) : 1);

type Domain = {min: number; max: number};
type ColorMode = (cell: any, index: number, {min, max}: Domain) => string;
export const COLOR_MODES: {[x: string]: ColorMode} = {
  valueHeat: (cell, index, {min, max}) => interpolateInferno(1 - (cell.value - min) / (max - min)),
  valueHeatReds: (cell, index, {min, max}) =>
    interpolateReds(1 - Math.sqrt(1 - (cell.value - min) / (max - min))),
  valueHeatGreens: (cell, index, {min, max}) => {
    return interpolateGreens(1 - Math.sqrt(1 - (cell.value - min) / (max - min)));
  },
  valueHeatBlueGreens: (cell, index, {min, max}) => {
    return interpolateYlGnBu(1 - Math.sqrt(1 - (cell.value - min) / (max - min)));
  },
  confusiongramHardCode: (cell) => {
    const [min, max] = [0, 13];

    // const val = 1 - (1 - (cell.value - min) / (max - min));
    const val = (cell.data.show - min) / (max - min);
    return interpolateReds(clampWithDefault(val));
  },
  valueHeatRedWhiteBlue: (cell, index, {min, max}) => {
    return interpolateRdBu(1 - (cell.value - min) / (max - min));
  },
  valueHeatCool: (cell, index, {min, max}) => {
    return interpolateViridis(Math.sqrt((cell.value - min) / (max - min)));
  },
  valueHeatRedWhiteBlueReverse: (cell, index, {min, max}) => {
    return interpolateRdBu((cell.value - min) / (max - min));
  },
  errorHeat: (cell) => interpolateInferno(Math.sqrt(cell.individualError)),
  errorReds: (cell) => {
    // note the square root!
    const value = Math.round(clamp(255 * Math.pow(cell.individualError, 1 / 4), 0, 255));
    return `rgb(${value}, 0, 0)`;
  },
  plasmaHeat: (cell, index, {min, max}) => interpolatePlasma((cell.value - 0) / (max - min)),
  byValue: (cell) => RV_COLORS[cell.value % RV_COLORS.length],
  byDataColor: (cell) => cell.data.color || '#fff',
  none: () => 'rgba(255, 255, 255, 0)',
  periodicColors: (cell, index) => RV_COLORS[(index + 3) % RV_COLORS.length],
  periodicColorsColorBrewer: (cell, index) => COLOR_BREWER_QUAL_10[(index + 3) % COLOR_BREWER_QUAL_10.length],
};

export const colorCell = (cell: any, index: number, fillMode: string, domain: Domain): string =>
  (COLOR_MODES[fillMode] || COLOR_MODES.node)(cell, index, domain);
