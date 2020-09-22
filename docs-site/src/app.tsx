import React from 'react';
import ReactDOM from 'react-dom';
import Docs from './docs';

import './main.css';
import './markdown.css';
import '../node_modules/react-vis/dist/style.css';
import 'rc-tooltip/assets/bootstrap_white.css';

ReactDOM.render(<Docs />, document.querySelector('#root-container'));
