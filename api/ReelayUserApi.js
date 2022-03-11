import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllMyNotifications } from './NotificationsApi';
import { getFollowers, getFollowing, getRegisteredUser, getStacksByCreator, getUserByEmail } from './ReelayDBApi';
import { getWatchlistItems } from './WatchlistApi';

import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';
import { v4 } from 'uuid';

const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;
const REELAY_API_KEY = Constants.manifest.extra.reelayApiKey;

const REELAY_API_HEADERS = {
    Accept: 'application/json',
    'Accept-encoding': 'gzip, deflate',
    'Content-Type': 'application/json',
    'reelayapikey': REELAY_API_KEY,
};

const loadUserData = async (userSub, key, apiCallback) => {
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

const refreshUserData = async (userSub, key, apiCallback) => {
    const refreshedUserData = await apiCallback(userSub);
    await AsyncStorage.setItem(key, JSON.stringify(refreshedUserData));

    if (typeof(userData) === 'string') {        
        return JSON.parse(refreshedUserData);
    } else {
        return refreshedUserData;
    }
}

export const clearLocalUserData = async () => {
    const keys = ['myFollowing', 'myFollowers', 'myNotifications', 'myReelayStacks', 'myUser', 'myWatchlist'];
    const result = await Promise.all(keys.map(async (key) => {
        return await AsyncStorage.removeItem(key);
    }));
    
    console.log('Clearing local user data...');
    const clearResult = await Promise.all(keys.map(async (key) => {
        const asyncValue = await AsyncStorage.getItem(key);
        console.log(`Async value for ${key}: ${asyncValue}`);
    }));
    console.log('Finished clearing local data.');
    return result;
}

export const loadMyFollowing = async (userSub) => {
    return await loadUserData(userSub, 'myFollowing', getFollowing);
}

export const loadMyFollowers = async (userSub) => {
    return await loadUserData(userSub, 'myFollowers', getFollowers);
}

export const loadMyNotifications = async (userSub) => {
    return await loadUserData(userSub, 'myNotifications', getAllMyNotifications);
}

export const loadMyReelayStacks = async (userSub) => {
    return await loadUserData(userSub, 'myReelayStacks', getStacksByCreator);
}

export const loadMyUser = async (userSub) => {
    return await loadUserData(userSub, 'myUser', getRegisteredUser);
}

export const loadMyWatchlist = async (userSub) => {
    return await loadUserData(userSub, 'myWatchlist', getWatchlistItems);
}

export const refreshMyFollowing = async (userSub) => {
    return await refreshUserData(userSub, 'myFollowing', getFollowing);
}

export const refreshMyFollowers = async (userSub) => {
    return await refreshUserData(userSub, 'myFollowers', getFollowers);
}

export const refreshMyNotifications = async (userSub) => {
    return await refreshUserData(userSub, 'myNotifications', getAllMyNotifications);
}

export const refreshMyReelayStacks = async (userSub) => {
    return await refreshUserData(userSub, 'myReelayStacks', getStacksByCreator);
}

export const refreshMyUser = async (userSub) => {
    return await refreshUserData(userSub, 'myUser', getRegisteredUser);
}

export const refreshMyWatchlist = async (userSub) => {
    return await refreshUserData(userSub, 'myWatchlist', getWatchlistItems);
}

export const matchSocialAuthAccount = async ({ method, value }) => {
    try {
        const params = `?method=${method}&value=${encodeURIComponent(value)}`;
        const routeGet = `${REELAY_API_BASE_URL}/socialAuth/matchAccount${params}`;
        const resultGet = await fetchResults(routeGet, {
            method: 'GET',
            headers: REELAY_API_HEADERS,
        });
        return resultGet;    
    } catch (error) {
        return { error };
    }
}

export const registerSocialAuthAccount = async ({ method, email, googleUserID, appleUserID }) => {
    try {
        const existingUserObj = await getUserByEmail(email);
        // if the user has an existing cognito sub, use that one
        // otherwise, generate a new one
        const reelayDBUserID = existingUserObj?.sub ?? v4();
        const authAccountObj = {
            reelayDBUserID,
            email,
    
            googleSignInEnabled: (method === 'google'),
            appleSignInEnabled: (method === 'apple'),
    
            googleUserID: googleUserID ?? null,
            appleUserID: appleUserID ?? null,
            cognitoUserID: existingUserObj?.sub ?? null,
        };
        const routePost = `${REELAY_API_BASE_URL}/socialAuth/registerAccount`;
        const resultPost = await fetchResults(routePost, {
            method: 'POST',
            headers: REELAY_API_HEADERS,
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
            headers: REELAY_API_HEADERS,
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
            headers: REELAY_API_HEADERS,
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
            headers: REELAY_API_HEADERS,
            body: authTokenJSON
        });
        console.log('Verify social auth token result: ', resultVerify);
        return resultVerify;
    } catch (error) {
        return { error };
    }
}