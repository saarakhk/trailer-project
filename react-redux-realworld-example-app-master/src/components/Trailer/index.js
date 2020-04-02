import TrailerMeta from './TrailerMeta';
import CommentContainer from './CommentContainer';
import React from 'react';
import agent from '../../agent';
import { connect } from 'react-redux';
import marked from 'marked';
import { ARTICLE_PAGE_LOADED, ARTICLE_PAGE_UNLOADED } from '../../constants/actionTypes';

const mapStateToProps = state => ({
  ...state.trailer,
  currentUser: state.common.currentUser
});

const mapDispatchToProps = dispatch => ({
  onLoad: payload =>
    dispatch({ type: ARTICLE_PAGE_LOADED, payload }),
  onUnload: () =>
    dispatch({ type: ARTICLE_PAGE_UNLOADED })
});

class Trailer extends React.Component {
  componentWillMount() {
    console.log("HELLO", this.props);
    this.props.onLoad(Promise.all([
      agent.Trailers.get(this.props.match.params.slug),
      agent.Comments.forTrailer(this.props.match.params.slug)
    ]));
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  render() {
    if (!this.props.trailer) {
      return null;
    }

    const markup = { __html: marked(this.props.trailer.body, { sanitize: true }) };
    const canModify = this.props.currentUser &&
      this.props.currentUser.username === this.props.trailer.author.username;
    return (
      <div className="trailer-page">

        <div className="banner">
          <div className="container">

            <h1>{this.props.trailer.title}</h1>
            <TrailerMeta
              trailer={this.props.trailer}
              canModify={canModify} />

          </div>
        </div>

        <div className="container page">

          <div className="row trailer-content">
            <div className="col-xs-12">

              <div dangerouslySetInnerHTML={markup}></div>

              <ul className="tag-list">
                {
                  this.props.trailer.tagList.map(tag => {
                    return (
                      <li
                        className="tag-default tag-pill tag-outline"
                        key={tag}>
                        {tag}
                      </li>
                    );
                  })
                }
              </ul>

            </div>
          </div>

          <hr />

          <div className="trailer-actions">
          </div>

          <div className="row">
            <CommentContainer
              comments={this.props.comments || []}
              errors={this.props.commentErrors}
              slug={this.props.match.params.id}
              currentUser={this.props.currentUser} />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Trailer);
