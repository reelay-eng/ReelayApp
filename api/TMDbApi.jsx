const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = '033f105cd28f507f3dc6ae794d5e44f5';
const TMDB_IMAGE_API_BASE_URL = 'http://image.tmdb.org/t/p/w500/';

const POPULARITY_WEIGHT = 5;
const TMDB_SEARCH_RANK_WEIGHT = 10;

// https://dmitripavlutin.com/timeout-fetch-request/
const fetchResults = async (query, options={ timeout: 500 }) => {
    const { timeout = 8000 } = options;
    try {
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
    
    } catch (error) {
        console.log(error);
        return null;
    }
}

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