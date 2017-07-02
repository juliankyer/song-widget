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
