import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from 'moment';

const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;
const DEFAULT_PIC_URI = `${CLOUDFRONT_BASE_URL}/public/reelay-default-pic.png`;
const TMDB_IMAGE_API_BASE_URL = Constants.manifest.extra.tmdbImageApiBaseUrl.substr(0,27);

const imgDir = FileSystem.cacheDirectory + 'img';
const clubPicRemoteURI = (clubID) => `${CLOUDFRONT_BASE_URL}/public/clubpic-${clubID}.jpg`;
const clubPicLocalURI = (clubID) => imgDir + `/clubpic-${clubID}.jpg`;

const profilePicRemoteURI = (userSub) => `${CLOUDFRONT_BASE_URL}/public/profilepic-${userSub}-current.jpg`;
const profilePicLocalURI = (userSub) => imgDir + `/profilepic-${userSub}.jpg`;

const titlePosterRemoteURI = (posterPath, size = 185) => `${TMDB_IMAGE_API_BASE_URL}${size}${posterPath}`;
const titlePosterLocalURI = (posterPath) => imgDir + posterPath;

export const cacheClubPic = async (clubID, useDefaultPic = false) => {
    const localURI = clubPicLocalURI(clubID);
    const remoteURI = clubPicRemoteURI(clubID);

    if (useDefaultPic) {
        await FileSystem.downloadAsync(DEFAULT_PIC_URI, localURI);
    } else {
        await FileSystem.downloadAsync(remoteURI, localURI);
    }
    await AsyncStorage.setItem(localURI, moment().toISOString());
    console.log('finished caching club pic for ', clubID);
}

export const cacheProfilePic = async (userSub, useDefaultPic = false) => {
    const localURI = profilePicLocalURI(userSub);
    const remoteURI = profilePicRemoteURI(userSub);

    if (useDefaultPic) {
        await FileSystem.downloadAsync(DEFAULT_PIC_URI, localURI);
    } else {
        await FileSystem.downloadAsync(remoteURI, localURI);
    }
    await AsyncStorage.setItem(localURI, moment().toISOString());
    console.log('finished caching profile pic for ', userSub);
}

const cacheTitlePoster = async (posterPath) => {
    const localURI = titlePosterLocalURI(posterPath);
    const remoteURI = titlePosterRemoteURI(posterPath);
    await FileSystem.downloadAsync(remoteURI, localURI);
}

// Deletes whole giphy directory with all its content
export const clearAllCachedImages = async () => {
    const dirInfo = await FileSystem.getInfoAsync(imgDir);
    if (dirInfo.exists) {
        console.log('Deleting all cached images...');
        await FileSystem.deleteAsync(imgDir);
    }
}

// Checks if img directory exists. If not, creates it
export const ensureLocalImageDirExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(imgDir);
    if (!dirInfo.exists) {
        console.log("Image directory doesn't exist, creating...");
        await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });
    }
}

export const getClubPicURI = (clubID, local = true) => {
    if (local) {
        return clubPicLocalURI(clubID);
    } else {
        return clubPicRemoteURI(clubID);    
    }
}

export const getProfilePicURI = (userSub, local = true) => {
    if (local) {
        return profilePicLocalURI(userSub);
    } else {
        return profilePicRemoteURI(userSub);    
    }
}

export const getTitlePosterURI = (posterPath, local = true) => {
    if (local) {
        return titlePosterLocalURI(posterPath);
    } else {
        cacheTitlePoster(posterPath);
        return titlePosterRemoteURI(posterPath);    
    }
}

export const checkRefreshClubPic = async (clubID) => {
    try {
        const localURI = clubPicLocalURI(clubID);
        const lastUpdatedCacheAt = await AsyncStorage.getItem(localURI);
        if (!lastUpdatedCacheAt) {
            console.log('club pic for ', clubID, ': no record in cache');
            cacheClubPic(clubID);
            return;
        };

        const lastUpdatedDays = moment().diff(moment(lastUpdatedCacheAt), 'days');
        if (lastUpdatedDays > 1) cacheClubPic(clubID);
    } catch (error) {
        console.log(error);
    }
}

export const checkRefreshProfilePic = async (userSub) => {
    try {
        const localURI = profilePicLocalURI(userSub);
        const lastUpdatedCacheAt = await AsyncStorage.getItem(localURI);
        if (!lastUpdatedCacheAt) {
            console.log('profile pic for ', userSub, ': no record in cache');
            cacheProfilePic(userSub);
            return;
        };

        const lastUpdatedDays = moment().diff(moment(lastUpdatedCacheAt), 'days');
        if (lastUpdatedDays > 1) cacheProfilePic(userSub);
    } catch (error) {
        console.log(error);
    }
}
