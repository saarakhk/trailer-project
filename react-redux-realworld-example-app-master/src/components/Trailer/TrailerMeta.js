import TrailerActions from './TrailerActions';
import { Link } from 'react-router-dom';
import React from 'react';

const TrailerMeta = props => {
  const trailer = props.trailer;
  return (
    <div className="trailer-meta">
      <Link to={`/@${trailer.author.username}`}>
        <img src={trailer.author.image} alt={trailer.author.username} />
      </Link>

      <div className="info">
        <Link to={`/@${trailer.author.username}`} className="author">
          {trailer.author.username}
        </Link>
        <span className="date">
          {new Date(trailer.createdAt).toDateString()}
        </span>
      </div>

      <TrailerActions canModify={props.canModify} trailer={trailer} />
    </div>
  );
};

export default TrailerMeta;
