To use this application:

Clone, npm install, and npm start. Open your devTools to see the application's state changes.


## Making API Calls With React-Redux

Here is an example of making a simple API call with React-Redux. Say you wanted to hit the EDMTut.r database, because you need some new songs, and you also want to overly-complicate your life because there's a chance you might scale this app up one day. 

Here's how you could do it.

### Set-Up

Get a new Create React App up and running, and clear out all of the stock content that comes with it.

```create-react-app song-widget```

Then, install your dependencies. We'll cover these as we go.

```npm install --save isomorphic-fetch redux redux-logger redux-thunk react-redux babel-polyfill```

### index.js

Our ```index.js``` will look like this:

```javascript
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

// thunk let's us write action-creators that return functions, not just the plain objects Redux typically requires
import thunk from 'redux-thunk';

// logger is a neat package that console logs information about the Redux store
import logger from 'redux-logger';

import { createStore, applyMiddleware } from 'redux';

import './index.css';

// containers are how Redux and React components are connected
import AppContainer from './containers/AppContainer';

import rootReducer from './reducers/index';

// this says "hey, if you have the Redux devTools extension, let it look at the store"
const devTools = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();

const store = createStore(rootReducer, devTools, applyMiddleware(logger, thunk));

const Root = () => {
  return (
    <Provider store={ store }>
      <AppContainer />
    </Provider>
  )
}

render(<Root />, document.getElementById('root'));```

In our index, we set instantiate our store using the createStore method, and we extend React with both logger and thunk. We wrap our entire application in a <Provider /> component that makes the store we've created accessible to everything in the app.

### actions.js

In this simple app, we will have two action-creators. One called ```fetchSongs``` will take a genre's id as an argument, and will be the action-creator dispatched by the buttons in our <App /> component. If the promise from the API call resolves, our second action-creator will be called.

This will fire a synchronous action ```RECEIVED_SONGS```, with a payload of the songs returned by the API call. This payload is an array of objects. The file will look like:

```javascript
import 'babel-polyfill';
import fetch from 'isomorphic-fetch';

const receivedSongs = (songs) => {
  return {
    type: 'RECEIVED_SONGS',
    songs
  }
}

export const fetchSongs = (genreID) => {
  return function(dispatch) {
    fetch(`https://db-edm.herokuapp.com/api/v1/genres/${genreID}/songs`)
    .then((response) => {
      return response.json()
    })
    .then((json) => {
      return dispatch(receivedSongs(json))
    })
    .catch(error => console.log(error))
  }
}
```

What's this isomorphic-fetch and babel-polyfill business? Not all browsers support the new ```fetch``` API, so we add these to support behind-the-times browsers until they catch up.

### songsReducer.js and rootReducer.js

Reudcers take an action and the previous state, and return a new copy of state. In this case, our reducer detects an action of the type 'RECEIVED_SONGS', and returns a new copy of state with an updated songs array. If we had something in state besides songs, we would have to handle preserving that information in our new copy of state while updating the songs array, but in this case we can just return the new array. Notice that we are not mutating previous state, we're just setting state to the new array. This means we maintain our snapshot of every state change throughout the app's lifecycle. 

In this example, I've separated the ```songsReducer``` from the ```rootReducer```, so that the app could scale up as functionality grows, but reducer could be one file if we left the app as is. Since you can only have one reducer, we use ```combineReducers``` from Redux to compile all our reducers into one object.

```javascript
const songs = (state = [], action) => {
  switch (action.type) {
    case 'RECEIVED_SONGS':
      return [...action.songs];
    default:
      return state;
  }
}

export default songs;```

```javascript
import { combineReducers } from 'redux';

import songs from './songsReducer';

const rootReducer = combineReducers({
  songs
});

export default rootReducer;
```

### Cool, now what?

So we've handled the Redux-side of things, how do we get this data to our React application?

### Containers 

Containers are how our Redux store gets tied to our React application. They're like a wrapper around a component with specific instructions on how to interact with the store.

In this case, we import the component we need to connect to the store, as well as the actions the component needs to dispatch. We use the function ```mapStateToProps``` to describe the pieces of state we want the Redux store to pass to our component; in this case, the store only holds one thing and we need it, so we'll pass the whole thing to <App />. But we could easily trim that down if we had a bunch of data in the store but only a bit had to be passed to <App />.

The ```mapDispatchToProps``` function is how we describe the actions a component is able to dispatch. There are a few way to handle this. In our example, we're passing it an object with a key identical to the action-creator we want's name as a key, and the corresponding action-creator wrapped in a dispatch call. This let's call the action-creator by name once it's passed to the component as props. 

We bundle these functions and tie them to our component with the ```connect``` API from react-redux.

```javascript
import { connect } from 'react-redux';

import App from '../components/App';
import { fetchSongs } from '../actions/actions';

const mapStateToProps = (state) => {
  return state;
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchSongs: (genreID) => dispatch(fetchSongs(genreID))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
```

### TL;DR or Snout-To-Tail 

This can be a lot to think about. Let's run through this from a user's perspective and see what is going on.

The page loads, and our state is an empty array.

```javascript
songs: []
```

We click a genre button. Our <AppContainer /> has made us able to dispatch ```fetchSongs``` by passing it to <App /> as props. We add an onClick handler to our buttons that is a callback to the fetchSongs action-creator we pulled in from props. Each button is passed the genreID it needs to render the correct content from the API.

As far as logger knows, nothing in our store has changed yet, because it has no idea ```fetchSongs``` is an asynchronous action. It sees that an action has been dispatched, but the ```fetchSongs``` action so far doesn't update the store, so it logs the previous state of an empty array, the dispatched action, and the next state, also an empty array.

While logger is console logging this potentially confusing information, our API call is being made, and the promise resolves. This fires our second action-creator, and passes our 'RECEIVED_SONGS' the payload of a songs array from the API call. Our reducer picks up an action of the type 'RECEIVED_SONGS' and updates the store with the new data.

Our <AppContainer /> that has subscribed to changes in state with mapStateToProps passes this new information to the <App /> component. 

In <App /> we've told it to look at the songs array in props, and to map over it and create a YouTube link for each song. When the application initializes, the array is empty, so nothing gets rendered. However, React now notices the updated props and re-renders its content accordingly. 







