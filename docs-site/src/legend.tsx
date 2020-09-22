/* eslint-disable react/no-string-refs */
import React, {useEffect, useRef} from 'react';
import {COLOR_MODES} from '../../showcase/colors';

interface Props {
  fillMode: string;
}

export default function Legend(props: Props): JSX.Element {
  const ref = useRef(null);
  const {fillMode} = props;
  useEffect(() => {
    const ctx = ref.current.getContext('2d');
    const colorScale = COLOR_MODES[fillMode];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      ctx.beginPath();
      ctx.strokeStyle = colorScale(
        {
          value: i / (steps * 0.5),
          individualError: i / (steps * 0.5),
        },
        null,
        {min: 0, max: 1},
      );
      ctx.strokeOpacity = 1;
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 100);
      ctx.stroke();
    }
  }, [fillMode]);
  return (
    <div>
      <canvas ref={ref} height={50} width={200} />
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <span>min</span>
        <span>max</span>
      </div>
    </div>
  );
}
