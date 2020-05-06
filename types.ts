export type ComputeMode = 'iterative' | 'adaptive' | 'direct';
export type LayoutType =
  | 'pickWorst'
  | 'pickBest'
  | 'gridLayout'
  | 'zigZagOnX'
  | 'zigZagOnY'
  | 'zigZagOnXY'
  | 'psuedoCartogramLayout'
  | 'psuedoCartogramLayoutZigZag'
  | 'partialPsuedoCartogram';
export interface FigureConfig {
  data: any;
  stepSize: number;
  computeMode: ComputeMode;
  accessor?: (x: any) => number;
  getLabel?: (x: any) => string;
  layout?: LayoutType;
  showAxisLabels?: boolean;
  dims?: Dimensions;
  showLabelsByDefault?: boolean;
  defaultColor?: string;
  xLabels?: (string | number)[];
  yLabels?: (string | number)[];
  showBorder?: boolean;
  computeAnnotationBoxBy?: (d: any) => any;
  optimizationParams?: OptimizationParams;
}
export interface OptimizationParams {
  stepSize?: number;
  useAnalytic?: boolean;
  nonDeterministic?: boolean;
  useGreedy?: boolean;
  overlapPenalty?: number;
  orderPenalty?: number;
  borderPenalty?: number;
  lineSearchSteps?: number;
  useEvans?: boolean;
}

export type Vector = number[];
export type DataTable = number[][];
export type Pos = {x: number; y: number};
export type ArrPos = [number, number];
export type Rect = Pos[];
export type PositionTable = Pos[][];
export type Getter = (x: any) => number;
export type Dimensions = {height: number; width: number};
export type Gon = {vertices: Rect; value: number; data: number; individualError?: number};
export type ObjFunc = (vec: Vector, onlyShowPenalty?: boolean) => number;

export interface PenaltyProps {
  cell: Pos;
  newTable: PositionTable;
  inCorner: boolean;
  inFirstRow: boolean;
  inLastRow: boolean;
  i: number;
  j: number;
  inLeftColumn: boolean;
  inRightColumn: boolean;
}
