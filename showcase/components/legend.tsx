/* eslint-disable react/no-string-refs */
import React from 'react';
import {COLOR_MODES} from '../colors';
import {interpolateReds} from 'd3-scale-chromatic';

class ContinuousLegend extends React.Component {
  componentDidMount(): void {
    // eslint-disable-next-line react/no-string-refs
    const canvas = this.refs.ctx;
    // @ts-ignore
    const ctx = canvas.getContext('2d');
    // const colorScale = scaleChromatic[this.props.d3ColorScale];
    const colorScale = COLOR_MODES.valueHeatReds;
    // jan cal scale
    // const colorScale = ({value}: any, _1: any, _2: any): string =>
    //   interpolateReds(1 - Math.sqrt(1 - (value - 1) / (1 - 0)));
    const steps = 600;
    for (let i = 0; i <= steps; i++) {
      ctx.beginPath();
      // ctx.strokeStyle = colorScale(2 * i / 600);
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
  }

  render(): JSX.Element {
    return (
      <canvas
        ref="ctx"
        style={{
          height: 100,
          width: 600,
        }}
      />
    );
  }
}

export default ContinuousLegend;
