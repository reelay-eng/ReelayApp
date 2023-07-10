import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';
import { getReelayAuthHeaders } from './ReelayAPIHeaders';
import * as Linking from 'expo-linking';

const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;

export const getProfileInviteFromCode = async ({ authSession, inviteCode, reqUserSub }) => {
    const routeGet = `${REELAY_API_BASE_URL}/profileLinks/${inviteCode}`;
    const profileInviteResult = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
    });
    return profileInviteResult;
}

export const fetchOrCreateProfileLink = async ({ authSession, username, userSub }) => {
    // using the scheme reelayapp://, the statement below creates an unusable triple slash
    // ...doesn't happen on expo
    let deeplinkURI = Linking.createURL(`/profile`);
    deeplinkURI = deeplinkURI.replace('///', '//'); 

    const routePost = `${REELAY_API_BASE_URL}/profileLinks/`;
    const postBody = {
        deeplinkURI, 
        username,
        userSub,
    };

    const dbResult = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: userSub,
        },
        body: JSON.stringify(postBody),
    });
    return dbResult;
}

// export const fetchOrCreateCustomLink = async ({ authSession, username, userSub }) => {
//     // using the scheme reelayapp://, the statement below creates an unusable triple slash
//     // ...doesn't happen on expo
//     let deeplinkURI = Linking.createURL(`/custom`);
//     deeplinkURI = deeplinkURI.replace('///', '//'); 

//     const routePost = `${REELAY_API_BASE_URL}/customLink/${userSub}/add`;
//     const postBody = {
//         deeplinkURI, 
//         username,
//         userSub,
//     };

//     const dbResult = await fetchResults(routePost, {
//         method: 'POST',
//         headers: {
//             ...getReelayAuthHeaders(authSession),
//             requsersub: userSub,
//         },
//         body: JSON.stringify(postBody),
//     });
//     return dbResult;
// }


// export const fetchOrCreateProfileLink = async ({ authSession, username, userSub }) => {
//     // using the scheme reelayapp://, the statement below creates an unusable triple slash
//     // ...doesn't happen on expo
//     let deeplinkURI = Linking.createURL(`/profile`);
//     deeplinkURI = deeplinkURI.replace('///', '//'); 

//     const routePost = `${REELAY_API_BASE_URL}/profileLinks/`;
//     const postBody = {
//         deeplinkURI, 
//         username,
//         userSub,
//     };

//     const dbResult = await fetchResults(routePost, {
//         method: 'POST',
//         headers: {
//             ...getReelayAuthHeaders(authSession),
//             requsersub: userSub,
//         },
//         body: JSON.stringify(postBody),
//     });
//     return dbResult;
// }