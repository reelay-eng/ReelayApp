import { logEventWithPropertiesAsync } from 'expo-analytics-amplitude';
import Constants from 'expo-constants';

const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

export const logAmplitudeEventProd = async (eventName, options) => {
    if (FEED_VISIBILITY === 'global' || FEED_VISIBILITY === 'dev') {
        const optionsNoLocation = {
            ...options,
            disableCity: true,
            disableCountry: true,
            disableDMA: true,
            disableIPAddress: true,
        }
        await logEventWithPropertiesAsync(eventName, optionsNoLocation);
    }
}