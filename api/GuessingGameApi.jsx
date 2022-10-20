import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';
import ReelayAPIHeaders, { getReelayAuthHeaders } from './ReelayAPIHeaders';
import { prepareReelay } from './ReelayDBApi';

const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;
const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;

export const addClueToGuessingGame = async ({
    authSession,
    reelayDBBody,
    reqUserSub,
    topicID,
}) => {
    // TODO
}

export const addResponseReelayToGuessingGame = async ({
    authSession,
    reelayDBBody,
    reqUserSub,
    topicID,
}) => {
    // TODO
}

export const createDraftGuessingGame = async ({
    authSession,
    clubID = null,
    correctTitleKey,
    creatorName, 
    creatorSub, 
    title, 
}) => {
    const routePost = `${REELAY_API_BASE_URL}/guessingGame/draft`;
    const postBody = {
        clubID,
        correctTitleKey,
        creatorName,
        creatorSub,
        title,
        visibility: FEED_VISIBILITY,
    };

    const createDraftGuessingGameResult = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: creatorSub,
        },
        body: JSON.stringify(postBody),
    });
    return createDraftGuessingGameResult;
}

export const getMyDraftGuessingGames = async ({ authSession, reqUserSub }) => {
    const routeGet = `${REELAY_API_BASE_URL}/guessingGame/draft?page=${page}`;
    const fetchedGames = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
    });

    const prepareGameReelays = async (guessingGame) => {
        guessingGame.reelays = await Promise.all(guessingGame.reelays.map(prepareReelay));
        return guessingGame;
    }
    const preparedGames = await Promise.all(fetchedGames.map(prepareGameReelays));
    return preparedGames;
}

export const getPublishedGuessingGames = async ({ authSession, page = 0, reqUserSub }) => {
    const routeGet = `${REELAY_API_BASE_URL}/guessingGame/published?page=${page}&visibility=${FEED_VISIBILITY}`;
    const fetchedGames = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
    });

    const prepareGameReelays = async (guessingGame) => {
        guessingGame.reelays = await Promise.all(guessingGame.reelays.map(prepareReelay));
        return guessingGame;
    }
    const preparedGames = await Promise.all(fetchedGames.map(prepareGameReelays));
    return preparedGames;
}

export const getReportedGuessingGames = async ({ authSession, reqUserSub }) => {
    const routeGet = `${REELAY_API_BASE_URL}/reported-content/guessingGame?visibility=${FEED_VISIBILITY}`;
    const fetchedReportedGuessingGames = await fetchResults(routeGet, {
        method: 'GET',
        headers: { 
            ...getReelayAuthHeaders(authSession), 
            requsersub: reqUserSub 
        },
    });

    const prepareGameReelays = async (guessingGame) => {
        guessingGame.reelays = await Promise.all(guessingGame.reelays.map(prepareReelay));
        return guessingGame;
    }
    const preparedGames = await Promise.all(fetchedReportedGuessingGames.map(prepareGameReelays));
    return preparedGames;
}

export const deleteGuessingGame = async ({ authSession, reqUserSub, topicID }) => {
    const routeDelete =  `${REELAY_API_BASE_URL}/guessingGame`;
    const deleteBody = { topicID };
    const resultDelete = await fetchResults(routeDelete, {
        method: 'DELETE',
        headers: { 
            ...getReelayAuthHeaders(authSession), 
            requsersub: reqUserSub 
        },
        body: JSON.stringify(deleteBody),
    });
    return resultDelete;
}

export const publishGuessingGame = async ({ authSession, reqUserSub, topicID }) => {
    const routePost = `${REELAY_API_BASE_URL}/guessingGame/publish`;
    const postBody = { topicID };

    const publishResult = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
        body: JSON.stringify(postBody),
    });
    return publishResult;
}

export const reportGuessingGame = async ({ authSession, reqUserSub, reportReq }) => {
    const routePost = `${REELAY_API_BASE_URL}/reported-content/guessingGame`;
    const reportTopicResult = await fetchResults(routePost, {
        body: JSON.stringify(reportReq),
        method: 'POST',
        headers: { 
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
    });

    console.log(reportTopicResult);
    return reportTopicResult;
}

export const submitGuessingGameGuess = async ({ 
    authSession, 
    clueIndex, 
    clueReelaySub, 
    guessedTitleKey, 
    reqUserSub, 
    topicID,
}) => {
    const routePost = `${REELAY_API_BASE_URL}/guessingGame/guess`;
    const postBody = { clueIndex, clueReelaySub, guessedTitleKey, topicID };

    const submitGuessResult = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
        body: JSON.stringify(postBody),
    });
    return submitGuessResult;
}

