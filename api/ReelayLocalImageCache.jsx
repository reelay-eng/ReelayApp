import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;

const imgDir = FileSystem.cacheDirectory + 'img/';
const profilePicRemoteURI = (userSub) => `${CLOUDFRONT_BASE_URL}/public/profilepic-${userSub}-current.jpg`;
const profilePicLocalURI = (userSub) => imgDir + `profilepic-${userSub}.jpg`;
const titlePosterRemoteURI = (tmdbTitleID, titleType) => '';
const titlePosterLocalURI = (tmdbTitleID, titleType) => imgDir + `${titleType}-${tmdbTitleID}-poster.jpg`;

// Checks if img directory exists. If not, creates it
export const ensureLocalImageDirExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(imgDir);
    if (!dirInfo.exists) {
        console.log("Image directory doesn't exist, creating...");
        await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });
    }
}

const cacheProfilePic = async (userSub) => {
    const localURI = profilePicLocalURI(userSub);
    const remoteURI = profilePicRemoteURI(userSub);
    await FileSystem.downloadAsync(remoteURI, localURI);
}

export const getProfilePicURI = (userSub, local = true) => {
    if (local) {
        return profilePicLocalURI(userSub);
    } else {
        cacheProfilePic(userSub);
        return profilePicRemoteURI(userSub);    
    }
}

// Deletes whole giphy directory with all its content
export async function deleteAllCachedImages() {
    console.log('Deleting all cached images...');
    await FileSystem.deleteAsync(imgDir);
}
