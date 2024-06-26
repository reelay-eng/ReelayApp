import Constants from "expo-constants";
import moment from "moment";
import { fetchResults } from "./fetchResults";
import {
  cacheAnnotatedTitle,
  fetchAnnotatedTitleFromCache,
} from "./ReelayLocalTitleCache";

const TMDB_API_BASE_URL = Constants.manifest.extra.tmdbApiBaseUrl;
const TMDB_API_KEY = Constants.manifest.extra.tmdbApiKey;
const TMDB_IMAGE_API_BASE_URL =
  Constants.manifest.extra.tmdbImageApiBaseUrl.substr(0, 27);

const PLACEHOLDER_POSTER_SOURCE = require("../assets/images/reelay-splash-with-dog-black.png");
const WELCOME_VIDEO_POSTER_SOURCE = require("../assets/images/welcome-video-poster-with-dog.png");

export const EmptyTitleObject = {
  id: 0,
  director: "",
  display: "",
  displayActors: [],
  isSeries: false,
  genres: [],
  overview: "",
  posterPath: null,
  posterSource: PLACEHOLDER_POSTER_SOURCE,
  releaseDate: "1992-03-04",
  releaseYear: "1992",
  tagline: "",
  titleType: "film",
  titleKey: "film-0",
  trailerURI: null,
  rating: 0,
  runtime: 1,
};

export const fetchSeries = async (titleID) => {
  const query = `${TMDB_API_BASE_URL}/tv/${titleID}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=release_dates`;
  return await fetchResults(query);
};

export const fetchSeriesCredits = async (titleID) => {
  const query = `${TMDB_API_BASE_URL}/tv/${titleID}/credits?api_key=${TMDB_API_KEY}`;
  return await fetchResults(query);
};

export const fetchMovie = async (titleID) => {
  const query = `${TMDB_API_BASE_URL}/movie/${titleID}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=release_dates`;
  const result = await fetchResults(query);
  return result;
};

export const fetchMovieCredits = async (titleID) => {
  const query = `${TMDB_API_BASE_URL}/movie/${titleID}/credits?api_key=${TMDB_API_KEY}`;
  return await fetchResults(query);
};

