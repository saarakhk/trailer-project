import {
  ARTICLE_FAVORITED,
  ARTICLE_UNFAVORITED,
  SET_PAGE,
  APPLY_TAG_FILTER,
  HOME_PAGE_LOADED,
  HOME_PAGE_UNLOADED,
  CHANGE_TAB,
  PROFILE_PAGE_LOADED,
  PROFILE_PAGE_UNLOADED,
  PROFILE_FAVORITES_PAGE_LOADED,
  PROFILE_FAVORITES_PAGE_UNLOADED
} from '../constants/actionTypes';

export default (state = {}, action) => {
  switch (action.type) {
    case ARTICLE_FAVORITED:
    case ARTICLE_UNFAVORITED:
      return {
        ...state,
        trailers: state.trailers.map(trailer => {
          if (trailer.slug === action.payload.trailer.slug) {
            return {
              ...trailer,
              favorited: action.payload.trailer.favorited,
              favoritesCount: action.payload.trailer.favoritesCount
            };
          }
          return trailer;
        })
      };
    case SET_PAGE:
      return {
        ...state,
        trailers: action.payload.trailers,
        trailersCount: action.payload.trailersCount,
        currentPage: action.page
      };
    case APPLY_TAG_FILTER:
      return {
        ...state,
        pager: action.pager,
        trailers: action.payload.trailers,
        trailersCount: action.payload.trailersCount,
        tab: null,
        tag: action.tag,
        currentPage: 0
      };
    case HOME_PAGE_LOADED: {
      console.log("mis see on", action)
      return {
        ...state,
        pager: action.pager,
        tags: action.payload[0].tags,
        trailers: action.payload[1].trailers,
        trailersCount: action.payload[1].trailersCount,
        currentPage: 0,
        tab: action.tab
      };
    }
    case HOME_PAGE_UNLOADED:
      return {};
    case CHANGE_TAB:
      return {
        ...state,
        pager: action.pager,
        trailers: action.payload.trailers,
        trailersCount: action.payload.trailersCount,
        tab: action.tab,
        currentPage: 0,
        tag: null
      };
    case PROFILE_PAGE_LOADED:
    case PROFILE_FAVORITES_PAGE_LOADED:
      return {
        ...state,
        pager: action.pager,
        trailers: action.payload[1].trailers,
        trailersCount: action.payload[1].trailersCount,
        currentPage: 0
      };
    case PROFILE_PAGE_UNLOADED:
    case PROFILE_FAVORITES_PAGE_UNLOADED:
      return {};
    default:
      return state;
  }
};
