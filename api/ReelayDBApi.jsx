import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';

const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;

export const getReelaysByCreator = async (creatorSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/users/${creatorSub}/reelays`;
    const resultGet = await fetchResults(routeGet, { method: 'GET' });
    if (!resultGet) {
        console.log('Could not get reelays for this creator');
        return null;
    }
    return resultGet;
}

export const getRegisteredLikes = async ({ reelay }) => {
    // todo
    const routeGet = `${REELAY_API_BASE_URL}/reelays/${reelay.id}/likes`;
    const resultGet = await fetchResults(routeGet, { method: 'GET' });
    if (!resultGet) {
        console.log('Could not get likes for this reelay');
        return null;
    }
    return resultGet;
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

export const registerLike = async ({ creatorSub, userSub, reelay }) => {
    // todo
    const routePost = `${REELAY_API_BASE_URL}/likes?creatorSub=${creatorSub}&userSub=${userSub}&reelaySub=${reelay.id}`;
    const resultPost = await fetchResults(routePost, { method: 'POST' });
    console.log('Like registered: ', resultPost);
}

export const registerUser = async (user, pushToken) => {
    const { attributes, username } = user;
    const { email, sub } = attributes;

    const routeGet = REELAY_API_BASE_URL + '/users/' + sub;
    const resultGet = await fetchResults(routeGet, { method: 'GET' });

    const encEmail = encodeURIComponent(email);
    const encUsername = encodeURI(username);

    if (resultGet.error) {
        // user is not registered
        console.log('Registering user...');
        // todo: sanity check emails and usernames
        const routePost = `${REELAY_API_BASE_URL}/users?email=${encEmail}&username=${encUsername}&sub=${sub}&pushToken=${pushToken}`
        const resultPost = await fetchResults(routePost, { method: 'POST' });
        console.log('User registry entry created: ', resultPost);
    };
}

export const unregisterLike = async ({ creatorSub, userSub, reelay }) => {
    const routePost = `${REELAY_API_BASE_URL}/likes/delete?creatorSub=${creatorSub}&userSub=${userSub}&reelaySub=${reelay.id}`;
}

export const unregisterUser = async ({ user }) => {
    // todo
}