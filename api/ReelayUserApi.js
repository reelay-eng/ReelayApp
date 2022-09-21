import { getUserByEmail } from './ReelayDBApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';
import { v4 } from 'uuid';
import ReelayAPIHeaders from './ReelayAPIHeaders';

const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;

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

export const verifySocialAuthToken = async (authTokenJSON) => {
    try {    
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