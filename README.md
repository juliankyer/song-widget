*To use this application:*

*Clone, npm install, and npm start. Open your devTools to see the application's state changes in the console. TL;DR at the bottom.*

---

## Making API Calls With React-Redux

Here is an example of making a simple API call with React-Redux. Say you wanted to hit the **EDMTut.r** database, because you need some new songs, and you also want to overly-complicate your life in the unlikely event you might scale this app up one day. 

Here's how you could do it.

We'll set up the Redux side of things first, and then hook it up to our React application.

---

### actions.js

Let's start with defining our actions. Dispatching actions is the only way we update our Redux store. Actions are plain JS objects, and we'll be using action-creators (functions that return actions) to create them.

Our first action creator will depend on thunk middleware to handle our API call. Thunk let's us write action-creators that return functions instead of objects; this allows us to call an action-creator that makes our API request using ```fetch```, and if that promise resolves successfully, it calls a second action-creator that behaves synchronously and creates an action of the type 'RECEIVED_SONGS', with a payload of the songs we got from the API call. We'll use ```connect()``` later to allow our application to trigger the first action-creator that will eventually dispatch our 'RECEIVED_SONGS' action.

```javascript
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

*Note on isomorphic-fetch (and babel-polyfill in our index): these polyfills make the fetch API function on browsers that don't yet support it*

### Reducers 

##### songsReducer.js

Reducers are pure functions that take the previous state and an action as arguments to update state. Our application's state is an object, and you should consider the layout of that object when designing your reducers; don't make it hard on yourself to access state later on. Reducers expect predictable output, so no putting API calls or ```Math.random()``` or mutating state in here. 

*Immutability means no functions that modify state, only functions that return new, modified copies of state while leaving the original state alone. MDN docs are great for checking whether a function mutates or returns a new copy of a data-type.*

State should start as an empty array, and we can instantiate it this way by passing it to our reducer as the first argument. We pass our action as the second argument to our reducer, and then set up a ```switch``` statement to check for the action's type. If the reducer recognizes the action type, it updates state accordingly, and if not, it returns the previous state. Be aware that when we say ```state``` in a reducer, it is only referring to the part of state that it is responsible for.

```javascript
const songs = (state = [], action) => {
  switch (action.type) {
    case 'RECEIVED_SONGS':
      return [...action.songs];
    default:
      return state;
  }
}

export default songs;
```

In this widget, we are using buttons to display playlists from different genres. Since we don't want to keep old genres on the page as we click buttons, we tell the reducer that the next state will be only the payload from the action passed to it. We aren't modifying the previous array in state, nor "throwing it away," we're just saying the next state will be a different array. But if we for some reason wanted a huge, messy playlist on the screen as we click around, we could write ```return [...state, ...action.songs]```. This would copy our previous state and our next array of songs into one, new array.

##### rootReducer.js

As applications grow, there is more state to manage, which means more actions, and more reducers. We only have one store, and our reducer is how we model that store. We need a way to combine all the reducers we end up with into a single object. We could hand-roll this, but Redux provides us with the ```combineReducers``` utility that handles everything. We import all of our actions into our ```rootReducer``` file and pass them into ```combineReducers```, which calls all of the reducers being passed to it, and creates one object with the results. If nothing changes, previous state is returned.

```javascript
import { combineReducers } from 'redux';

import songs from './songsReducer';

const rootReducer = combineReducers({
  songs
});

