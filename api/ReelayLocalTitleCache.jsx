import * as FileSystem from 'expo-file-system';

const titleDir = FileSystem.cacheDirectory + 'tmdb';
const tmdbTitleLocalURI = (titleObj) => titleDir + `/${titleObj.titleType}-${titleObj.id}`;

export const cacheAnnotatedTitle = async (titleObj) => {
    const localURI = tmdbTitleLocalURI(titleObj);
    const titleJSON = JSON.stringify(titleObj);
    await FileSystem.writeAsStringAsync(localURI, titleJSON);
}

// Checks if img directory exists. If not, creates it
export const ensureLocalTitleDirExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(titleDir);
    if (!dirInfo.exists) {
        console.log("Title directory doesn't exist, creating...");
        await FileSystem.makeDirectoryAsync(titleDir, { intermediates: true });
    }
}

export const fetchAnnotatedTitleFromCache = async (tmdbTitleID, titleType) => {
    const localURI = tmdbTitleLocalURI({ id: tmdbTitleID, titleType });
    const fileInfo = await FileSystem.getInfoAsync(localURI);
    if (fileInfo.exists) {
        const titleJSON = await FileSystem.readAsStringAsync(localURI);
        return JSON.parse(titleJSON);
    } else {
        return null;
    }
}

// Deletes whole giphy directory with all its content
export const clearAllCachedTitles = async () => {
    const dirInfo = await FileSystem.getInfoAsync(titleDir);
    if (dirInfo.exists) {
        console.log('Deleting all cached titles...');
        await FileSystem.deleteAsync(titleDir);
    }
}
