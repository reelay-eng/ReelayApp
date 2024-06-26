// react imports
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, LogBox, View } from "react-native";
import Navigation from "./navigation";
import styled from "styled-components/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Reactotron from "reactotron-react-native";
// aws imports
import { Amplify, Auth, Storage } from "aws-amplify";
import { Audio } from "expo-av";
import AWSExports from "./src/aws-exports";

import { S3Client } from "@aws-sdk/client-s3";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";

// polyfill imports required for S3 connection
import { setupURLPolyfill } from "react-native-url-polyfill";
import "react-native-get-random-values";

// expo and amplitude imports
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Amplitude, Identify } from "@amplitude/react-native";

import {
  logAmplitudeEventProd,
  identifyUser,
  initMixpanel,
  firebaseCrashlyticsLog,
  firebaseCrashlyticsError,
} from "./components/utils/EventLogger";
import { StatusBar } from "expo-status-bar";
import useColorScheme from "./hooks/useColorScheme";
import { InterruptionModeIOS, InterruptionModeAndroid } from "expo-av";

// context imports
import { AuthContext } from "./context/AuthContext";

// api imports
import {
  getAllDonateLinks,
  getRegisteredUser,
  registerPushTokenForUser,
  getFollowers,
  getStacksByCreator,
  getLatestAnnouncement,
  getHomeContent,
  getFeed,
  getReelsByCreator,
  updateLoginUser,
  getFollowing,
} from "./api/ReelayDBApi";
import { getAllMyNotifications } from "./api/NotificationsApi";
import {
  getCustomItems,
  getWatchlistItems,
  getWatchlistRecs,
} from "./api/WatchlistApi";

import { registerForPushNotificationsAsync } from "./api/NotificationsApi";
import { toastConfig } from "./components/utils/ToastConfig";
import Toast from "react-native-toast-message";

// other imports
import * as Font from "expo-font";
import * as ReelayText from "./components/global/Text";
import { connect, Provider, useDispatch, useSelector } from "react-redux";
import store, { mapStateToProps } from "./redux/store";
import {
  ensureLocalImageDirExists,
  maybeFlushTitleImageCache,
} from "./api/ReelayLocalImageCache";
import { ensureLocalTitleDirExists } from "./api/ReelayLocalTitleCache";
import {
  fetchAnnotatedTitle,
  fetchPopularMovies,
  fetchPopularSeries,
  fetchTrendingMovies,
} from "./api/TMDbApi";
import moment from "moment";
import { getEmptyGlobalTopics } from "./api/FeedApi";
import { getAllClubsFollowing } from "./api/ClubsApi";
import { verifySocialAuthSession } from "./api/ReelayUserApi";
import { getGuessingGamesPublished } from "./api/GuessingGameApi";
import { getLists } from "./api/ListsApi";
import { initializeApp } from "firebase/app";

const LoadingContainer = styled(View)`
  align-items: center;
  height: 100%;
  justify-content: center;
  width: 100%;
  position: absolute;
`;
const SplashContainer = styled(View)`
  background-color: black;
  height: 100%;
  width: 100%;
  position: absolute;
`;
const SplashImage = styled(Image)`
  height: 100%;
  width: 100%;
  position: absolute;
`;

const NewImage = styled(Image)`
        align-self: center;
        height: 220px;
        width: 220px;
        margin-top: -250px;
        align-items: center;
        `

const SigningInIndicator = () => {
  const ButtonText = styled(ReelayText.Body2Emphasized)`
    color: white;
    line-height: 24px;
    font-family: Outfit-Medium;
    font-size: 20px;
  `;
  const SigningInOuterView = styled(View)`
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    justify-content: center;
    align-items: center;
  `;
  const SigningInView = styled(View)`
    background-color: #0d0d0d;
    border-radius: 20px;
    width: 80%;
    justify-content: center;
    align-items: center;
  `;
  const Spacer = styled(View)`
    height: 15%;
  `;
  return (
    <SigningInOuterView>
      <SigningInView>
        <ButtonText>Just a moment</ButtonText>
        <Spacer />
        <ActivityIndicator color="white" />
      </SigningInView>
    </SigningInOuterView>
  );
};

