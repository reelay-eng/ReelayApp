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

export const addMultipleProfilePics = async (userSubs) => {
    try {
        // await ensureDirExists();
        console.log('Downloading', userSubs.length, 'profile pics...');
        await Promise.all(userSubs.map((userSub) => {
            const remoteURI = profilePicRemoteURI(userSub);
            const localURI = profilePicLocalURI(userSub);
            FileSystem.downloadAsync(remoteURI, localURI);
        }));
    } catch (error) {
        console.error("Couldn't download profile pics: ", error);
    }
}

export const addMultipleTitlePosters = async (titleObjs) => {
    try {
        // await ensureDirExists();
        console.log('Downloading', titleObjs.length, 'title posters...');
        await Promise.all(titleObjs.map((titleObj) => {
            const { tmdbTitleID, titleType } = titleObj;
            const remoteURI = titlePosterRemoteURI(tmdbTitleID, titleType);
            const localURI = titlePosterLocalURI(tmdbTitleID, titleType);
            FileSystem.downloadAsync(remoteURI, localURI);
        }));
    } catch (error) {
        console.error("Couldn't download title posters: ", error);
    }
}

// Returns URI to our local gif file
// If our gif doesn't exist locally, it downloads it
export const getSingleProfilePic = async (userSub) => {
    // await ensureDirExists();
    const localURI = profilePicLocalURI(userSub);
    const localFileInfo = await FileSystem.getInfoAsync(localURI);
    console.log('middle loading profile pic: ', userSub);

    if (!localFileInfo.exists) {
        console.log("Profile pic isn't cached locally. Downloading...");
        console.log(localURI);
        console.log(remoteURI);
        const remoteURI = profilePicRemoteURI(userSub);
        await FileSystem.downloadAsync(remoteURI, localURI);
    }

    return localURI;
}

export const getSingleTitlePoster = async (tmdbTitleID, titleType) => {
    // await ensureDirExists();
    const localURI = titlePosterLocalURI(tmdbTitleID, titleType);
    const localFileInfo = await FileSystem.getInfoAsync(localURI);

    if (!localFileInfo.exists) {
        console.log("Profile pic isn't cached locally. Downloading...");
        const remoteURI = titlePosterRemoteURI(tmdbTitleID, titleType);
        await FileSystem.downloadAsync(remoteURI, localURI);
    }

    return localURI;
}

// Deletes whole giphy directory with all its content
export async function deleteAllCachedImages() {
    console.log('Deleting all cached images...');
    await FileSystem.deleteAsync(imgDir);
}
