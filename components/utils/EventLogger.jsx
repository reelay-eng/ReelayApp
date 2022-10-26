import { Amplitude } from '@amplitude/react-native';
import Constants from 'expo-constants';
// import { Mixpanel } from 'mixpanel-react-native';

const canUseNativeModules = Constants.appOwnership !== 'expo';
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

// let mixpanel;

export const initMixpanel = (token) => {
    // mixpanel = new Mixpanel(token, trackAutomaticEvents=true);
    // mixpanel.init().then(() => {
    //     console.log("[Mixpanel] Initialized");
    //     // mixpanel.setUseIpAddressForGeolocation(false);
    // }).catch((e) => {
    //     console.log("[Mixpanel] Initialization Failed: ", e);
    // });

}

export const identifyUser = ({ userSub, username }) => {
    // mixpanel.identify(userSub);
    // // properties that will never change
    // mixpanel.getPeople().setOnce({"userSub": userSub});
    // // properties that can change between/during sessions
    // mixpanel.getPeople().set({"$name": username});
    // console.log(`[Mixpanel] User ${username} identified by sub: [${userSub}]`);
}

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
        // await mixpanel.track(eventName, options);
    }
}