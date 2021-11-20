import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';

const TMDB_API_BASE_URL = Constants.manifest.extra.tmdbApiBaseUrl;
const TMDB_API_KEY = Constants.manifest.extra.tmdbApiKey;
const TMDB_IMAGE_API_BASE_URL = Constants.manifest.extra.tmdbImageApiBaseUrl;

const POPULARITY_WEIGHT = 5;
const TMDB_SEARCH_RANK_WEIGHT = 10;

const matchScoreForTitleSearch = (result) => {
    const titleToSearch = result.title.toLowerCase().replace(/:/g, '');
    const searchText = result.search_text.toLowerCase().replace(/:/g, '');
    const index = titleToSearch.indexOf(searchText);

    const startsWord = (index > 0) && (titleToSearch[index - 1] == ' ');
    const startsTitle = index == 0;

    return startsWord || startsTitle ? 1 : 0;
}

const compareSearchResults = (result1, result2) => {
    const result1MatchScore = matchScoreForTitleSearch(result1);
    const result2MatchScore = matchScoreForTitleSearch(result2);

    if (result2MatchScore > result1MatchScore) {
        return 1;
    }
    if (result1MatchScore > result2MatchScore) {
        return -1;
    }

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
    const results = await fetchResults(query);

    const resultsTagged = (searchText.length > 0 && results.results) 
        ? results.results.map((result, index) => {
            return {
                ...result,
                is_movie: true,
                is_series: false,
                tmdb_search_rank: index,
                // search text included here because we can't 
                // pass it separately into the comparator function
                search_text: searchText, 
            }}) 
        : [];

    const resultsSorted = resultsTagged.sort(compareSearchResults);
    return resultsSorted;
}

export const searchSeries = async (searchText) => {
    const query = `${TMDB_API_BASE_URL}/search/tv\?api_key\=${TMDB_API_KEY}&query\=${searchText}`;
    const results = await fetchResults(query);

    const resultsTagged = (searchText.length > 0 && results.results) 
        ? results.results.map((result, index) => {
            return {
                ...result,
                is_movie: false,
                is_series: true,
                tmdb_search_rank: index,
                search_text: searchText,
                title: result.name,
                release_date: result.first_air_date,
            }}) 
        : [];

    const resultsSorted = resultsTagged.sort(compareSearchResults);
    return resultsSorted;
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
    return result;
}

export const fetchMovieCredits = async (titleID) => {
    const query = `${TMDB_API_BASE_URL}/movie\/${titleID}/credits\?api_key\=${TMDB_API_KEY}`;
    return await fetchResults(query);
}

export const fetchMovieProviders = async (titleID) => {
    try {
        const query = `${TMDB_API_BASE_URL}/movie\/${titleID}/watch/providers\?api_key\=${TMDB_API_KEY}`;
        const queryResponse = await fetchResults(query);
        if (!queryResponse || !queryResponse.results || queryResponse.results.length === 0) {
            return null;
        }

        const providers = queryResponse.results;
        return providers;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const fetchMovieTrailerURI = async (titleID) => {
    try {
        const query = `${TMDB_API_BASE_URL}/movie\/${titleID}/videos\?api_key\=${TMDB_API_KEY}`;
        const queryResponse = await fetchResults(query);
        if (!queryResponse || !queryResponse.results || queryResponse.results.length === 0) {
            return null;
        }

        const videoResults = queryResponse.results;
        const youtubeTrailer = videoResults.find((video) => { 
            return video.site && video.site == 'YouTube' && video.type && video.type == 'Trailer' && video.key;
        });
        return youtubeTrailer?.key;    
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
        return youtubeTrailer?.key;    
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const fetchAnnotatedTitle = async (titleID, isSeries) => {
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

    // const providers = await fetchMovieProviders(titleID);

    const annotatedTitle = {
        ...titleObject,
        director: getDirector(titleCredits),
        displayActors: getDisplayActors(titleCredits),
        is_movie: !isSeries,
        is_series: isSeries,
        trailerURI: trailerURI,
    }

    if (isSeries) {
        if (!titleObject.name) {
            console.log('Series title object does not have name');
            console.log(titleObject);
        }
        return {
            ...annotatedTitle,
            title: titleObject.name,
            release_date: titleObject.first_air_date
        };
    } else {
        return annotatedTitle;
    }
}

export const getDirector = (titleCredits) => {
    if (titleCredits && titleCredits.crew) {
        const crew = titleCredits.crew;
        const director = crew.find((crewMember) => { return crewMember.job && crewMember.job == 'Director' });
        return director;
    }
    return null;
}

export const getDisplayActors = (titleCredits, max = 2) => {
    if (titleCredits && titleCredits.cast) {
        const cast = titleCredits.cast;
        const actors = cast.length < max ? cast : cast.slice(0,2);
        return actors;
    }
    return null;
}

export const getPosterURL = (posterPath) => {
    return posterPath ? `${TMDB_IMAGE_API_BASE_URL}${posterPath}` : null;
}

export const getLogoURL = (logoPath) => {
    return logoPath ? `${TMDB_IMAGE_API_BASE_URL}${logoPath}` : null;
}