const canUseNativeModules = Constants.appOwnership !== "expo";
const SPLASH_IMAGE_SOURCE = require("./assets/images/reelay-splash-with-dog-black.png");
const SPLASH_IMAGE_SOURCE_NEW = require('./assets/icons/reelay-new.png');

function App() {
  global.XMLHttpRequest =
    global.originalXMLHttpRequest || global.XMLHttpRequest;
  const colorScheme = useColorScheme();
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.isLoading);
  const authSession = useSelector((state) => state.authSession);

  // Auth context hooks
  const [cognitoUser, setCognitoUser] = useState({});
  const [reelayDBUser, setReelayDBUser] = useState({});
  const [reelayDBUserID, setReelayDBUserID] = useState(null);

  const firebaseConfig = {
    apiKey: "AIzaSyAX1EdRMfCBlcBU4xvVXZY8o1TLKdirn7E",
    authDomain: "reelay-acd1b.firebaseapp.com",
    databaseURL: "https://reelay-acd1b.firebaseio.com",
    projectId: "reelay-acd1b",
    storageBucket: "reelay-acd1b.appspot.com",
    messagingSenderId: "763379224842",
    appId: "1:763379224842:ios:f67ae9f73c01d902ee2af3",
  };
  initializeApp(firebaseConfig);

  useEffect(() => {
    initReelayApp();
  }, []);

  /**
   * The following useEffect statements are set up to allow EITHER
   * a cognito identity OR a social auth identity to log in a user and
   * load their profile. Both do this by setting reelayDBUserID, which in
   * turn loads the whole profile and signs the user in.
   */

  useEffect(() => {
    // if(canUseNativeModules){
    //     const Crashlytics = require('@react-native-firebase/crashlytics')
    //     Crashlytics().crash();
    // }
    try {
      firebaseCrashlyticsLog("Firebase Log Testing");
    } catch (error) {
      firebaseCrashlyticsError(error);
    }

    if (reelayDBUserID && authSession?.accessToken)
      loadMyProfile(reelayDBUserID); //b3a93275-50f8-42be-a4d5-374d118cee8f
  }, [reelayDBUserID, authSession]);

  useEffect(() => {
    const userSub = cognitoUser?.attributes?.sub;
    if (userSub) {
      setReelayDBUserID(userSub);
      dispatch({ type: "setReelayDBUserID", payload: userSub });
    }
  }, [cognitoUser]);

  useEffect(() => {
    if (reelayDBUser?.sub) {
      dispatch({ type: "setSignedIn", payload: true });
      if (!reelayDBUser?.pushToken || reelayDBUser?.pushToken == "null") {
        registerMyPushToken();
      }
    }
  }, [reelayDBUser]);

  const autoAuthenticateUser = async () => {
    console.log("Setting up authentication");
    let tryCredentials, tryCognitoUser, tryVerifySocialAuth;
    try {
      tryCredentials = await Auth.currentUserCredentials();
      if (tryCredentials?.authenticated) {
        // use cognito to sign in the user
        tryCognitoUser = await Auth.currentAuthenticatedUser();
        const signUpFromGuest = tryCognitoUser?.username === "be_our_guest";
        if (signUpFromGuest) {
          Auth.signOut();
          dispatch({ type: "setIsLoading", payload: false });
          return;
        }

        setCognitoUser(tryCognitoUser);
        const cognitoSession = await Auth.currentSession();
        dispatch({
          type: "setAuthSessionFromCognito",
          payload: cognitoSession,
        });
      } else {
        // try using a social auth token to sign in the user
        const authSession = await verifySocialAuthSession();
        if (authSession && authSession?.reelayDBUserID) {
          console.log("Auto authentication from social login successful");
          setReelayDBUserID(authSession.reelayDBUserID);
          dispatch({
            type: "setReelayDBUserID",
            payload: authSession.reelayDBUserID,
          });
          const dispatchType =
            authSession.method === "apple"
              ? "setAuthSessionFromApple"
              : "setAuthSessionFromGoogle";
          dispatch({ type: dispatchType, payload: authSession });
          tryVerifySocialAuth = { success: true };
        }
      }
      logAmplitudeEventProd("authenticationComplete", {
        hasValidCredentials: tryCredentials?.authenticated,
        username: tryCognitoUser?.attributes?.sub,
      });

      firebaseCrashlyticsLog("Authenticate User");
    } catch (error) {
      logAmplitudeEventProd("authErrorForAuthenticateUser", {
        error: error,
        hasValidCredentials: tryCredentials?.authenticated,
        username: tryCognitoUser?.username,
      });

      firebaseCrashlyticsError(error);
    }

    if (!tryCredentials?.authenticated && !tryVerifySocialAuth?.success) {
      dispatch({ type: "setIsLoading", payload: false });
      // else, keep loading until loadMyProfile finishes
    }
  };

  const initReelayApp = async () => {
    await initServices();
    await autoAuthenticateUser();
  };

  const initServices = async () => {
    if (canUseNativeModules) {
      const ampInstance = Amplitude.getInstance("amp-reelay");
      ampInstance.init(Constants.manifest.extra.amplitudeApiKey);
      initMixpanel(Constants.manifest.extra.mixpanelProjectToken);
    }

    Amplify.configure({
      ...AWSExports,
      Analytics: {
        disabled: true,
      },
    });

    Auth.configure({ mandatorySignIn: false });
    Storage.configure({ level: "public" });
    initS3Client();

    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    });

    LogBox.ignoreLogs([
      "Could not find image file",
      "Constants.platform.ios.model",
    ]);

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    if (process.env.NODE_ENV !== "production") {
      // from https://github.com/infinitered/reactotron/blob/master/docs/quick-start-react-native.md
      Reactotron.setAsyncStorageHandler(AsyncStorage) // AsyncStorage would either come from `react-native` or `@react-native-community/async-storage` depending on where you get it from
        .configure() // controls connection & communication settings
        .useReactNative() // add all built-in react native plugins
        .connect(); // let's connect!
    }

    moment.updateLocale("en", {
      relativeTime: {
        future: "in %s",
        past: "%s",
        s: "just now",
        ss: "%ss",
        m: "1m",
        mm: "%dm",
        h: "1h",
        hh: "%dh",
        d: "1d",
        dd: "%dd",
        M: "1mo",
        MM: "%dmo",
        y: "1y",
        yy: "%dY",
      },
    });

    // await loadFonts();
    // await checkIsNewUser();
    // await ensureLocalImageDirExists();
    // await ensureLocalTitleDirExists();
    // await maybeFlushTitleImageCache();
    // await loadFirstWithoutLogin();
    // await checkFirsttimeVisit();
    // Parallelizing promise-based tasks to speed up execution
    await Promise.all([
      loadFonts(),
      checkIsNewUser(),
      ensureLocalImageDirExists(),
      ensureLocalTitleDirExists(),
      maybeFlushTitleImageCache(),
      loadFirstWithoutLogin(),
      checkFirsttimeVisit(),
    ]);
  };

  const checkFirsttimeVisit = async () => {
    try {
      const firstTime = await AsyncStorage.getItem("checkFirstTimeLogin");
      if (!firstTime) {
        dispatch({ type: "setFirstTimeLogin", payload: false });
      } else {
        dispatch({ type: "setFirstTimeLogin", payload: true });
      }

      dispatch({ type: "setOpenAddTitle", payload: false });
    } catch (error) {
      console.log("firstTime", error);
      return true;
    }
  };

  const loadFirstWithoutLogin = async () => {
    const [suggestedMovies, suggestedSeries, trendingMovieResults] =
      await Promise.all([
        fetchPopularMovies(),
        fetchPopularSeries(),
        fetchTrendingMovies(),
      ]);

    dispatch({
      type: "setTrendingMovieResults",
      payload: trendingMovieResults,
    });

    const suggestedMovieResults = { titles: suggestedMovies, nextPage: 1 };
    const suggestedSeriesResults = { titles: suggestedSeries, nextPage: 1 };

    dispatch({
      type: "setSuggestedMovieResults",
      payload: suggestedMovieResults,
    });
    dispatch({
      type: "setSuggestedSeriesResults",
      payload: suggestedSeriesResults,
    });
  };

  const checkIsNewUser = async () => {
    try {
      const value = await AsyncStorage.getItem("isReturningUser");
      if (value !== null) {
        dispatch({ type: "setIsReturningUser", payload: true });
      } else {
        dispatch({ type: "setIsReturningUser", payload: false });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDismissalHistory = async () => {
    const [announcementHistoryJSON, noticeHistoryJSON] = await Promise.all([
      AsyncStorage.getItem("announcement-history-json") ?? "{}",
      AsyncStorage.getItem("notice-history-json") ?? "{}",
    ]);
    const announcementHistory = JSON.parse(announcementHistoryJSON);
    const noticeHistory = JSON.parse(noticeHistoryJSON);
    return { announcementHistory, noticeHistory };
  };

  const initS3Client = () => {
    try {
      setupURLPolyfill();
      const newS3Client = new S3Client({
        region: AWSExports.aws_project_region,
        credentials: fromCognitoIdentityPool({
          client: new CognitoIdentityClient({
            region: AWSExports.aws_cognito_region,
          }),
          identityPoolId: AWSExports.aws_cognito_identity_pool_id,
        }),
      });
      dispatch({ type: "setS3Client", payload: newS3Client });
      firebaseCrashlyticsLog("S3Client_mounted");
    } catch (error) {
      console.log("Could not initialize S3 client");
      console.log(error);
      logAmplitudeEventProd("s3InitializeError", {
        error: error.message,
      });
      firebaseCrashlyticsError(error);
    }
  };

  const loadFonts = async () => {
    await Font.loadAsync({
      "Outfit-Thin": require("./assets/fonts/Outfit-Thin.ttf"),
      "Outfit-ExtraLight": require("./assets/fonts/Outfit-ExtraLight.ttf"),
      "Outfit-Light": require("./assets/fonts/Outfit-Light.ttf"),
      "Outfit-Regular": require("./assets/fonts/Outfit-Regular.ttf"),
      "Outfit-Medium": require("./assets/fonts/Outfit-Medium.ttf"),
      "Outfit-SemiBold": require("./assets/fonts/Outfit-SemiBold.ttf"),
      "Outfit-Bold": require("./assets/fonts/Outfit-Bold.ttf"),
      "Outfit-ExtraBold": require("./assets/fonts/Outfit-ExtraBold.ttf"),
      "Outfit-Black": require("./assets/fonts/Outfit-Black.ttf"),
    });
  };

  const loadMyProfile = async (userSub) => {
    console.log("beginning load my profile");

    // proceed with loading profile

    const reqUserSub = userSub;
    // make sure to maintain consistent ordering between these arrays
    // when you modify them

    //test
    // initial load
    const [
      latestAnnouncement,
      myDismissalHistory,
      myHomeContent,
      reelayDBUserLoaded,
      updateLogin,
      following,
    ] = await Promise.all([
      getLatestAnnouncement({ authSession, reqUserSub, page: 0 }),
      getDismissalHistory(),
      getHomeContent({ authSession, reqUserSub }),
      getRegisteredUser(userSub),
      updateLoginUser(userSub),
      getFollowing(userSub),
    ]);

    const { myFollowing, myStreamingSubscriptions } =
      myHomeContent?.profile ?? [];
    const homeGuessingGames = myHomeContent?.discover?.guessingGames ?? [];
    const mySettingsJSON = reelayDBUserLoaded?.settingsJSON;
    const mySettings = JSON.parse(mySettingsJSON) ?? {}; //
    const versionInfo = myHomeContent?.versionInfo;

    console.log("loaded first set of profile data");

    // set mixpanel info here
    identifyUser({
      userSub: reelayDBUserLoaded?.sub,
      username: reelayDBUserLoaded?.username,
    });

    setReelayDBUser(reelayDBUserLoaded);
    dispatch({ type: "setReelayDBUser", payload: reelayDBUserLoaded });
    dispatch({ type: "setMyHomeContent", payload: myHomeContent });
    dispatch({ type: "setMyFollowing", payload: myFollowing });
    dispatch({
      type: "setHomeGuessingGames",
      payload: {
        content: homeGuessingGames,
        nextPage: 1,
      },
    });
    dispatch({ type: "setFollowingData", payload: following });
    dispatch({ type: "setAppVersionInfo", payload: versionInfo });
    dispatch({ type: "setLatestAnnouncement", payload: latestAnnouncement });
    dispatch({ type: "setMyDismissalHistory", payload: myDismissalHistory });
    dispatch({ type: "setLatestNotice", payload: null });
    // triggers the reducer to create the latest notice from already-loaded app data

    dispatch({ type: "setMySettings", payload: mySettings });
    dispatch({
      type: "setMyStreamingSubscriptions",
      payload: myStreamingSubscriptions,
    });
    dispatch({ type: "setIsLoading", payload: false });
    dispatch({ type: "setCurrentAppLoadStage", payload: 1 });

    console.log("dispatched first set of profile data");

    const [
      homeFollowingFeed,
      homeInTheatersFeed,
      homeOnStreamingFeed,
      homeTopOfTheWeekFeed,
    ] = await Promise.all([
      getFeed({ authSession, reqUserSub, feedSource: "following", page: 0 }),
      getFeed({ authSession, reqUserSub, feedSource: "theaters", page: 0 }),
      getFeed({ authSession, reqUserSub, feedSource: "streaming", page: 0 }),
      getFeed({ authSession, reqUserSub, feedSource: "trending", page: 0 }),
    ]);

    dispatch({
      type: "setHomeFollowingFeed",
      payload: {
        content: homeFollowingFeed,
        nextPage: 1,
      },
    });
    dispatch({
      type: "setHomeInTheatersFeed",
      payload: {
        content: homeInTheatersFeed,
        nextPage: 1,
      },
    });
    dispatch({
      type: "setHomeOnStreamingFeed",
      payload: {
        content: homeOnStreamingFeed,
        nextPage: 1,
      },
    });
    dispatch({
      type: "setHomeTopOfTheWeekFeed",
      payload: {
        content: homeTopOfTheWeekFeed,
        nextPage: 1,
      },
    });
    dispatch({ type: "setCurrentAppLoadStage", payload: 2 });

    // deferred load
    const [
      emptyGlobalTopics,
      myCreatorStacksLoaded,
      myReelayStacksLoaded,
      myFollowersLoaded,
      myNotificationsLoaded,
      myWatchlistItemsLoaded,
      myWatchlistRecsLoaded,
      suggestedMovies,
      suggestedSeries,
      setCustomWatchData,
      trendingMovieResults,
      listData,
    ] = await Promise.all([
      getEmptyGlobalTopics({ authSession, page: 0, reqUserSub: userSub }),
      getStacksByCreator(userSub),
      getReelsByCreator(userSub),
      getFollowers(userSub),
      getAllMyNotifications(userSub),
      getWatchlistItems(userSub),
      getWatchlistRecs({ authSession, reqUserSub, category: "all" }),
      fetchPopularMovies(),
      fetchPopularSeries(),
      getCustomItems(userSub),
      fetchTrendingMovies(),
      getLists({ reqUserSub: userSub }),
    ]);

    console.log("loaded second set of profile data");

    dispatch({ type: "setEmptyGlobalTopics", payload: emptyGlobalTopics });
    dispatch({ type: "setMyReelayStacks", payload: myReelayStacksLoaded });
    dispatch({ type: "setMyCreatorStacks", payload: myCreatorStacksLoaded });
    dispatch({ type: "setMyFollowers", payload: myFollowersLoaded });
    dispatch({ type: "setMyNotifications", payload: myNotificationsLoaded });
    dispatch({ type: "setMyWatchlistItems", payload: myWatchlistItemsLoaded });
    dispatch({ type: "setMyWatchlistRecs", payload: myWatchlistRecsLoaded });
    dispatch({
      type: "setTrendingMovieResults",
      payload: trendingMovieResults,
    });

    const suggestedMovieResults = { titles: suggestedMovies, nextPage: 1 };
    const suggestedSeriesResults = { titles: suggestedSeries, nextPage: 1 };

    dispatch({
      type: "setSuggestedMovieResults",
      payload: suggestedMovieResults,
    });
    dispatch({
      type: "setSuggestedSeriesResults",
      payload: suggestedSeriesResults,
    });
    dispatch({ type: "setCurrentAppLoadStage", payload: 3 });
    dispatch({ type: "setCustomWatchData", payload: setCustomWatchData });
    dispatch({ type: "setListData", payload: listData });

    const [donateLinksLoaded, myClubs] = await Promise.all([
      getAllDonateLinks(),
      getAllClubsFollowing({ authSession, reqUserSub: userSub }),
    ]);

    dispatch({ type: "setMyClubs", payload: myClubs ?? [] });
    dispatch({ type: "setDonateLinks", payload: donateLinksLoaded });
    dispatch({ type: "setCurrentAppLoadStage", payload: 4 });
    console.log(
      "----------- Load My Profile Ends ---------------"
      // dispatched second set of profile data"
    );
  };

  const registerMyPushToken = async () => {
    try {
      if (reelayDBUser?.username === "be_our_guest") return;
      const devicePushToken = await registerForPushNotificationsAsync();
      console.log("device push token: ", devicePushToken);
      if (!devicePushToken) return;

      if (
        !reelayDBUser.pushToken ||
        reelayDBUser.pushToken !== devicePushToken
      ) {
        console.log("Registering new push token");
        await registerPushTokenForUser(reelayDBUser.sub, devicePushToken);
        logAmplitudeEventProd("pushTokenRegistered", {
          registeredUser: reelayDBUser,
          devicePushToken: devicePushToken,
        });
      }
      firebaseCrashlyticsLog("Push notification registered");
    } catch (error) {
      console.log(error);
      firebaseCrashlyticsError(error);
    }
  };

  const authState = {
    cognitoUser,
    setCognitoUser,
    reelayDBUser,
    setReelayDBUser,
    reelayDBUserID,
    setReelayDBUserID,
  };

  return (
    <SplashContainer>
      {isLoading ? (
        <>
          {console.log("-------------in is loading is true-------------")}
          <SplashImage source={SPLASH_IMAGE_SOURCE} />
          <LoadingContainer>
            <ActivityIndicator />
          </LoadingContainer>
        </>
      ) : (
        <>
          {console.log("-------------in is loading is false-------------")}
          <LoadingContainer>
            <SigningInIndicator />
          </LoadingContainer>
          <AuthContext.Provider value={authState}>
            <StatusBar style="light" />
            <Navigation colorScheme={colorScheme} />
            <Toast config={toastConfig} />
          </AuthContext.Provider>
        </>
      )}
    </SplashContainer>
  );
}

const ReduxApp = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

connect(mapStateToProps)(ReduxApp);
export default ReduxApp;
