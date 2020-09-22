import React from 'react';
import PlayGround from './playground';

export default function Docs(): JSX.Element {
  return (
    <div className="flex-down centered full-width full-height">
      <div id="header" className="full-width">
        <h1>table-cartogram.ts</h1>
      </div>
      <div className="center-widthed">
        <p>
          Table cartograms are a type of data visualization that represents tables of data as grid of
          quadrilaterals. They look a lot like if you were a heatmap were area-ed rather than colored. They
          may look really unconventional, but they have a surprisingly wide collection of uses, ranging from
          calendars, to pivot tables, and many others. They facilitate part-to-whole and part-to-part
          comparisons, in a similar manner as a pie chart, as well as offer specific detail look up, as in a
          traditional table or heatmap. Together these properties can make really interesting displays.
        </p>
        <p>
          table-cartogram.ts is a javascript/typescript library that enables easy web-based construction of
          these usual structures. This is the documentation page for that library.
        </p>
        <ul>
          <li>Gallery</li>
          <li>Docs</li>
          <li>Playground</li>
        </ul>
      </div>
      <PlayGround />
    </div>
  );
}