export default rootReducer;
```

### The Store 

We've been mentioning "state" and "store" a lot. The store is a big object that holds our state, and we only get one. We use ```createStore()``` to build this object. ```createStore()``` takes three arguments: the rootReducer, pre-loaded state (here we're hooking our app up to Chrome devTools, in case the application is being used in Chrome and has the Redux extension installed), and an enhancer, which is a function. The enhancer we're using is ```applyMiddleware()```, which comes out of the box with Redux. This let's logger and thunk interact with the store (logger console logs state; it might be overkill if you're already using the Chrome devTools extension, but it nicely illustrates how store responds to async events).

```javascript
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import 'babel-polyfill';

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
```

### Time For Some React

We've set up the data side of our application. Let's connect it to React.

Our simple widget will be just a single container component. React has presentational and container components; presentational components are just concerned with the view and don't know anything about Redux, while container components can access and interact with state by dispatching actions and subscribing to the store.

We leverage ```connect()``` from ```react-redux``` to describe how a React component should interact with state. Write an ```AppContainer.js``` file that imports our component. 

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

We want our ```<App />``` component to be able to make our API call, as well as have access to the songs it returns. ```mapStateToProps``` is a function that describes what pieces of state we want passed to a component as props. In our case, we'll just grab all of state since it's only a single, small array. ```mapDispatchToProps``` allows us to inject a prop into ```<App />``` called ```fetchSongs``` that calls our fetchSongs action-creator, and eventually dispatches our 'RECEIVED_SONGS' action if all goes well.

We bundle these together with ```connect()```, and can now use our ```<AppContainer />``` component in our markup. 

Here's what our ```<App />``` component, which is now connected to the store via ```<AppContainer />```, looks like:

```javascript
import React, { Component } from 'react';
import '../styles/App.css';

class App extends Component {
  
  render() {
    const { fetchSongs, songs } = this.props;
    
    return (
      <div className="App">
        
        <h1>Click A Genre To See A Playlist</h1>
        <div className="btn-wrapper">
          <button onClick={ () => fetchSongs(1) } >Trance</button>
          <button onClick={ () => fetchSongs(2)} >House</button>
          <button onClick={ () => fetchSongs(3) } >Big Room House</button>
          <button onClick={ () => fetchSongs(4) } >Drum and Bass</button>
          <button onClick={ () => fetchSongs(5) } >Dubstep</button>
          <button onClick={ () => fetchSongs(6) } >Hardstyle</button>
          <button onClick={ () => fetchSongs(7) } >Trap</button>
          <button onClick={ () => fetchSongs(8) } >Electro</button>
          <button onClick={ () => fetchSongs(9) } >Moombahton</button>
          <button onClick={ () => fetchSongs(10) } >Wildcards</button>
        </div>
        
        { songs.map((song) => 
          <div className="track-card" key={song.id}>
            <a href={ song.video } target="_blank">
              <p>{ song.artist }, { song.title }</p>
            </a>
          </div>
        )}
      </div>
    );
  }
}

export default App;
```


### TL;DR or Snout-To-Tail

Let's step through this from a user's perspective. The application loads, and Redux dispatches an '@@INIT' action; our reducer doesn't know what this action is, so logger records it as being undefined. 

*Note that the timestamp logger writes for the "undefined" '@@INIT' action is incorrect, look to Redux devTools if you want an accurate timestamp. If you switch the order of the arguments we passed to applyMiddleware(), logger will not console log this undefined '@@INIT' action or the asynchronous API action. It will only console log our 'RECEIVED_SONGS' action, because thunk gets in the way and handles our API call before it gets to logger.*

Our store is built, an empty songs array and ```fetchSongs``` are injected into ```<App />``` as props via our ```<AppContainer />```. We click a genre button, which calls ```fetchSongs()```, and passes it the appropriate genreID for our API call. Logger tells us our asynchronous action has been dispatched, and logs that next state remains an empty songs array, because the promise in our API call hasn't resolved yet. So our software hits the ```default``` part of our ```switch``` statement in the reducer.


![Imgur](http://i.imgur.com/ldatwwj.png)

Then the promise in the API call resolves, and dispatches 'RECEIVED_SONGS' with the results of of our request as the payload. Our reducer calculates the next state and updates the store. Our React application has subscribed to store updates, and detects that our ```<AppContainer />``` has passed updated props to ```<App />```. The ```<App />``` component knows to map over **this.props.songs** and render a link for each item in the array. The virtual DOM compares its updated elements, and re-renders only what has changed. In this case, it renders our links below our buttons, leaving the rest of the page alone.

