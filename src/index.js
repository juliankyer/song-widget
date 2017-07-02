import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';

import './index.css';
import AppContainer from './containers/AppContainer';
import rootReducer from './reducers/index';
import registerServiceWorker from './registerServiceWorker';

const devTools = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
const store = createStore(rootReducer, devTools, applyMiddleware(logger, thunk));

const Root = () => {
  return (
    <Provider store={ store }>
      <AppContainer />
    </Provider>
  )
}

render(<Root />, document.getElementById('root'));
registerServiceWorker();
