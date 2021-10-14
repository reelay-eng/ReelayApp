import Constants from 'expo-constants';
import { fetchResults, fetchResults2 } from './fetchResults';
import { fetchAnnotatedTitle } from './TMDbApi';

const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;
const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

export const getReelaysByCreator = async (creatorSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/users/sub/${creatorSub}/reelays?visibility=${FEED_VISIBILITY}`;
    const fetchedReelays = await fetchResults2(routeGet, { method: 'GET' });
    if (!fetchedReelays) {
        console.log('Could not get reelays for this creator');
        return null;
    }
    return fetchedReelays;
}

export const getStacksByCreator = async (creatorSub) => {
    console.log('Getting stacks by creator');
    const creatorReelays = await getReelaysByCreator(creatorSub);
    if (!creatorReelays) return [];

    console.log(creatorReelays[0]);
    const  preparedReelays = await Promise.all(creatorReelays.map(prepareReelay));

    const indexInStacks = (stacks, reelay) => {
        if (stacks.length === 0) return -1;
        const forSameTitle = (stack) => (stack[0].title.id === reelay.title.id);
        return stacks.findIndex(forSameTitle);
    }

    let stacksByCreator = [];
    preparedReelays.forEach(reelay => {
        const index = indexInStacks(stacksByCreator, reelay);
        if (index >= 0) {
            console.log('adding to existing stack');
            stacksByCreator[index].push(reelay);
        } else {
            console.log('creating new stack');
            stacksByCreator.push([reelay]);
        }
    });

    console.log('stacks by creator count: ', stacksByCreator.length);
    return stacksByCreator;
}

export const getRegisteredUser = async (userSub) => {
    console.log('Fetching registered user...');
    const routeGet = REELAY_API_BASE_URL + '/users/' + userSub;
    const resultGet = await fetchResults(routeGet, { method: 'GET' });
    console.log('Registered user result: ', resultGet);

    if (!resultGet) {
        console.log('User not registered');
        return null;
    }
    return resultGet;
}

export const getUserByUsername = async (username) => {
    console.log('Fetching registered user...');
    const routeGet = REELAY_API_BASE_URL + '/users/byusername/' + username;
    const resultGet = await fetchResults(routeGet, { method: 'GET' });
    console.log('Registered user result: ', resultGet);

    if (!resultGet) {
        console.log('User not registered');
        return null;
    }
    return resultGet;
}

export const getVideoURIObject = async (fetchedReelay) => {    
    const cloudfrontVideoURI = `${CLOUDFRONT_BASE_URL}/public/${fetchedReelay.videoS3Key}`;
    return { 
        id: fetchedReelay.id, 
        videoURI: cloudfrontVideoURI,
    };
}

export const prepareReelay = async (fetchedReelay) => {
    const titleObject = await fetchAnnotatedTitle(
        fetchedReelay.tmdbTitleID, 
        fetchedReelay.isSeries
    );
    const videoURIObject = await getVideoURIObject(fetchedReelay);
    const releaseYear = (titleObject?.release_date?.length >= 4)
        ? (titleObject.release_date.slice(0,4)) : '';	

    return {
        id: fetchedReelay.id,
        creator: {
            avatar: '../../assets/images/icon.png',
            id: fetchedReelay.creatorSub,
            username: fetchedReelay.creatorName,
        },
        content: {
            venue: fetchedReelay.venue ? fetchedReelay.venue : null,
            videoURI: videoURIObject.videoURI,    
        },
        likes: fetchedReelay.likes,
        comments: fetchedReelay.comments,
        title: {
            id: titleObject.id,
            display: titleObject.title,

            director: titleObject.director,
            displayActors: titleObject.displayActors,
            overview: titleObject.overview,
            posterURI: titleObject ? titleObject.poster_path : null,
            tagline: titleObject.tagline,
            trailerURI: titleObject.trailerURI,

            releaseDate: titleObject.release_date,
            releaseYear: releaseYear,
        },
        postedDateTime: fetchedReelay.postedAt,
    };
}

export const registerLike = async ({ creatorSub, userSub, reelay }) => {
    // todo
    const routePost = `${REELAY_API_BASE_URL}/likes?creatorSub=${creatorSub}&userSub=${userSub}&reelaySub=${reelay.id}`;
    const resultPost = await fetchResults(routePost, { method: 'POST' });
    console.log('Like registered: ', resultPost);
}

export const registerUser = async (user) => {
    const { attributes, username } = user;
    const { email, sub } = attributes;
    const routeGet = REELAY_API_BASE_URL + '/users/sub/' + sub;
    const resultGet = await fetchResults(routeGet, { method: 'GET' });

    const encEmail = encodeURIComponent(email);
    const encUsername = encodeURI(username);

    if (resultGet.error) {
        // user is not registered
        console.log('Registering user (method 2)...');
        // todo: sanity check emails and usernames
        const routePost = `${REELAY_API_BASE_URL}/users?email=${encEmail}&username=${encUsername}&sub=${sub}`;
        const resultPost = await fetchResults(routePost, { method: 'POST' });
        console.log('User registry entry created: ', resultPost);
        return resultPost;
    } else {
        return resultGet;
    }
}

export const registerPushTokenForUser = async (user, pushToken) => {
    console.log(user);
    const routePatch = `${REELAY_API_BASE_URL}/users/sub/${user.sub}?pushToken=${pushToken}`;
    const resultPatch = await fetchResults(routePatch, { method: 'PATCH' });
    console.log('Patch route: ', routePatch);
    console.log('Patched user registry entry: ', resultPatch);
    return resultPatch;
}

export const unregisterLike = async ({ creatorSub, userSub, reelay }) => {
    const routePost = `${REELAY_API_BASE_URL}/likes/delete?creatorSub=${creatorSub}&userSub=${userSub}&reelaySub=${reelay.id}`;
}

export const unregisterUser = async ({ user }) => {
    // todo
}