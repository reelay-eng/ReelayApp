import { logEventWithPropertiesAsync } from 'expo-analytics-amplitude';
import Constants from 'expo-constants';

const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

export const logAmplitudeEventProd = async (eventName, options) => {
    if (FEED_VISIBILITY === 'global') {
        await logEventWithPropertiesAsync(eventName, options);
    }
}