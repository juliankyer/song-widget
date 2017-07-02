const songs = (state = [], action) => {
  switch (action.type) {
    case 'RECEIVED_SONGS':
      return [...action.songs];
    default:
      return state;
  }
}

export default songs;
