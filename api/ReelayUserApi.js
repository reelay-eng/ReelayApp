import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllMyNotifications } from './NotificationsApi';
import { getFollowers, getFollowing, getRegisteredUser, getStacksByCreator } from './ReelayDBApi';
import { getWatchlistItems } from './WatchlistApi';

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
