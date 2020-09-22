import React from 'react';
import PlayGround from './playground';
import ReactMarkdown from 'react-markdown';

import readme from '../../readme.md';
const content = readme.split('## Installation')[1];

function nester(child: any, depth: number): JSX.Element {
  if (!depth) {
    return child;
  }
  return <div>{nester(child, depth - 1)}</div>;
}

export default function Docs(): JSX.Element {
  return (
    <div className="flex-down centered full-width full-height">
      <div id="header" className="full-width">
        {nester(<h1>table-cartogram.ts</h1>, 5)}
        <div className="flex-down">
          {nester(<h3>Display Tabular Data With Area</h3>, 3)}
          {nester(
            <h3>
              <span>More about: </span>
              <a href="https://www.mcnutt.in/#/research/table-cartogram">the project</a>/
              <a href="https://www.mcnutt.in/">the author</a>
            </h3>,
            2,
          )}
        </div>
      </div>
      <div className="center-widthed docs intro">
        <p>
          Table cartograms are a type of data visualization that represents tables of data as grid of
          quadrilaterals. They look a lot like if you were a heatmap were area-ed rather than colored. They
          may look really unconventional, but they have a surprisingly wide collection of uses, ranging from
          calendars, to pivot tables, and many others. They facilitate part-to-whole and part-to-part
          comparisons, in a similar manner as a pie chart, as well as offer specific detail look up, as in a
          traditional table or heatmap. Together these properties can make really interesting displays.
        </p>
        <p>
          In this library, table-cartogram.ts, we provide an iteration based approach to creating table
          cartograms. We follow a very simple optimization approach in which we select from a library of
          initializations, also allowing for custom ones, and then iteratively adjust the vertices via
          gradient descent until a satisfactory condition is reached. Details about the math and algorithm
          behind process can be found in the paper found{' '}
          <a href="https://www.mcnutt.in/#/research/table-cartogram">here</a>.
        </p>
        <img src="assets/zion.png" />
        <p>
          Below you will find an interactive playground component that allows you to explore a dynamic version
          of algorithm. Below that you'll find the more traditional documentation for the library.
        </p>
      </div>
      <div className="center-widthed docs">
        <h1>Playground</h1>
      </div>
      <PlayGround />
      <div id="gallery"></div>
      <div id="docs" className="center-widthed docs">
        <h1>Docs</h1>
        <ReactMarkdown source={content} />
      </div>
    </div>
  );
}
