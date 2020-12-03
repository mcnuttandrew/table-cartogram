import React from 'react';
import {Treemap} from 'react-vis';
import EXAMPLES from '../../examples/examples';
const {DND_ALIGNMENTS} = EXAMPLES;
import {COLOR_MODES} from '../colors';
export const transposeMatrix = (mat: any[][]): any[][] => mat[0].map((col, i) => mat.map((row) => row[i]));
export default function PolygramAlts(): JSX.Element {
  console.log(DND_ALIGNMENTS);
  const {min, max} = DND_ALIGNMENTS.reduce(
    (acc, row) =>
      row.reduce((mem, cell) => {
        return {
          min: Math.min(mem.min, cell.percent),
          max: Math.max(mem.max, cell.percent),
        };
      }, acc),
    {
      min: Infinity,
      max: -Infinity,
    },
  );
  const makeTreeMapData = (dataset: any[][]): any => ({
    children: dataset.map((row) => ({
      children: row.map((cell) => {
        return {
          size: cell.percent,
          color: COLOR_MODES.valueHeatReds({value: cell.percent}, 0, {min, max}),
          title: cell.name,
        };
      }),
    })),
  });
  const dataSetA = makeTreeMapData(DND_ALIGNMENTS);
  const dataSetB = makeTreeMapData(transposeMatrix(DND_ALIGNMENTS));
  return (
    <div>
      {[dataSetA, dataSetB].map((dataset, idx) => (
        <Treemap
          key={idx}
          data={dataset as any}
          mode="slicedice"
          renderMode="SVG"
          //   hideRootNode
          style={{
            stroke: 'black',
            // strokeOpacity: 1,
            // strokeWidth: '0.8',
          }}
          margin={0}
          colorType="literal"
          //   padding={0}
          width={idx ? 563 : 149}
          height={idx ? 149 : 563}
        />
      ))}
    </div>
  );
}
