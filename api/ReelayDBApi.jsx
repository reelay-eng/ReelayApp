import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';

const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;

export const getRegisteredUser = async (userID) => {
    console.log('Fetching user...');
    const routeGet = REELAY_API_BASE_URL + '/users/' + userID;
    console.log(routeGet);
    const resultGet = await fetchResults(routeGet, { method: 'GET' });

    console.log('Fetched user result: ', resultGet);

    if (!resultGet) {
        console.log('User not registered');
        return null;
    }
    return resultGet;
}

export const registerUser = async (user, pushToken) => {
    console.log(user);
    console.log(pushToken);
    const { attributes, username } = user;
    const { email, sub } = attributes;
    console.log('will register the following user: ');
    console.log(attributes.email, attributes.sub, username, pushToken.length);

    console.log('fetching user list');
    const routePost = REELAY_API_BASE_URL + '/users';
    console.log(routePost);
    const resultGet = await fetchResults(routePost, { method: 'GET' });

    if (resultGet.error) {
        // user is not registered
        console.log('Registering user...');
        const routePost = `${REELAY_API_BASE_URL}/users?email=${email}&username=${username}&sub=${sub}&pushToken=${pushToken}`
        const resultPost = await fetchResults(routePost, { method: 'POST' });
        console.log('User registry entry created: ', resultPost);
    };
}