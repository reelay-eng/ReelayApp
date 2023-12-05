import Constants from "expo-constants";
import { fetchResults } from "./fetchResults";
import ReelayAPIHeaders, { getReelayAuthHeaders } from "./ReelayAPIHeaders";
import { prepareReelay } from "./ReelayDBApi";

const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;
const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;

const prepareThread = async (thread) =>
  await Promise.all(thread.map(prepareReelay));
const prepareFeed = async (feed) => await Promise.all(feed.map(prepareThread));

export const getDiscoverFeed = async ({
  authSession,
  filters = {},
  page = 0,
  reqUserSub,
  sortMethod = "mostRecent",
}) => {
  const startTime = new Date().getTime();
  const queryParams = `page=${page}&sortMethod=${sortMethod}&visibility=${FEED_VISIBILITY}`;
  const routeGet = `${REELAY_API_BASE_URL}/feed/discover?${queryParams}`;
  const filteredFeed = await fetchResults(routeGet, {
    method: "GET",
    headers: {
      ...getReelayAuthHeaders(authSession),
      filtersjson: JSON.stringify(filters),
      requsersub: reqUserSub,
    },
  });

  if (filteredFeed) {
    const endTime = new Date().getTime();
    const elapsedTimeInMilliseconds = endTime - startTime;

    const elapsedTimeInSeconds = elapsedTimeInMilliseconds / 1000;
    console.log(
      `getDiscoverFeed: ${REELAY_API_BASE_URL}/feed/discover of API took ${elapsedTimeInSeconds} seconds.`
    );
  }
  // console.log("filteredFeed",routeGet,{ ...getReelayAuthHeaders(authSession),
  //     filtersjson: JSON.stringify(filters),
  //     requsersub: reqUserSub,})
  return await prepareFeed(filteredFeed);
};

export const getDiscoverFeedLatest = async ({
  authSession,
  filters = {},
  page = 0,
  reqUserSub,
  sortMethod = "mostRecent",
}) => {
  const startTime = new Date().getTime();
  const queryParams = `page=${page}&sortMethod=${sortMethod}&visibility=${FEED_VISIBILITY}`;
  const routeGet = `${REELAY_API_BASE_URL}/feed/discovernew?${queryParams}`;
  const filteredFeed = await fetchResults(routeGet, {
    method: "GET",
    headers: {
      ...getReelayAuthHeaders(authSession),
      filtersjson: JSON.stringify(filters),
      requsersub: reqUserSub,
    },
  });

  if (filteredFeed) {
    const endTime = new Date().getTime();
    const elapsedTimeInMilliseconds = endTime - startTime;

    const elapsedTimeInSeconds = elapsedTimeInMilliseconds / 1000;
    console.log(
      `getDiscoverFeedLatest: ${REELAY_API_BASE_URL}/feed/discovernew of API took ${elapsedTimeInSeconds} seconds.`
    );
  }
  // console.log("filteredFeed",routeGet, {
  //     ...getReelayAuthHeaders(authSession),
  //     filtersjson: JSON.stringify(filters),
  //     requsersub: reqUserSub,
  // })
  return await prepareThread(filteredFeed);
};

export const getDiscoverFeedNew = async ({
  authSession,
  filters = {},
  page = 0,
  reqUserSub,
  sortMethod = "mostRecent",
}) => {
  const queryParams = `page=${page}&sortMethod=${sortMethod}&visibility=${FEED_VISIBILITY}`;
  const routeGet = `${REELAY_API_BASE_URL}/feed/latest?${queryParams}`;
  const filteredFeed = await fetchResults(routeGet, {
    method: "GET",
    headers: {
      ...getReelayAuthHeaders(authSession),
      filtersjson: JSON.stringify(filters),
      requsersub: reqUserSub,
    },
    // headers: ReelayAPIHeaders,
  });
  // console.log("filteredFeed",routeGet)
  return await prepareThread(filteredFeed);
};

export const getEmptyGlobalTopics = async ({
  authSession,
  page = 0,
  reqUserSub,
}) => {
  const routeGet = `${REELAY_API_BASE_URL}/feed/emptyGlobalTopics?page=${page}&visibility=${FEED_VISIBILITY}`;
  const emptyTopics = await fetchResults(routeGet, {
    method: "GET",
    headers: {
      ...getReelayAuthHeaders(authSession),
      requsersub: reqUserSub,
    },
  });

  for (const topic of emptyTopics) {
    topic.isEmptyTopic = true;
    topic.creator = {
      sub: topic.creatorSub,
      username: topic.creatorName,
    };
  }
  return emptyTopics;
};
