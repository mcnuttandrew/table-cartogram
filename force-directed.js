import {generateInitialTable, getRectsFromTable} from './iterative';
import {area} from './utils';
import {forceSimulation, forceLink, forceManyBody} from 'd3-force';
import {event} from 'd3-selection';

const buildCellFilter = (height, width, tight) =>
  tight ?
    ({x, y}) => (x >= 0 && y >= 0 && x <= width && y <= height) :
    ({x, y}) => (x >= 0 && y >= 0 && x < width && y < height);

const transposeMatrix = mat => mat[0].map((col, i) => mat.map(row => row[i]));

export function buildForceDirectedTable(table) {
  const sumArea = table.reduce((acc, row) => acc + row.reduce((mem, cell) => mem + cell, 0), 0);
  const expectedAreas = table.map(row => row.map(cell => cell / sumArea));
  console.log(expectedAreas)
  const width = table[0].length;
  const height = table.length;
  const nodes = generateInitialTable(height, width, table).reduce((acc, row, idx) => {
    return acc.concat(row.map((cell, jdx) => ({
      ...cell,
      // index: idx * (width + 1) + jdx,
      posInfo: {
        leftEdge: jdx === 0,
        rightEdge: jdx === width,
        topEdge: idx === 0,
        bottomEdge: idx === height,
        x: jdx,
        y: idx
      }
    })));
  }, [])
  .map((node, id) => {
    const {leftEdge, rightEdge, topEdge, bottomEdge} = node.posInfo;
    const newNode = {...node, id};
    if (leftEdge || rightEdge) {
      newNode.fx = node.x;
    }
    if (topEdge || bottomEdge) {
      newNode.fy = node.y;
    }
    return newNode;
  });

  const links = nodes.reduce((acc, cell, idx) => {
    const {leftEdge, rightEdge, topEdge, bottomEdge, x, y} = cell.posInfo;
    const left = {
      type: 'left',
      target: idx - 1,
      cells: [{x: x - 1, y: y - 1}, {x: x - 1, y}]
    };
    // weird index bc i switch the direcion of up. uhhhhhhh
    const bottom = {
      type: 'bottom',
      target: idx + (width + 1),
      cells: [!leftEdge && {x: x - 1, y}, {x, y}]
    };
    const top = {
      type: 'top',
      target: idx - (width + 1),
      cells: [{x: x - 1, y: y - 1}, {x, y: y - 1}]
    };
    const right = {
      type: 'right',
      target: idx + 1,
      cells: [{x, y: y - 1}, {x, y}]
    };
    const selection = [
      !leftEdge && left,
      !bottomEdge && bottom,
      !topEdge && top,
      !rightEdge && right
    ].filter(d => d).map(d => ({
      ...d,
      source: idx,
      cells: d.cells.filter(buildCellFilter(height, width))
    }));
    // console.log(selection)
    return acc.concat(selection);
  }, []);

  for (let i = 0; i < 100; i++) {
    const simulation = forceSimulation(nodes)
      // .force('charge', forceManyBody().strength((a, b) => {
      //   console.log('sim?')
      // }))
      .force('link', forceLink(links).distance(1).strength(link => {
        // console.log('link check?')
        const sumForce = link.cells.reduce((acc, {x, y}) => {

          const expectedArea = expectedAreas[y][x];
          const currentRect = [
            nodes[y * (width - 1) + x],
            nodes[y * (width - 1) + x + 1],
            nodes[(y + 1) * (width - 1) + x],
            nodes[(y + 1) * (width - 1) + x + 1]
          ];

          const foundArea = area(currentRect);
          const newForce = (expectedArea - foundArea) / expectedArea;
          // return acc + (newForce < 0 ? -0.1 : 0.1);
          return acc + newForce;
        }, 0);// / link.cells.length;
        let orderForce = 0;
        // console.log(link.type, link)
        if (
          (link.type === 'left' && (link.target.x > link.source.x)) ||
          (link.type === 'right' && (link.target.x < link.source.x)) ||
          (link.type === 'top' && (link.target.y > link.source.y)) ||
          (link.type === 'bottom' && (link.target.y < link.source.y))
        ) {
          console.log('misordered')
          orderForce = ((link.type === 'left' || link.type === 'top') ? -1 : 1) * 0.5;
        }

        const boundCheck = buildCellFilter(1, 1, true);
        const boundaryForce = !boundCheck(link.target) ?
          (((link.type === 'left' || link.type === 'top') ? -1 : 1) * 1) : 0;
        if (boundaryForce) {
          console.log('bound')
        }
        const force = (sumForce + orderForce + boundaryForce);
        // console.log(force)
        return force;
      }))
      .velocityDecay(0.9)
      .stop();

    // console.log(nodes)
    simulation.tick();
    nodes.forEach(node => {
      ['x', 'y'].forEach(letter => {
        if (node[letter] < 0) {
          node[letter] = 0;
        }
        if (node[letter] > 1) {
          node[letter] = 1;
        }
      });
    });
  }

  return nodes;
}
