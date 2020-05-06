import Elements from './elements.json';

// Source Wikipedia

const elementLookUp = Elements.reduce((acc: any, row: any) => {
  acc[row.Symbol] = {...row, unit: 1};
  return acc;
}, {});

const ElementsOfInterest = [
  ['Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn'],
  ['Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd'],
  ['La', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pr', 'Au', 'Hg'],
].map((row) => row.map((symbol) => elementLookUp[symbol]));

// Some bugs in here for some of the tables
export const ElementsOfInterest2 = [
  ['B', 'C', 'N', 'O', 'F', 'Ne'],
  ['Al', 'Si', 'P', 'S', 'Cl', 'Ar'],
  ['Ga', 'Ge', 'As', 'Se', 'Br', 'Kr'],
  ['In', 'Sn', 'Sb', 'Te', 'I', 'Xe'],
  ['Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn'],
].map((row) => row.map((symbol) => elementLookUp[symbol]));
const generateElementTable = (key: any) =>
  ElementsOfInterest.map((row) => row.map((cell) => ({symbol: cell.Symbol, value: Number(cell[key])})));

export const ELELMENTS_THERMAL = generateElementTable('C');
// dont have molar volume
export const ELELMENTS_DENSITY = generateElementTable('Density');
export const ELELMENTS_BOIL = generateElementTable('Boil');
export const ELELMENTS_MASS = generateElementTable('Atomic weight');
export const ELELMENTS_UNIT = generateElementTable('unit');

export const ELEMENT_TABLES = [
  'ELELMENTS_THERMAL',
  'ELELMENTS_DENSITY',
  'ELELMENTS_BOIL',
  'ELELMENTS_MASS',
  'ELELMENTS_UNIT',
];
