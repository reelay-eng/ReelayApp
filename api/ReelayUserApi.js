import { getUserByEmail } from './ReelayDBApi';
import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';
import { v4 } from 'uuid';
import ReelayAPIHeaders from './ReelayAPIHeaders';
import * as SecureStore from 'expo-secure-store';

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

export const saveAndRegisterSocialAuthSession = async ({ authSession, method, reelayDBUserID }) => {
    try {
        const token = JSON.stringify({ ...authSession, method, reelayDBUserID });
        const storeAuthSessionResult = await SecureStore.setItemAsync('socialAuthSession', token);
        console.log(storeAuthSessionResult);

        const headers = {
            accesstoken: authSession.accessToken,
            idtoken: authSession.idToken,
            method,
            refreshtoken: authSession.refreshToken,
            requsersub: reelayDBUserID,
        }
        const routePost = `${REELAY_API_BASE_URL}/authSession/`;
        const resultPost = await fetchResults(routePost, {
            method: 'POST',
            headers,
        });
        console.log('Register social auth token result: ', resultPost);
        return resultPost;    
    } catch (error) {
        return { error };
    }
}

export const deregisterSocialAuthSession = async ({ authSession, reelayDBUserID }) => {
    try {
        const authSessionJSON = await SecureStore.getItemAsync('socialAuthSession');
        if (!authSessionJSON) return { error: 'No local social auth session' };
        await SecureStore.deleteItemAsync('socialAuthSession');

        const headers = {
            accesstoken: authSession.accessToken,
            idtoken: authSession.idToken,
            method: authSession.method,
            refreshtoken: authSession.refreshToken,
            requsersub: reelayDBUserID,
        }

        const routeDelete = `${REELAY_API_BASE_URL}/authSession/`;
        const resultDelete = await fetchResults(routeDelete, {
            method: 'DELETE',
            headers,
        });
        console.log('Deregister social auth token result: ', resultDelete);
        return resultDelete;
    } catch (error) {
        return { error };
    }
}

export const verifySocialAuthSession = async () => {
    try {    
        const authSessionJSON = await SecureStore.getItemAsync('socialAuthSession');
        if (!authSessionJSON) return null;

        const authSession = JSON.parse(authSessionJSON);
        const headers = {
            accesstoken: authSession.accessToken,
            idtoken: authSession.idToken,
            method: authSession.method,
            refreshtoken: authSession.refreshToken,
            requsersub: authSession.reelayDBUserID,
        }

        const routeVerify = `${REELAY_API_BASE_URL}/authSession/`
        const resultVerify = await fetchResults(routeVerify, {
            method: 'GET',
            headers,
        });
        console.log('Verify social auth session result: ', resultVerify);
        if (resultVerify?.success) {
            return authSession.reelayDBUserID;
        } else {
            await deregisterSocialAuthSession({ authSession, reelayDBUserID });
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}
