import superagentPromise from 'superagent-promise';
import _superagent from 'superagent';

const superagent = superagentPromise(_superagent, global.Promise);

const API_ROOT = 'http://localhost:3000/api';

const encode = encodeURIComponent;
const responseBody = res => res.body;

let token = null;
const tokenPlugin = req => {
  if (token) {
    req.set('authorization', `Token ${token}`);
  }
}

const requests = {
  del: url =>
    superagent.del(`${API_ROOT}${url}`).use(tokenPlugin).then(responseBody),
  get: url =>
    superagent.get(`${API_ROOT}${url}`).use(tokenPlugin).then(responseBody),
  put: (url, body) =>
    superagent.put(`${API_ROOT}${url}`, body).use(tokenPlugin).then(responseBody),
  post: (url, body) =>
    superagent.post(`${API_ROOT}${url}`, body).use(tokenPlugin).then(responseBody)
};

const Auth = {
  current: () =>
    requests.get('/users'),
  login: (email, password) =>
    requests.post('/users/login', { user: { email, password } }),
  register: (username, email, password) =>
    requests.post('/users', { user: { username, email, password } }),
  save: user =>
    requests.put('/users', { user })
};

const Tags = {
  getAll: () => requests.get('/tags')
};

const limit = (count, p) => `limit=${count}&offset=${p ? p * count : 0}`;
const omitSlug = trailer => Object.assign({}, trailer, { slug: undefined })
const Trailers = {
  all: page =>
    requests.get(`/trailers?${limit(10, page)}`),
  byAuthor: (author, page) =>
    requests.get(`/trailers?author=${encode(author)}&${limit(5, page)}`),
  byTag: (tag, page) =>
    requests.get(`/trailers?tag=${encode(tag)}&${limit(10, page)}`),
  del: slug =>
    requests.del(`/trailers/${slug}`),
  favorite: slug =>
    requests.post(`/trailers/${slug}/favorite`),
  favoritedBy: (author, page) =>
    requests.get(`/trailers?favorited=${encode(author)}&${limit(5, page)}`),
  feed: () =>
    requests.get('/trailers?limit=10&offset=0'),
  get: slug =>
    requests.get(`/trailers/${slug}`),
  unfavorite: slug =>
    requests.del(`/trailers/${slug}/favorite`),
  update: trailer =>
    requests.put(`/trailers/${trailer.slug}`, { trailer: omitSlug(trailer) }),
  create: trailer =>
    requests.post('/trailers', { trailer })
};

const Comments = {
  create: (slug, comment) =>
    requests.post(`/trailers/${slug}/comments`, { comment }),
  delete: (slug, commentId) =>
    requests.del(`/trailers/${slug}/comments/${commentId}`),
  forTrailer: slug =>
    requests.get(`/trailers/${slug}/comments`)
};

const Profile = {
  follow: username =>
    requests.post(`/profiles/${username}/follow`),
  get: username =>
    requests.get(`/profiles/${username}`),
  unfollow: username =>
    requests.del(`/profiles/${username}/follow`)
};

export default {
  Trailers,
  Auth,
  Comments,
  Profile,
  Tags,
  setToken: _token => { token = _token; }
};
