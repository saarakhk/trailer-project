import { Link } from 'react-router-dom';
import React from 'react';
import agent from '../../agent';
import { connect } from 'react-redux';
import { DELETE_ARTICLE } from '../../constants/actionTypes';

const mapDispatchToProps = dispatch => ({
  onClickDelete: payload =>
    dispatch({ type: DELETE_ARTICLE, payload })
});

const TrailerActions = props => {
  const trailer = props.trailer;
  const del = () => {
    props.onClickDelete(agent.Trailers.del(trailer.slug))
  };
  if (props.canModify) {
    return (
      <span>

        <Link
          to={`/editor/${trailer.slug}`}
          className="btn btn-outline-secondary btn-sm">
          <i className="ion-edit"></i> Edit Trailer
        </Link>

        <button className="btn btn-outline-danger btn-sm" onClick={del}>
          <i className="ion-trash-a"></i> Delete Trailer
        </button>

      </span>
    );
  }

  return (
    <span>
    </span>
  );
};

export default connect(() => ({}), mapDispatchToProps)(TrailerActions);
