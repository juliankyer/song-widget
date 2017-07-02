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
