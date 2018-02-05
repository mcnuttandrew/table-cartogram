import React from 'react';

import {
  XYPlot,
  PolygonSeries,
  LineSeries,
  LabelSeries
} from 'react-vis';

import {geoCenter} from '../../utils';
import {RV_COLORS} from '../colors';
const tableCartogram = require('../../index.js').default;

export default class GenericTable extends React.Component {
  state = {
    mode: 'quad'
  }
  render() {
    const {data, name, size} = this.props;
    const {mode} = this.state;
    const triangles = tableCartogram().mode(mode)(data);
    const polygons = tableCartogram().mode('polygon')(data);
    const line = tableCartogram().mode('zigzag')(data);

    return (
      <div>
        {name}
        <button onClick={() => this.setState({
          mode: mode === 'quad' ? 'triangle' : 'quad'
        })}>{`current mode: ${mode}`}</button>
        <XYPlot
          animation
          colorType="linear"
          width={600}
          height={300}
          {...size}>
          {triangles.map((cell, index) => {
            return (<PolygonSeries
              key={`triangle-${index}`}
              data={cell.vertices}
              style={{
                strokeWidth: 0.5,
                strokeOpacity: 1,
                opacity: 0.5,
                fill: RV_COLORS[(index + 3) % RV_COLORS.length]
              }}/>);
          })}
          {
            polygons.map((cell, index) => {
              return (<PolygonSeries
                key={`poly-${index}`}
                data={cell.vertices}
                style={{
                  fill: 'none',
                  strokeOpacity: 1,
                  strokeWidth: 4,
                  stroke: 'black'
                }}/>);
            })
          }
          <LabelSeries data={triangles.map((cell, index) => {
            return {...geoCenter(cell.vertices), label: `${cell.displayValue || cell.value || ''}`};
          })} />
          {

            // <LineSeries data={line} />
          }
        </XYPlot>
      </div>
    );
  }
}
