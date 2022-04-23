import Constants from 'expo-constants';

const REELAY_API_KEY = Constants.manifest.extra.reelayApiKey;
const REELAY_APP_VERSION = Constants.manifest.version;

export default ReelayAPIHeaders = {
    Accept: 'application/json',
    'Accept-encoding': 'gzip, deflate',
    'Content-Type': 'application/json',
    'reelayapikey': REELAY_API_KEY,
    'reelayappversion': REELAY_APP_VERSION,
};
