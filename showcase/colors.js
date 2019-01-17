import {
  interpolateInferno,
  interpolateReds,
  interpolatePlasma,
  interpolateGreens,
  interpolateRdBu
} from 'd3-scale-chromatic';

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
  '#B3AD9E'
];

export const COLOR_MODES = {
  valueHeat: (cell, index, {min, max}) =>
    interpolateInferno(1 - ((cell.value - min) / (max - min))),
  valueHeatReds: (cell, index, {min, max}) =>
    interpolateReds(1 - Math.sqrt(1 - (cell.value - min) / (max - min))),
  valueHeatGreens: (cell, index, {min, max}) => {
    console.log(min, max)
    return interpolateGreens(1 - Math.sqrt(1 - (cell.value - min) / (max - min)));
  },
  valueHeatRedWhiteBlue: (cell, index, {min, max}) => {
    return interpolateRdBu(1 - ((cell.value - min) / (max - min)));
  },
  valueHeatRedWhiteBlueReverse: (cell, index, {min, max}) => {
    return interpolateRdBu(((cell.value - min) / (max - min)));
  },
  errorHeat: (cell, index, {min, max}) =>
    interpolateInferno(Math.sqrt(cell.individualError)),
  plasmaHeat: (cell, index, {min, max}) =>
    interpolatePlasma(((cell.value - min) / (max - min))),
  byValue: (cell, index, domain) =>
    RV_COLORS[cell.value % RV_COLORS.length],
  byDataColor: (cell, index, domain) =>
    cell.data.color || '#fff',
  none: (cell, index, domain) => 'rgba(255, 255, 255, 0)',
  periodicColors: (cell, index, domain) =>
    RV_COLORS[(index + 3) % RV_COLORS.length]
};

export const colorCell = (cell, index, fillMode, domain) =>
  (COLOR_MODES[fillMode] || COLOR_MODES.node)(cell, fillMode, domain);
