import Constants from 'expo-constants';

const REELAY_API_KEY = Constants.manifest.extra.reelayApiKey;
const REELAY_APP_VERSION = Constants.manifest.version;

export const getReelayBaseHeaders = () => {
    return {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
        'reelayapikey': REELAY_API_KEY,
        'reelayappversion': REELAY_APP_VERSION,
    }
}

export const getReelayAuthHeaders = (authSession) => {
    const baseHeaders = getReelayBaseHeaders();
    return {
        ...baseHeaders,
        idtoken: authSession?.idToken,
        accesstoken: authSession?.accessToken,
        refreshtoken: authSession?.refreshToken,
    };
}

export default ReelayAPIHeaders = getReelayBaseHeaders();