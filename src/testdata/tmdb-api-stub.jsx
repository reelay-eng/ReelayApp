const tmdbStubSearchData = require('./tmdb-search-stub.json');

const tmdbAPIStubSearch = (queryString) => {
    return tmdbStubSearchData['results'];
}

export default tmdbAPIStubSearch;