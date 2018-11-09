import {interpolateRdBu} from 'd3-scale-chromatic';
import React from 'react';

class ContinuousLegend extends React.Component {
  componentDidMount() {
    const {d3ColorScale} = this.props;
    const canvas = this.refs.ctx;
    const ctx = canvas.getContext('2d');

    for (let i = 0; i <= 600; i++) {
      ctx.beginPath();
      ctx.strokeStyle = d3ColorScale(2 * i / 600);
      ctx.strokeOpacity = 1;
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 100);
      ctx.stroke();
    }
  }

  render() {
    return (<canvas ref="ctx" style={{
      height: 100,
      width: 600
    }}/>);
  }
}

ContinuousLegend.defaultProps = {
  d3ColorScale: interpolateRdBu
};

export default ContinuousLegend;
