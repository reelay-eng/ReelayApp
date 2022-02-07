import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFollowers, getFollowing, getRegisteredUser, getStacksByCreator } from './ReelayDBApi';
import { getWatchlistItems } from './WatchlistApi';

const loadUserData = async (userSub, key, apiCallback) => {
    let userData = await AsyncStorage.getItem(key);
    if (!userData) {
        userData = await apiCallback(userSub);
        console.log('KEY: ', key);
        console.log(userData);
        await AsyncStorage.setItem(key, JSON.stringify(userData));
    }
    try {
        return JSON.parse(userData);
    } catch (error) {
        return userData;
    }
}

const refreshUserData = async (userSub, key, apiCallback) => {
    const refreshedUserData = await apiCallback(userSub);
    await AsyncStorage.setItem(key, JSON.stringify(refreshedUserData));

    try {
        return JSON.parse(refreshedUserData);
    } catch (error) {
        return refreshedUserData;
    }
}

export const clearLocalUserData = async () => {
    const keys = ['myFollowing', 'myFollowers', 'myReelayStacks', 'myUser', 'myWatchlist'];
    const result = await Promise.all(keys.map(async (key) => {
        return await AsyncStorage.removeItem(key);
    }));
    return result;
}

export const loadMyFollowing = async (userSub) => {
    return await loadUserData(userSub, 'myFollowing', getFollowing);
}

export const loadMyFollowers = async (userSub) => {
    return await loadUserData(userSub, 'myFollowers', getFollowers);
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

export const refreshMyReelayStacks = async (userSub) => {
    return await refreshUserData(userSub, 'myReelayStacks', getStacksByCreator);
}

export const refreshMyUser = async (userSub) => {
    return await refreshUserData(userSub, 'myUser', getRegisteredUser);
}

export const refreshMyWatchlist = async (userSub) => {
    return await refreshUserData(userSub, 'myWatchlist', getWatchlistItems);
}