export const fetchMovieProviders = async (titleID) => {
  try {
    const query = `${TMDB_API_BASE_URL}/movie/${titleID}/watch/providers?api_key=${TMDB_API_KEY}`;
    const queryResponse = await fetchResults(query);
    if (
      !queryResponse ||
      !queryResponse.results ||
      queryResponse.results.length === 0
    ) {
      return null;
    }

    const providers = queryResponse.results;
    return providers;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const fetchMovieTrailerURI = async (titleID) => {
  try {
    const query = `${TMDB_API_BASE_URL}/movie/${titleID}/videos?api_key=${TMDB_API_KEY}`;
    const queryResponse = await fetchResults(query);
    if (
      !queryResponse ||
      !queryResponse.results ||
      queryResponse.results.length === 0
    ) {
      return null;
    }

    const videoResults = queryResponse.results;
    const youtubeTrailer = videoResults.find((video) => {
      return (
        video.site &&
        video.site == "YouTube" &&
        video.type &&
        video.type == "Trailer" &&
        video.key
      );
    });
    return youtubeTrailer?.key;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const fetchSeriesTrailerURI = async (titleID) => {
  try {
    const query = `${TMDB_API_BASE_URL}/tv/${titleID}/videos?api_key=${TMDB_API_KEY}`;
    const videoResults = (await fetchResults(query))?.results ?? [];
    if (videoResults.length == 0) return null;
    const youtubeTrailer = videoResults.find((video) => {
      return (
        video.site &&
        video.site == "YouTube" &&
        video.type &&
        video.type == "Trailer" &&
        video.key
      );
    });
    return youtubeTrailer?.key;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const fetchPopularMovies = async (page = 0) => {
  try {
    // NB: TMDB starts their incrementing at 1, not 0
    const queryParams = `api_key=${TMDB_API_KEY}&language=en-US&page=${
      page + 1
    }&vote_count.gte=500`;
    // const routeGet = `${TMDB_API_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page + 1}&region=US`;
    const routeGet = `${TMDB_API_BASE_URL}/discover/movie?${queryParams}`;
    const tmdbResponse = await fetchResults(routeGet, { method: "GET" });
    const popularTitles = tmdbResponse?.results ?? [];

    const annotateMovie = async (titleObj) =>
      await fetchAnnotatedTitle({
        tmdbTitleID: titleObj?.id,
        isSeries: false,
        loadedTitleObj: titleObj,
      });

    return await Promise.all(popularTitles.map(annotateMovie));
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const fetchPopularSeries = async (page = 0) => {
  try {
    // NB: TMDB starts their incrementing at 1, not 0
    // default sorts by popularity desc
    const queryParams = `api_key=${TMDB_API_KEY}&language=en-US&page=${
      page + 1
    }&vote_count.gte=500`;
    const routeGet = `${TMDB_API_BASE_URL}/discover/tv?${queryParams}`;
    const tmdbResponse = await fetchResults(routeGet, { method: "GET" });
    const popularTitles = tmdbResponse?.results ?? [];

    const annotateSeries = async (titleObj) =>
      await fetchAnnotatedTitle({
        tmdbTitleID: titleObj?.id,
        isSeries: true,
        loadedTitleObj: titleObj,
      });

    return await Promise.all(popularTitles.map(annotateSeries));
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const fetchTrendingMovies = async () => {
  try {
    const queryParams = `api_key=${TMDB_API_KEY}&language=en-US`;
    const routeGet = `${TMDB_API_BASE_URL}/trending/all/day?${queryParams}`;
    const tmdbResponse = await fetchResults(routeGet, { method: "GET" });
    const popularTitles = tmdbResponse?.results ?? [];
    // console.log("popularTitles",popularTitles)
    const annotateSeries = async (titleObj) =>
      await fetchAnnotatedTitle({
        tmdbTitleID: titleObj?.id,
        isSeries: titleObj?.media_type == "movie" ? false : true,
        loadedTitleObj: titleObj,
        trending: true,
      });

    return await Promise.all(popularTitles.map(annotateSeries));
  } catch (error) {
    console.log(error);
    return [];
  }
};
export const fetchAnnotatedTitle = async ({
  tmdbTitleID,
  isSeries,
  isWelcomeReelay = false,
  loadedTitleObj = null,
  trending = false,
}) => {
  if (!tmdbTitleID) return EmptyTitleObject;

  const titleType = isSeries ? "tv" : "film";
  const titleCacheKey = `${titleType}-${tmdbTitleID}`;

  const cachedTitle = await fetchAnnotatedTitleFromCache(
    tmdbTitleID,
    titleType
  );
  if (cachedTitle) return cachedTitle;

  const fetchTitle = isSeries ? fetchSeries : fetchMovie;
  const fetchCredits = isSeries ? fetchSeriesCredits : fetchMovieCredits;
  const fetchTrailerURI = isSeries
    ? fetchSeriesTrailerURI
    : fetchMovieTrailerURI;

  const [resolvedTitleObject, titleCredits, trailerURI] = await Promise.all([
    loadedTitleObj || fetchTitle(tmdbTitleID),
    fetchCredits(tmdbTitleID),
    fetchTrailerURI(tmdbTitleID),
  ]);

  const posterSource = resolvedTitleObject?.poster_path
    ? { uri: getPosterURL(resolvedTitleObject.poster_path, 185) }
    : isWelcomeReelay
    ? WELCOME_VIDEO_POSTER_SOURCE
    : PLACEHOLDER_POSTER_SOURCE;

  const releaseDate = isSeries
    ? resolvedTitleObject?.first_air_date
    : resolvedTitleObject?.release_date;
  const releaseYear = releaseDate?.slice(0, 4) || "";

  const rating_object_array = resolvedTitleObject?.release_dates?.results;
  const rating =
    rating_object_array && !isSeries
      ? rating_object_array
          .find((e) => e["iso_3166_1"] === "US")
          ?.release_dates.find((e) => e.certification !== "")?.certification ||
        null
      : null;

  const annotatedTitle = {
    id: resolvedTitleObject.id,
    director: getDirector(titleCredits),
    display: trending
      ? resolvedTitleObject.original_title
      : isSeries
      ? resolvedTitleObject.name
      : resolvedTitleObject.title,
    displayActors: getDisplayActors(titleCredits),
    isSeries,
    genres: resolvedTitleObject.genres,
    overview: resolvedTitleObject.overview,
    posterPath: resolvedTitleObject.poster_path,
    posterSource,
    releaseDate,
    releaseYear,
    tagline: resolvedTitleObject.tagline,
    titleKey: titleCacheKey,
    titleType,
    trailerURI,
    rating,
    runtime:
      resolvedTitleObject.runtime ??
      resolvedTitleObject.episode_run_time?.[0] ??
      0,
    title: isSeries ? resolvedTitleObject.name : undefined,
    releaseDate: isSeries ? resolvedTitleObject.first_air_date : undefined,
  };

  cacheAnnotatedTitle(annotatedTitle);
  return annotatedTitle;
};

export const getDirector = (titleCredits) => {
  if (titleCredits && titleCredits.crew) {
    const crew = titleCredits.crew;
    const director = crew.find((crewMember) => {
      return crewMember.job && crewMember.job == "Director";
    });
    return director;
  }
  return null;
};

export const getDisplayActors = (titleCredits, max = 2) => {
  if (titleCredits && titleCredits.cast) {
    const cast = titleCredits.cast;
    const actors = cast.length < max ? cast : cast.slice(0, 2);
    return actors;
  }
  return null;
};

export const getPosterURL = (posterPath, size) => {
  return posterPath ? `${TMDB_IMAGE_API_BASE_URL}${size}${posterPath}` : null;
};

export const getLogoURL = (logoPath) => {
  return logoPath ? `${TMDB_IMAGE_API_BASE_URL}${logoPath}` : null;
};

export const changeSize = (sourceURI, newSize) => {
  if (!sourceURI?.uri) return sourceURI;
  // const sizes=['w92', 'w154', 'w185', 'w342', 'w500', 'w780']
  var uriArr = sourceURI.uri.split("/");
  uriArr[5] = newSize;
  return { uri: uriArr.join("/") };
};
