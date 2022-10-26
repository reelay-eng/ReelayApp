import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';
import { getReelayAuthHeaders } from './ReelayAPIHeaders';
import { prepareReelay } from './ReelayDBApi';
import { fetchAnnotatedTitle } from './TMDbApi';

const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;
const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;

const parseTitleKey = (titleKey) => {
    const hyphenIndex = titleKey.indexOf('-');
    if (hyphenIndex === -1) {
        return { tmdbTitleID: -1, isSeries: false };
    }
    const titleType = titleKey.slice(0, hyphenIndex);
    const titleIDString = titleKey.slice(hyphenIndex + 1);
    const tmdbTitleID = Number(titleIDString);
    const isSeries = (titleType === 'tv');
    return { tmdbTitleID, isSeries };

}

const prepareGame = async (guessingGame) => {
    try {
        guessingGame.details = JSON.parse(guessingGame?.detailsJSON);
        const { tmdbTitleID, isSeries } = parseTitleKey(guessingGame.details?.correctTitleKey);

        if (tmdbTitleID === -1) {
            guessingGame.details = { error: 'Could not parse details JSON'};
            guessingGame.reelays = [];
            return guessingGame;
        }

        guessingGame.correctTitleObj = await fetchAnnotatedTitle({ tmdbTitleID, isSeries });
        guessingGame.reelays = await Promise.all(guessingGame.reelays.map(prepareReelay));
    } catch (error) {
        console.log('prepare game error: ', error);
        guessingGame.details = { error: 'Could not parse details JSON'};
        guessingGame.reelays = [];
    }
    console.log('prepared game: ', guessingGame);
    return guessingGame;
}

export const getGameDetails = (game) => {
    try {
        return JSON.parse(game?.detailsJSON);
    } catch (error){
        return { error: 'Could not parse details JSON' };
    }
}

export const getMyDraftGuessingGames = async ({ authSession, reqUserSub }) => {
    const routeGet = `${REELAY_API_BASE_URL}/guessingGame/drafts`;
    const fetchedGames = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
    });

    const preparedGames = await Promise.all(fetchedGames.map(prepareGame));
    return preparedGames;
}

export const getGuessingGamesPlayedBy = async ({ authSession, reqUserSub, userSub }) => {
    const routeGet = `${REELAY_API_BASE_URL}/guessingGame/playedBy?visibility=${FEED_VISIBILITY}`;
    const fetchedGames = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
            usersub: userSub,
        },
    });

    const preparedGames = await Promise.all(fetchedGames.map(prepareGame));
    return preparedGames;
}

export const getGuessingGamesPublished = async ({ 
    authSession, 
    reqUserSub, 
    clubID = null,
    creatorSub = null, 
}) => {
    const routeGet = `${REELAY_API_BASE_URL}/guessingGame/published?visibility=${FEED_VISIBILITY}`;
    const fetchedGames = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
            creatorsub: creatorSub,
            clubid: clubID,
        },
    });

    const preparedGames = await Promise.all(fetchedGames.map(prepareGame));
    return preparedGames;
}

export const postGuessingGameClue = async ({
    authSession,
    reelaySub,
    reqUserSub,
    topicID,
}) => {
    const routePost = `${REELAY_API_BASE_URL}/guessingGame/clue`;
    const postBody = { reelaySub, topicID };

    const postGuessingGameClueResult = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
        body: JSON.stringify(postBody),
    });
    return postGuessingGameClueResult;
}

export const postGuessingGameDraft = async ({
    authSession,
    reqUserSub,
    clubID,
    correctTitleKey,
    creatorName,
    title,
}) => {
    const routePost = `${REELAY_API_BASE_URL}/guessingGame/draft`;
    const postBody = { 
        clubID, 
        correctTitleKey,
        creatorName,
        title,
    };

    const postGuessingGameDraftResult = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
        body: JSON.stringify(postBody),
    });
    return postGuessingGameDraftResult;
}

export const postGuessingGameGuess = async ({
    authSession,
    reqUserSub,
    clueIndex,
    guessedTitleKey,
    reelaySub,
    topicID,
}) => {
    const routePost = `${REELAY_API_BASE_URL}/guessingGame/draft`;
    const postBody = { 
        clueIndex, 
        guessedTitleKey,
        reelaySub,
        topicID,
        visibility: FEED_VISIBILITY,
    };

    const postGuessingGameGuessResult = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
        body: JSON.stringify(postBody),
    });
    return postGuessingGameGuessResult;
}

