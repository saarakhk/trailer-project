import React from 'react';
import { Link } from 'react-router-dom';
import agent from '../agent';
import { connect } from 'react-redux';
import { ARTICLE_FAVORITED, ARTICLE_UNFAVORITED } from '../constants/actionTypes';

const FAVORITED_CLASS = 'btn btn-sm btn-primary';
const NOT_FAVORITED_CLASS = 'btn btn-sm btn-outline-primary';

const mapDispatchToProps = dispatch => ({
  favorite: slug => dispatch({
    type: ARTICLE_FAVORITED,
    payload: agent.Trailers.favorite(slug)
  }),
  unfavorite: slug => dispatch({
    type: ARTICLE_UNFAVORITED,
    payload: agent.Trailers.unfavorite(slug)
  })
});

const TrailerPreview = props => {
  const trailer = props.trailer;
  const favoriteButtonClass = trailer.favorited ?
    FAVORITED_CLASS :
    NOT_FAVORITED_CLASS;

  const handleClick = ev => {
    ev.preventDefault();
    if (trailer.favorited) {
      props.unfavorite(trailer.id);
    } else {
      props.favorite(trailer.id);
    }
  };

  return (
    <div className="trailer-preview">
      <div className="trailer-meta">
        <Link to={`/@${trailer.author.username}`}>
          <img src={trailer.author.image} alt={trailer.author.username} />
        </Link>

        <div className="info">
          <Link className="author" to={`/@${trailer.author.username}`}>
            {trailer.author.username}
          </Link>
          <span className="date">
            {new Date(trailer.createdAt).toDateString()}
          </span>
        </div>

        <div className="pull-xs-right">
          <button className={favoriteButtonClass} onClick={handleClick}>
            <i className="ion-heart"></i> {trailer.favoritesCount}
          </button>
        </div>
      </div>

      <Link to={`/trailer/${trailer.slug}`} className="preview-link">
        <h1>{trailer.title}</h1>
        <p>{trailer.description}</p>
        <span>Read more...</span>
        <ul className="tag-list">
          {
            trailer.tagList.map(tag => {
              return (
                <li className="tag-default tag-pill tag-outline" key={tag}>
                  {tag}
                </li>
              )
            })
          }
        </ul>
      </Link>
    </div>
  );
}

export default connect(() => ({}), mapDispatchToProps)(TrailerPreview);
