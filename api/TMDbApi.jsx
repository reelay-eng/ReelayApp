const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = '033f105cd28f507f3dc6ae794d5e44f5';
const TMDB_IMAGE_API_BASE_URL = 'http://image.tmdb.org/t/p/w500/';

const YOUTUBE_BASE_URL = 'https://www.youtube.com/watch?v=';

const MAX_TITLE_MATCH_DEVIATION = 100;
const POPULARITY_WEIGHT = 1;
const TITLE_MATCH_WEIGHT = 10;
const TMDB_SEARCH_RANK_WEIGHT = 10;

// https://dmitripavlutin.com/timeout-fetch-request/
const fetchResults = async (query, options={ timeout: 500 }) => {
    const { timeout = 8000 } = options;
  
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
  
    const response = await fetch(query, {
        ...options,
        signal: controller.signal  
      }).then((response) => response.json())
        .catch((error) => {
            console.log(error);
        });
    clearTimeout(id);
    return response;
}

const compareSearchResults = (result1, result2) => {
    if (!result1.popularity) result1.popularity = 0;
    if (!result2.popularity) result2.popularity = 0;

    const result1Rank = (result1.popularity * POPULARITY_WEIGHT) 
                            - (result1.tmdb_search_rank * TMDB_SEARCH_RANK_WEIGHT);
    const result2Rank = (result2.popularity * POPULARITY_WEIGHT) 
                            - (result2.tmdb_search_rank * TMDB_SEARCH_RANK_WEIGHT);

    return (result2Rank - result1Rank);
}

const levenshteinDistance = (s, t) => {
    if (!s.length) return t.length;
    if (!t.length) return s.length;

    return Math.min(
        levenshteinDistance(s.substr(1), t) + 1,
        levenshteinDistance(t.substr(1), s) + 1,
        levenshteinDistance(s.substr(1), t.substr(1)) + (s[0] !== t[0] ? 1 : 0)
    ) + 1;
}

export const searchMovies = async (searchText) => {
    const query = `${TMDB_API_BASE_URL}/search/movie\?api_key\=${TMDB_API_KEY}&query\=${searchText}`;
    return await fetchResults(query);
}

export const searchSeries = async (searchText) => {
    const query = `${TMDB_API_BASE_URL}/search/tv\?api_key\=${TMDB_API_KEY}&query\=${searchText}`;
    return await fetchResults(query);
}

export const searchMoviesAndSeries = async (searchText) => {
    const movieSearchResults = await searchMovies(searchText);
    const movieSearchResultsTagged = (searchText.length > 0 && movieSearchResults.results) 
        ? movieSearchResults.results.map((result, index) => {
            return {
                ...result,
                is_movie: true,
                is_series: false,
                tmdb_search_rank: index,
            }}) 
        : [];

    const seriesSearchResults = await searchSeries(searchText);
    const seriesSearchResultsTagged = (searchText.length > 0 && seriesSearchResults.results) 
        ? seriesSearchResults.results.map((result, index) => {
            return {
                ...result,
                is_movie: false,
                is_series: true,
                tmdb_search_rank: index,
                title: result.name,
                release_date: result.first_air_date,
            }}) 
        : [];

    const searchResultsCombined = [...movieSearchResultsTagged, ...seriesSearchResultsTagged];
    const searchResultsCombinedSorted = searchResultsCombined.sort(compareSearchResults);
    return searchResultsCombinedSorted;
}

export const fetchSeries = async (titleID) => {
    const query = `${TMDB_API_BASE_URL}/tv\/${titleID}\?api_key\=${TMDB_API_KEY}`;
    return await fetchResults(query);
}

export const fetchSeriesCredits = async (titleID) => {
    const query = `${TMDB_API_BASE_URL}/tv\/${titleID}/credits\?api_key\=${TMDB_API_KEY}`;
    return await fetchResults(query);
}

export const fetchMovie = async (titleID) => {
    const query = `${TMDB_API_BASE_URL}/movie\/${titleID}\?api_key\=${TMDB_API_KEY}`;
    const result = await fetchResults(query);
    console.log(result);
    return result;
}

export const fetchMovieCredits = async(titleID) => {
    const query = `${TMDB_API_BASE_URL}/movie\/${titleID}/credits\?api_key\=${TMDB_API_KEY}`;
    return await fetchResults(query);
}

export const fetchMovieTrailerURI = async(titleID) => {
    try {
        const query = `${TMDB_API_BASE_URL}/movie\/${titleID}/videos\?api_key\=${TMDB_API_KEY}`;
        const videoResults = (await fetchResults(query)).results;
        if (videoResults.length == 0) return null;
        const youtubeTrailer = videoResults.find((video) => { 
            return video.site && video.site == 'YouTube' && video.type && video.type == 'Trailer' && video.key;
        });
        return youtubeTrailer.key;    
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const fetchSeriesTrailerURI = async(titleID) => {
    try {
        const query = `${TMDB_API_BASE_URL}/tv\/${titleID}/videos\?api_key\=${TMDB_API_KEY}`;
        const videoResults = (await fetchResults(query)).results;
        if (videoResults.length == 0) return null;
        const youtubeTrailer = videoResults.find((video) => { 
            return video.site && video.site == 'YouTube' && video.type && video.type == 'Trailer' && video.key;
        });
        return youtubeTrailer.key;    
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const fetchTitleWithCredits = async(titleID, isSeries) => {
    if (!titleID) return null;
    const titleObject = isSeries 
        ? await fetchSeries(titleID)
        : await fetchMovie(titleID);

    const titleCredits = isSeries
        ? await fetchSeriesCredits(titleID)
        : await fetchMovieCredits(titleID);

    const trailerURI = isSeries
        ? await fetchSeriesTrailerURI(titleID)
        : await fetchMovieTrailerURI(titleID);

    const titleObjectWithCredits = {
        ...titleObject,
        credits: titleCredits,
        trailerURI: trailerURI,
    }

    if (isSeries) {
        return {
            ...titleObjectWithCredits,
            title: titleObject.name,
            release_date: titleObject.first_air_date
        };
    } else {
        return titleObjectWithCredits;
    }
}

export const getPosterURI = (posterPath) => {
    return posterPath ? `${TMDB_IMAGE_API_BASE_URL}${posterPath}` : null;
}

export const getDirector = (titleObjectWithCredits) => {
    if (titleObjectWithCredits.credits && titleObjectWithCredits.credits.crew) {
        const crew = titleObjectWithCredits.credits.crew;
        const director = crew.find((crewMember) => { return crewMember.job && crewMember.job == 'Director' });
        return director;
    }
    return null;
}

export const getDisplayActors = (titleObjectWithCredits, max = 2) => {
    if (titleObjectWithCredits.credits && titleObjectWithCredits.credits.crew) {
        const cast = titleObjectWithCredits.credits.cast;
        const actors = cast.length < max ? cast : cast.slice(0,2);
        return actors;
    }
    return null;
}