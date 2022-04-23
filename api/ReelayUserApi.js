import { 
    getFollowers, 
    getFollowing, 
    getRegisteredUser, 
    getStacksByCreator, 
    getStreamingSubscriptions, 
    getUserByEmail 
} from './ReelayDBApi';
import { getAllMyNotifications } from './NotificationsApi';
import { getWatchlistItems } from './WatchlistApi';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';
import { v4 } from 'uuid';
import ReelayAPIHeaders from './ReelayAPIHeaders';

const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;

export const clearLocalUserData = async () => {
    console.log('Clearing local user data...');
    const keys = ['myFollowing', 'myFollowers', 'myNotifications', 'myReelayStacks', 'myUser', 'myWatchlist'];
    keys.forEach(key => AsyncStorage.removeItem(key));
    return result;
}

const loadMyData = async (userSub, key, apiCallback) => {
    let userData = await AsyncStorage.getItem(key);
    // I swear, AsyncStorage literally returns the string ='null'
    // when a key lookup fails. WHY.
    if (!userData || userData === 'null') { 
        userData = await apiCallback(userSub);
        await AsyncStorage.setItem(key, JSON.stringify(userData));
    }

    if (typeof(userData) === 'string') {
        return JSON.parse(userData);
    } else {
        return userData;
    }
}

export const loadMyFollowing = async (userSub) => {
    return await loadMyData(userSub, 'myFollowing', getFollowing);
}

export const loadMyFollowers = async (userSub) => {
    return await loadMyData(userSub, 'myFollowers', getFollowers);
}

export const loadMyNotifications = async (userSub) => {
    return await loadMyData(userSub, 'myNotifications', getAllMyNotifications);
}

export const loadMyReelayStacks = async (userSub) => {
    return await loadMyData(userSub, 'myReelayStacks', getStacksByCreator);
}

export const loadMyStreamingSubscriptions = async (userSub) => {
    return await loadMyData(userSub, 'myStreamingSubscriptions', getStreamingSubscriptions);
}

export const loadMyUser = async (userSub) => {
    return await loadMyData(userSub, 'myUser', getRegisteredUser);
}

export const loadMyWatchlist = async (userSub) => {
    return await loadMyData(userSub, 'myWatchlist', getWatchlistItems);
}

export const matchSocialAuthAccount = async ({ method, value }) => {
    try {
        const params = `?method=${method}&value=${encodeURIComponent(value)}`;
        const routeGet = `${REELAY_API_BASE_URL}/socialAuth/matchAccount${params}`;
        const resultGet = await fetchResults(routeGet, {
            method: 'GET',
            headers: ReelayAPIHeaders,
        });
        return resultGet;    
    } catch (error) {
        return { error };
    }
}

const refreshMyData = async (userSub, key, apiCallback) => {
    const refreshedUserData = await apiCallback(userSub);
    await AsyncStorage.setItem(key, JSON.stringify(refreshedUserData));

    if (typeof(userData) === 'string') {        
        return JSON.parse(refreshedUserData);
    } else {
        return refreshedUserData;
    }
}

export const refreshMyFollowing = async (userSub) => {
    return await refreshMyData(userSub, 'myFollowing', getFollowing);
}

export const refreshMyFollowers = async (userSub) => {
    return await refreshMyData(userSub, 'myFollowers', getFollowers);
}

export const refreshMyNotifications = async (userSub) => {
    return await refreshMyData(userSub, 'myNotifications', getAllMyNotifications);
}

export const refreshMyReelayStacks = async (userSub) => {
    return await refreshMyData(userSub, 'myReelayStacks', getStacksByCreator);
}

export const refreshMyStreamingSubscriptions = async (userSub) => {
    return await refreshMyData(userSub, 'myStreamingSubscriptions', getStreamingSubscriptions);
}

export const refreshMyUser = async (userSub) => {
    return await refreshMyData(userSub, 'myUser', getRegisteredUser);
}

export const refreshMyWatchlist = async (userSub) => {
    return await refreshMyData(userSub, 'myWatchlist', getWatchlistItems);
}

export const registerSocialAuthAccount = async ({ method, email, fullName, googleUserID, appleUserID }) => {
    try {
        const existingUserObj = await getUserByEmail(email);
        // if the user has an existing cognito sub, use that one
        // otherwise, generate a new one
        const reelayDBUserID = existingUserObj?.sub ?? v4();
        const authAccountObj = {
            reelayDBUserID,
            email,

            // note: should change our API to say family name and given name
            firstName: fullName?.givenName ?? null,
            lastName: fullName?.familyName ?? null,
    
            googleSignInEnabled: (method === 'google'),
            appleSignInEnabled: (method === 'apple'),
    
            googleUserID: googleUserID ?? null,
            appleUserID: appleUserID ?? null,
            cognitoUserID: existingUserObj?.sub ?? null,
        };
        const routePost = `${REELAY_API_BASE_URL}/socialAuth/registerAccount`;
        const resultPost = await fetchResults(routePost, {
            method: 'POST',
            headers: ReelayAPIHeaders,
            body: JSON.stringify(authAccountObj),
        });
        console.log('Register social auth account result: ', resultPost);
        return resultPost;    
    } catch (error) {
        return { error };
    }
}

export const saveAndRegisterSocialAuthToken = async (reelayDBUserID) => {
    try {
        const token = v4();
        const authTokenJSON = JSON.stringify({ reelayDBUserID, token });
        await AsyncStorage.setItem('mySocialAuthToken', authTokenJSON);

        const routePost = `${REELAY_API_BASE_URL}/socialAuth/registerToken`;
        const resultPost = await fetchResults(routePost, {
            method: 'POST',
            headers: ReelayAPIHeaders,
            body: authTokenJSON,
        });
        console.log('Register social auth token result: ', resultPost);
        return resultPost;    
    } catch (error) {
        return { error };
    }
}

export const deregisterSocialAuthToken = async () => {
    try {
        const authTokenJSON = await AsyncStorage.getItem('mySocialAuthToken');
        if (!authTokenJSON) return { error: 'No local social auth token' };

        const routeDelete = `${REELAY_API_BASE_URL}/socialAuth/deregisterToken`;
        const resultDelete = await fetchResults(routeDelete, {
            method: 'DELETE',
            headers: ReelayAPIHeaders,
            body: authTokenJSON,
        });
        console.log('Deregister social auth token result: ', resultDelete);
        return resultDelete;
    } catch (error) {
        return { error };
    }
}

export const verifySocialAuthToken = async () => {
    try {
        const authTokenJSON = await AsyncStorage.getItem('mySocialAuthToken');
        if (!authTokenJSON) return { error: 'No local social auth token' };
    
        const routeVerify = `${REELAY_API_BASE_URL}/socialAuth/verifyToken`
        const resultVerify = await fetchResults(routeVerify, {
            method: 'POST',
            headers: ReelayAPIHeaders,
            body: authTokenJSON
        });
        console.log('Verify social auth token result: ', resultVerify);
        return resultVerify;
    } catch (error) {
        return { error };
    }
}