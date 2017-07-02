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