import TrailerPreview from './TrailerPreview';
import ListPagination from './ListPagination';
import React from 'react';

const TrailerList = props => {
  if (!props.trailers) {
    return (
      <div className="trailer-preview">Loading...</div>
    );
  }

  if (props.trailers.length === 0) {
    return (
      <div className="trailer-preview">
        No trailers are here... yet.
      </div>
    );
  }

  return (
    <div>
      {
        props.trailers.map(trailer => {
          return (
            <TrailerPreview trailer={trailer} key={trailer.slug} />
          );
        })
      }

      <ListPagination
        pager={props.pager}
        trailersCount={props.trailersCount}
        currentPage={props.currentPage} />
    </div>
  );
};

export default TrailerList;
