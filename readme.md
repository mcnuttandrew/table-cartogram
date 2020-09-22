# table-cartogram.js

Table cartograms are a type of data visualization that represents tables of data as grid of quadrilaterals. They look a lot like if you were a heatmap were area-ed rather than colored. They may look really unconventional, but they have a surprisingly wide collection of uses, ranging from calendars, to pivot tables, and many others. They facilitate part-to-whole and part-to-part comparisons, in a similar manner as a pie chart, as well as offer specific detail look up, as in a traditional table or heatmap. Together these properties can make really interesting displays.

<img src="./assets/zion.png" alt="Table cartogram describing visitor statistics to zion national park"/>

In this library we provide an iteration based approach to creating table cartograms. We follow a very simple optimization approach in which we select from a library of initializations, also allowing for custom ones, and then iteratively adjust the vertices via gradient descent until a satisfactory condition is reached. Details about the math and algorithm behind process are forthcoming.


What mattters here is how to use this tool.

### Installation

To install table-cartogram.js pick your favorite command line installation tool and install from npm:

```sh
npm install --save table-cartogram
```


### Usage for the impatient

This is a layout library similar to d3-force or d3-hierarchy, which means that we don't necessarilly provide a way for you to render our shapes on the page. Instead we just process the data you give us and give back the layout as specified. For instance, running

```js
import {tableCartogram} from 'table-cartogram';
const processedData = tableCartogram({
  data: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
  iterations: 300
});
```
This will run for 300 steps (is this a lot is this a little? it is unclear in general, see below for more details) and then give back the following json blob:

 ```js
 [
   {
     vertices: [
      {x: 0, y: 0},
      {x: 0, y: 0.11587962704189894},
      {x: 0.23766482934163694, y: 0.07045603854120724},
      {x: 0.2399217002219555, y: 0}
     ], value: 1, data: 1
   }, {
     vertices: [
      {x: 0.2399217002219555, y: 0},
      {x: 0.23766482934163694, y: 0.07045603854120724},
      {x: 0.5729791507019034, y: 0.1906732352855676},
      {x: 0.5807805266917323, y: 0}
     ], value: 2, data: 2
   }, {
     vertices: [
      {x: 0.5807805266917323, y: 0},
      {x: 0.5729791507019034, y: 0.1906732352855676},
      {x: 1, y: 0.1250510371936567},
      {x: 1, y: 0}
     ], value: 3, data: 3
   }, {
     vertices: [
      {x: 0, y: 0.11587962704189894},
      {x: 0, y: 0.44130111740810685},
      {x: 0.27288647717499803, y: 0.438094616754241},
      {x: 0.23766482934163694, y: 0.07045603854120724}
     ], value: 4, data: 4
   }, {
     vertices: [
      {x: 0.23766482934163694, y: 0.07045603854120724},
      {x: 0.27288647717499803, y: 0.438094616754241},
      {x: 0.6202653218584823, y: 0.4955203300528266},
      {x: 0.5729791507019034, y: 0.1906732352855676}
     ], value: 5, data: 5
   }, {
     vertices: [
      {x: 0.5729791507019034, y: 0.1906732352855676},
      {x: 0.6202653218584823, y: 0.4955203300528266},
      {x: 1, y: 0.47631624172556986},
      {x: 1, y: 0.1250510371936567}
     ], value: 6, data: 6
   }, {
     vertices: [
      {x: 0, y: 0.44130111740810685},
      {x: 0, y: 1},
      {x: 0.28234244751135684, y: 1},
      {x: 0.27288647717499803, y: 0.438094616754241}
     ], value: 7, data: 7
   }, {
     vertices: [
      {x: 0.27288647717499803, y: 0.438094616754241},
      {x: 0.28234244751135684, y: 1},
      {x: 0.6012939097461701, y: 1},
      {x: 0.6202653218584823, y: 0.4955203300528266}
     ], value: 8, data: 8
   }, {
     vertices: [
      {x: 0.6202653218584823, y: 0.4955203300528266},
      {x: 0.6012939097461701, y: 1},
      {x: 1, y: 1},
      {x: 1, y: 0.47631624172556986}
     ], value: 9, data: 9
   }
 ]
 ```
It is then up to you to figure out how to render this thing! For more impatience, check out the [iterative-display]("./showcase/components/iterative-display.js") file for more.



## API

We expose three top level functions, which related to three processing modes for the table cartogram: tableCartogram, tableCartogramWithUpdate, tableCartogramAdaptive. In a subsequent release we will expose a collection of react components for computing the table cartogram, those components currently live in showcase/components, most notably iterative-display.js (which shows the converge process for a table cartogram) and table-cartogram.js (which is a simple rendering component).


### tableCartogram

Construct a table cartogram using a fixed number of steps. 

Example: 

```js
const directResults = tableCartogram({
  data: TEST_TABLE,
  layout: 'gridLayout',
  iterations: 300,
  accessor: (d) => d.x,
  height: 0.5,
});
```

### tableCartogramWithUpdate

Construct a function for iteratively creating updates, useful for watching the descent process or debugging.


```js
const resultsBuilder = tableCartogramWithUpdate({
  data: TEST_TABLE,
  layout: 'gridLayout',
  accessor: (d) => d.x,
  height: 0.5,
});
const withUpdateResults = resultsBuilder(300);
```


### tableCartogramAdaptive

Construct a table cartogram using a fixed accuracy target.

```js
const adaptive = tableCartogramAdaptive({
  data: TEST_TABLE,
  layout: 'gridLayout',
  maxNumberOfSteps: 300,
  accessor: (d) => d.x,
  height: 0.5,
});
```

### Optimization Params

Param: lineSearchSteps  
Default: 30
Description: The number of steps to take while computing the gradient line search.

Param: useAnalytic  
Default: false
Description: Whether to use the analytic gradient or an automatically computed one.

Param: stepSize  
Default: 0.01
Description: How big a step to use in computing the gradient.

Param: nonDeterministic  
Default: false
Description: Whether to use stochastic gradient descent or just regular gradient descent.

Param: useGreedy  
Default: true
Description: Whether to use a greedy strategy (bigger shapes should be corrected first) for computing the object or a normalized one (all shapes should be corrected at the same rate).

Param: orderPenalty  
Default: 1
Description: How much penalty to assign to nodes that have gone out of order.

Param: borderPenalty  
Default: 1
Description: How much penalty to assign to nodes that have gone out of the border.

Param: overlapPenalty  
Default: 4
Description: How much penalty to assign to overlap between quads.


### Layouts

We offer a suite of 12 layouts, 10 single algorithm layouts and 2 meta layouts. Much of the control that our library offers is due to the flexibility of these layouts.

The single layouts consist of: gridLayout, zigZagOnX, zigZagOnY, zigZagOnXY, psuedoCartogramLayout, psuedoCartogramLayoutZigZag, partialPsuedoCartogram, rampX, rampY, rampXY.

The meta layouts are: pickBest and pickWorst. As the names suggest they iterate through each of the single layout options and try to select either the best or the worst one, based purely on the objective score at that point.

## Contributing and Local Development

We welcome contributions and comments. To get started simply run

1. Have Yarn/Node/Npm Installed
2. Install our deps
3. Start up the development sandbox

For example
```sh
yarn
yarn start
```

After you've developed things, make sure that code passes the tests:

```sh
yarn lint
yarn test
```

And then you're good!
