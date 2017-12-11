import React from 'react';
import { render } from 'react-dom';
import App from './App.js';
// import {unregister} from './registerServiceWorker';
import { HashRouter } from "react-router-dom";
import { Provider } from "react-redux";

import store from './store';

// Since we are using HtmlWebpackPlugin WITHOUT a template, we should create our own root node in the body element before rendering into it
let root = document.createElement('div');
root.id = "root";
document.body.appendChild( root );

render(
  <HashRouter>
    <Provider store={ store }>
      <App />
    </Provider>
  </HashRouter>,
  document.getElementById('root')
);

// unregister();

