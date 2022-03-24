import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';

const TMDB_API_BASE_URL = Constants.manifest.extra.tmdbApiBaseUrl;
const TMDB_API_KEY = Constants.manifest.extra.tmdbApiKey;
const TMDB_IMAGE_API_BASE_URL = Constants.manifest.extra.tmdbImageApiBaseUrl.substr(0,27);

const POPULARITY_WEIGHT = 5;
const TMDB_SEARCH_RANK_WEIGHT = 10;

const PLACEHOLDER_POSTER_SOURCE = require('../assets/images/reelay-splash-with-dog.png');

const matchScoreForTitleSearch = (result) => {
    const titleToSearch = result.title.toLowerCase().replace(/:/g, '');
    const searchText = result.searchText.toLowerCase().replace(/:/g, '');
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
                            - (result1.tmdbSearchRank * TMDB_SEARCH_RANK_WEIGHT);
    const result2Rank = (result2.popularity * POPULARITY_WEIGHT) 
                            - (result2.tmdbSearchRank * TMDB_SEARCH_RANK_WEIGHT);

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
                isMovie: true,
                isSeries: false,
                tmdbSearchRank: index,
                // search text included here because we can't 
                // pass it separately into the comparator function
                searchText: searchText, 
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
                isMovie: false,
                isSeries: true,
                tmdbSearchRank: index,
                searchText: searchText,
                title: result.name,
                releaseDate: result.first_air_date,
            }}) 
        : [];

    const resultsSorted = resultsTagged.sort(compareSearchResults);
    return resultsSorted;
}

export const fetchSeries = async (titleID) => {
    const query = `${TMDB_API_BASE_URL}/tv\/${titleID}\?api_key\=${TMDB_API_KEY}&language=en-US&append_to_response=release_dates`;
    return await fetchResults(query);
}

export const fetchSeriesCredits = async (titleID) => {
    const query = `${TMDB_API_BASE_URL}/tv\/${titleID}/credits\?api_key\=${TMDB_API_KEY}`;
    return await fetchResults(query);
}

export const fetchMovie = async (titleID) => {
    const query = `${TMDB_API_BASE_URL}/movie\/${titleID}\?api_key\=${TMDB_API_KEY}&language=en-US&append_to_response=release_dates`;
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

    const tmdbTitleObject = isSeries 
        ? await fetchSeries(titleID)
        : await fetchMovie(titleID);

    const titleCredits = isSeries
        ? await fetchSeriesCredits(titleID)
        : await fetchMovieCredits(titleID);

    const trailerURI = isSeries
        ? await fetchSeriesTrailerURI(titleID)
        : await fetchMovieTrailerURI(titleID);

    const releaseDate = isSeries ? tmdbTitleObject.first_air_date : tmdbTitleObject.release_date;
    const releaseYear = (releaseDate?.length >= 4) ? (releaseDate.slice(0, 4)) : '';
    
    const rating_object_array = tmdbTitleObject?.release_dates?.results;
    let rating = null;
    if (rating_object_array && !isSeries) {
		// base rating display off US categorization system, MPAA is not universal
		let ratingObject = rating_object_array.find((e) => e["iso_3166_1"] === "US");
        // filter out if the certification exists or not
		rating = ratingObject?.release_dates?.find((e) => e.certification != "")?.certification;
		if (rating === undefined) rating = null;
	}
    // todo: would like titleType to deprecate isMovie and isSeries
    const annotatedTitle = {
        id: tmdbTitleObject.id,
        director: getDirector(titleCredits),
        display: isSeries ? tmdbTitleObject.name : tmdbTitleObject.title,
        displayActors: getDisplayActors(titleCredits),
        isMovie: !isSeries,
        isSeries: isSeries,
        genres: tmdbTitleObject.genres,
        overview: tmdbTitleObject.overview,
        posterURI: tmdbTitleObject ? tmdbTitleObject.poster_path : null,
        posterSource: tmdbTitleObject?.poster_path 
            ? { uri: getPosterURL(tmdbTitleObject?.poster_path, 185) }
            : PLACEHOLDER_POSTER_SOURCE,
        releaseDate: releaseDate,
        releaseYear: releaseYear,
        tagline: tmdbTitleObject.tagline,
        titleType: (isSeries) ? 'tv' : 'film',
        trailerURI: trailerURI,
        rating: rating,
        runtime: tmdbTitleObject.runtime,
    }

    if (isSeries) {
        if (!tmdbTitleObject.name) {
            console.log('Series title object does not have name');
        }
        return {
            ...annotatedTitle,
            title: tmdbTitleObject.name,
            releaseDate: tmdbTitleObject.first_air_date
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

export const getPosterURL = (posterURI, size) => {
    return posterURI ? `${TMDB_IMAGE_API_BASE_URL}${size}${posterURI}` : null;
}

export const getLogoURL = (logoPath) => {
    return logoPath ? `${TMDB_IMAGE_API_BASE_URL}${logoPath}` : null;
}