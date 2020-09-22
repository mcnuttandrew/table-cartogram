import {tableCartogramWithUpdate} from '../..';
import {Gon, ComputeMode, Getter, LayoutType, Dimensions, OptimizationParams, DataTable} from '../../types';
import {area, computeErrors, geoCenter} from '../../src/utils';
import {scaleLinear} from 'd3-scale';
import {colorCell} from '../../showcase/colors';

const CONVERGENCE_THRESHOLD = 10;
const CONVERGENCE_BARRIER = 0.0001;
const stepSize = 10;
const dims = {height: 1, width: 1};
let ctx = null;

function computeDomain(data: any): {min: number; max: number} {
  return data.reduce(
    (acc, row) => {
      return {
        min: Math.min(acc.min, row.value),
        max: Math.max(acc.max, row.value),
      };
    },
    {min: Infinity, max: -Infinity},
  );
}

function decorateGonsWithErrors(data: DataTable, gons: Gon[], accessor: Getter, dims: Dimensions): any[] {
  const tableSum = data.reduce((acc, row) => acc + row.reduce((mem, cell) => mem + accessor(cell), 0), 0);
  const expectedAreas = data.map(row => row.map(cell => accessor(cell) / tableSum));
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[0].length; j++) {
      const gonArea = area(gons[i * data[0].length + j].vertices);
      const computedArea = gonArea / (dims.height * dims.width);
      const expectedArea = expectedAreas[i][j];
      const computedErr = Math.abs(computedArea - expectedArea) / Math.max(computedArea, expectedArea);
      gons[i * data[0].length + j].individualError = computedErr;
    }
  }
  return gons;
}

function drawCartogram(data: DataTable, gons: Gon[], fillMode: string): void {
  const decoratedCells = decorateGonsWithErrors(data, gons, d => d, dims);
  const valueDomain = computeDomain(gons);
  //   DO DRAWING HERE
  const xScale = scaleLinear()
    .domain([0, 1])
    .range([0, 300]);
  const yScale = scaleLinear()
    .domain([1, 0])
    .range([0, 300]);
  ctx.clearRect(0, 0, 300, 300);
  gons.forEach((gon, index) => {
    ctx.fillStyle = colorCell(gon, index, fillMode, valueDomain);
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    gon.vertices.forEach(({x, y}) => ctx.lineTo(xScale(x), yScale(y)));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    const center = geoCenter(gon.vertices);
    ctx.fillText('Hello World', xScale(center.x), yScale(center.y));
  });
}

addEventListener('message', event => {
  const {
    data: {type, payload},
  } = event;
  const localState = {
    data: [[]],
    // layout: null,
    // optimizationParams: {},
    steps: 0,
    running: false,
    currentFunc: null,
    startTime: +new Date(),
    previousValueAndCount: {value: Infinity, count: 0},
    fillMode: 'errorHeat',
  } as any;
  switch (type) {
    case 'initialize':
      ctx = event.data.payload.canvas.getContext('2d');
      break;
    case 'start':
      localState.data = payload.data;
      localState.running = true;
      localState.steps = 0;
      localState.previousValueAndCount = {value: Infinity, count: 0};
      localState.startTime = +new Date();
      localState.fillMode = payload.fillMode;
      localState.currentFunc = tableCartogramWithUpdate({
        accessor: d => d,
        data: payload.data,
        layout: payload.layout,
        optimizationParams: payload.optimizationParams,
        ...dims,
      });
      break;
    case 'updateFillMode':
      localState.fillMode = payload;
      if (!localState.running) {
        drawCartogram(localState.data, (localState.currentFunc as (x: number) => Gon[])(0), payload);
      }
      break;
    case 'end':
      localState.running = false;
      break;

    default:
      break;
  }
  if (!localState.running) {
    return;
  }
  const ticker = setInterval(() => {
    const gons = (localState.currentFunc as (x: number) => Gon[])(stepSize);
    const errorCompute = computeErrors(localState.data, gons, d => d, dims);
    if (localState.previousValueAndCount.value !== errorCompute.error) {
      localState.previousValueAndCount.count = 0;
      localState.previousValueAndCount.value = errorCompute.error;
    } else {
      localState.previousValueAndCount.count += 1;
    }
    // localErrorLog.push({x: steps, y: errorCompute.error, z: errorCompute.maxError});
    localState.steps += stepSize;
    drawCartogram(localState.data, gons, localState.fillMode);
    // setGons(decorateGonsWithErrors(data, gons, accessor, dims));

    const converged = localState.previousValueAndCount.value < CONVERGENCE_BARRIER;
    const halted = localState.previousValueAndCount.count > CONVERGENCE_THRESHOLD;
    const inError = isNaN(errorCompute.error);
    if (halted || converged || inError) {
      clearInterval(ticker);
      localState.running = false;
      //   setRunningMode(converged ? 'converged' : halted ? 'stopped' : inError ? 'errored' : runningMode);
      postMessage(
        {
          type: 'setRunningMode',
          payload: converged ? 'converged' : halted ? 'stopped' : inError ? 'errored' : false,
        },
        null,
      );
    }
    postMessage(
      {
        type: 'step',
        payload: {
          startTime: localState.startTime,
          endTime: new Date().getTime(),
          error: errorCompute.error,
          maxError: errorCompute.maxError,
          stepsTaken: localState.steps,
          errorStep: {x: localState.steps, y: errorCompute.error, z: errorCompute.maxError},
          //   errorLog: localErrorLog,
        },
      },
      null,
    );
  }, 100);
  //   return (): any => clearInterval(ticker);
  //   if (noOffscreen) {
  //     return;
  //   }

  //   if (!update) {
  //     ctx = event.data.canvas.getContext('2d');
  //     ctx.globalAlpha = 0.3;
  //   }
  //   setTimeout(() => {
  // ctx.clearRect(0, 0, WAFFLE_WIDTH, WAFFLE_HEIGHT);
  // links.forEach(link => {
  //   ctx.beginPath();
  //   ctx.moveTo(xScale(link.source.x), yScale(link.source.y));
  //   ctx.lineTo(xScale(link.target.x), yScale(link.target.y));
  //   ctx.stroke();
  //   ctx.strokeStyle = link.color;
  //   ctx.closePath();
  // });
  //   }, 750);
});

// const canvasRef = useRef(null);
// const [worker, setWorker] = useState();
// useEffect(() => {
//   const newWorker = new Worker('./rendering-worker.ts', {type: 'module'});
//   newWorker.onmessage = (event: Msg): void => {
//     switch (event.data.type) {
//       default:
//       case 'tick':
//         setScalars(event.data.payload);
//         // this.setState({progress: event.data.progress});
//         return;
//       case 'end':
//         // this.setState({
//         //   progress: 1,
//         //   nodes: event.data.nodes,
//         //   // domain: computeDomain(event.data.nodes),
//         // });
//         return;
//     }
//   };
//   // const htmlCanvas = this.refs.canvas;
//   // if (!htmlCanvas.transferControlToOffscreen) {
//   //   // this.setState({offscreenDrawingDisallowed: true});
//   //   newWorker.postMessage({type: 'start', payload: {data, optimizationParams, layout}});
//   // } else {
//   // }
//   console.log(canvasRef);
//   const canvas = canvasRef.current.transferControlToOffscreen();

//   newWorker.postMessage({type: 'initialize', payload: {canvas}}, [canvas]);
//   newWorker.postMessage({type: 'start', payload: {data, layout, optimizationParams, fillMode}});
//   setWorker(newWorker as any);
// }, []);
