import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;
const TMDB_IMAGE_API_BASE_URL = Constants.manifest.extra.tmdbImageApiBaseUrl.substr(0,27);

const imgDir = FileSystem.cacheDirectory + 'img';
const clubPicRemoteURI = (clubID) => `${CLOUDFRONT_BASE_URL}/public/clubPic-${clubID}.jpg`;
const clubPicLocalURI = (clubID) => imgDir + `/clubpic-${clubID}.jpg`;
const profilePicRemoteURI = (userSub) => `${CLOUDFRONT_BASE_URL}/public/profilepic-${userSub}-current.jpg`;
const profilePicLocalURI = (userSub) => imgDir + `/profilepic-${userSub}.jpg`;
const titlePosterRemoteURI = (posterPath, size = 185) => `${TMDB_IMAGE_API_BASE_URL}${size}${posterPath}`;
const titlePosterLocalURI = (posterPath) => imgDir + posterPath;

const cacheClubPic = async (clubID) => {
    const localURI = clubPicLocalURI(clubID);
    const remoteURI = clubPicRemoteURI(clubID);
    await FileSystem.downloadAsync(remoteURI, localURI);
}

const cacheProfilePic = async (userSub) => {
    const localURI = profilePicLocalURI(userSub);
    const remoteURI = profilePicRemoteURI(userSub);
    await FileSystem.downloadAsync(remoteURI, localURI);
}

const cacheTitlePoster = async (posterPath) => {
    const localURI = titlePosterLocalURI(posterPath);
    const remoteURI = titlePosterRemoteURI(posterPath);
    await FileSystem.downloadAsync(remoteURI, localURI);
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
        cacheClubPic(clubID);
        return clubPicRemoteURI(clubID);    
    }
}

export const getProfilePicURI = (userSub, local = true) => {
    if (local) {
        return profilePicLocalURI(userSub);
    } else {
        cacheProfilePic(userSub);
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

// Deletes whole giphy directory with all its content
export const clearAllCachedImages = async () => {
    const dirInfo = await FileSystem.getInfoAsync(imgDir);
    if (dirInfo.exists) {
        console.log('Deleting all cached images...');
        await FileSystem.deleteAsync(imgDir);
    }
}
