import { Amplitude } from '@amplitude/react-native';
import Constants from 'expo-constants';

const canUseNativeModules = Constants.appOwnership !== 'expo';
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

export const logAmplitudeEventProd = async (eventName, options) => {
    if (FEED_VISIBILITY === 'global' && canUseNativeModules) {
        const optionsNoLocation = {
            ...options,
            disableCity: true,
            disableCountry: true,
            disableDMA: true,
            disableIPAddress: true,
        }
        await Amplitude.getInstance('amp-reelay').logEvent(eventName, optionsNoLocation);
    }
}