export const publishGuessingGame = async ({
    authSession,
    reqUserSub,
    topicID,
}) => {
    const routePost = `${REELAY_API_BASE_URL}/guessingGame/publish`;
    const postBody = { 
        topicID,
        visibility: FEED_VISIBILITY,
    };

    const publishGuessingGameResult = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
        body: JSON.stringify(postBody),
    });
    return publishGuessingGameResult;
}

export const postGuessingGameReactionReelay = async ({
    authSession,
    reqUserSub,
    reelaySub,
    topicID,
}) => {
    const routePost = `${REELAY_API_BASE_URL}/guessingGame/draft`;
    const postBody = { 
        reelaySub,
        topicID,
        visibility: FEED_VISIBILITY,
    };

    const postGuessingGameReactionResult = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
        body: JSON.stringify(postBody),
    });
    return postGuessingGameReactionResult;
}

export const patchGuessingGameDetails = async ({
    authSession,
    reqUserSub,
    detailsJSON,
    topicID,
}) => {
    const routePatch = `${REELAY_API_BASE_URL}/guessingGame/details`;
    const patchBody = { detailsJSON, topicID };

    const patchGuessingGameDetailsResult = await fetchResults(routePatch, {
        method: 'PATCH',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
        body: JSON.stringify(patchBody),
    });
    return patchGuessingGameDetailsResult;
}

export const patchGuessingGameTitle = async ({
    authSession,
    reqUserSub,
    title,
    topicID,
}) => {
    const routePatch = `${REELAY_API_BASE_URL}/guessingGame/title`;
    const patchBody = { title, topicID };

    const patchGuessingGameTitleResult = await fetchResults(routePatch, {
        method: 'PATCH',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
        body: JSON.stringify(patchBody),
    });
    return patchGuessingGameTitleResult;
}

export const patchGuessingGameVisibility = async ({
    authSession,
    reqUserSub,
    topicID,
    visibility
}) => {
    const routePatch = `${REELAY_API_BASE_URL}/guessingGame/visibility`;
    const patchBody = { visibility, topicID };

    const patchGuessingGameVisibilityResult = await fetchResults(routePatch, {
        method: 'PATCH',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
        body: JSON.stringify(patchBody),
    });
    return patchGuessingGameVisibilityResult;
}

export const deleteGuessingGameClue = async ({
    authSession,
    reqUserSub,
    reelaySub,
    topicID,
}) => {
    const routeDelete = `${REELAY_API_BASE_URL}/guessingGame/clue`;
    const deleteBody = { reelaySub, topicID };

    const deleteGuessingGameClueResult = await fetchResults(routeDelete, {
        method: 'DELETE',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
        body: JSON.stringify(deleteBody),
    });
    return deleteGuessingGameClueResult;
}

export const deleteGuessingGameDraft = async ({
    authSession,
    reqUserSub,
    topicID,
}) => {
    const routeDelete = `${REELAY_API_BASE_URL}/guessingGame/draft`;
    const deleteBody = { topicID };

    const deleteGuessingGameDraftResult = await fetchResults(routeDelete, {
        method: 'DELETE',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
        body: JSON.stringify(deleteBody),
    });
    return deleteGuessingGameDraftResult;
}

export const deleteGuessingGameGuess = async ({
    authSession,
    reqUserSub,
    guessID,
    topicID,
}) => {
    const routeDelete = `${REELAY_API_BASE_URL}/guessingGame/guess`;
    const deleteBody = { guessID, topicID };

    const deleteGuessingGameGuessResult = await fetchResults(routeDelete, {
        method: 'DELETE',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
        body: JSON.stringify(deleteBody),
    });
    return deleteGuessingGameGuessResult;
}

export const deleteGuessingGamePublished = async ({
    authSession,
    reqUserSub,
    topicID,
}) => {
    const routeDelete = `${REELAY_API_BASE_URL}/guessingGame/published`;
    const deleteBody = { guessID, topicID };

    const deleteGuessingGamePublishedResult = await fetchResults(routeDelete, {
        method: 'DELETE',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
        body: JSON.stringify(deleteBody),
    });
    return deleteGuessingGamePublishedResult;
}

