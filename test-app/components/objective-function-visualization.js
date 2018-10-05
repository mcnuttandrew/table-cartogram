import React from 'react';

import {interpolateViridis} from 'd3-scale-chromatic';
import {scaleLinear} from 'd3-scale';
import {rgb} from 'd3-color';

import {
  objectiveFunction
} from '../../iterative-methods/objective-function';

import {
  generateInitialTable
} from '../../iterative-methods/layouts';

import {
  translateTableToVector,
  prepareRects,
  translateVectorToTable
} from '../../iterative-methods/utils';

import {
  executeOptimization
} from '../../iterative-methods/optimization';

import CartogramPlot from './table-cartogram';

function to8bit(v) {
  const i = Math.round(256 * v - 0.5);
  return i < 0 ? 0 : (i > 255 ? 255 : i);
}

class ObjectiveFunctionVisualization extends React.Component {
  state = {
    pos: [],
    ready: false
  }

  componentDidMount() {
    const {table, layout, maxSteps, stepSize} = this.props;
    const objFunc = vec => objectiveFunction(vec, table, 'coordinate');
    const constructedLayout = generateInitialTable(2, 2, table, objFunc, layout);
    let pos = translateTableToVector(constructedLayout);
    let steps = 0;
    const ticker = setInterval(() => {
      this.setState({pos, ready: true});
      pos = translateTableToVector(executeOptimization(objFunc, pos, 'coordinate', table, stepSize));
      this.paintCanvas(pos, objFunc);
      steps += 1;
      if (steps > maxSteps) {
        clearInterval(ticker);
      }
    }, 1000);
  }

  paintCanvas(pos, objFunc) {
    console.log('paint')
    const {width, height, vectorShell} = this.props;
    const x = scaleLinear().domain([0, width]).range([0, 1]);
    const y = scaleLinear().domain([0, height]).range([0, 1]);
    const vec = vectorShell([pos[0], pos[1], pos[4], pos[5]]);
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, width, height);

    let max = 0;
    for (let idx = 0; idx < height; idx++) {
      for (let jdx = 0; jdx < width; jdx++) {
        const objVal = objFunc(vec(x(idx), y(jdx)));
        if (objVal > max) {
          max = objVal;
        }
      }
    }
    // console.log(max)

    for (let idx = 0; idx < imgData.data.length; idx += 4) {
      const xVal = x((idx / 4) % width);
      const yVal = y(Math.floor((idx / 4) / width));
      const objVal = objFunc(vec(xVal, yVal));
      const {r, g, b} = rgb(interpolateViridis(Math.sqrt(1 - objVal / max)));
      imgData.data[idx + 0] = to8bit(r / 255);
      imgData.data[idx + 1] = to8bit(g / 255);
      imgData.data[idx + 2] = to8bit(b / 255);
      imgData.data[idx + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  render() {
    const {pos, ready} = this.state;
    const {width, height, table} = this.props;
    return (
      <div style={{display: 'flex', alignItems: 'center'}}>
        <canvas ref="canvas" width={width} height={height} style={{position: 'absolute'}}/>
        {ready && <CartogramPlot
          data={prepareRects(translateVectorToTable(pos, table, 1, 1), table, d => d)}
          fillMode="none"
          height={height}
          width={width}/>}
      </div>
    );
  }
}

ObjectiveFunctionVisualization.defaultProps = {
  width: 300,
  height: 300,
  // table: [[100, 1], [0.1, 10]],
  table: [[1, 10], [1, 1]],
  vectorShell: edges => (x, y) => [edges[0], edges[1], x, y, edges[2], edges[3]],
  layout: 'psuedoCartogramLayout',
  maxSteps: 1,
  stepSize: 1
};

export default ObjectiveFunctionVisualization;
