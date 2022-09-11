import { createStore } from "redux";
import { 
    cognitoSessionReducer, 
    dismissAnnouncementReducer,
    dismissNoticeReducer,
    latestAnnouncementReducer,
    latestClubActivitiesReducer,
    latestNoticeReducer,
    sortByLastActivity,
    updateClubReducer, 
    watchlistRecsReducer, 
} from "./reducers";

import { getNewSettings } from '../api/SettingsApi';
import Constants from 'expo-constants';
const REELAY_APP_VERSION = Constants.manifest.version;

const initialState = {
    // AUTHENTICATION
    authSession: {},
    cognitoUser: {},
    reelayDBUser: {},
    reelayDBUserID: null,
    signedIn: false, 

    // CLUBS + WATCHLISTS
    myClubs: [],
    myClubActivities: [],
    myWatchlistItems: [],

    // FEEDS
    discoverMostRecent: {
        content: [],
        filters: {},
        nextPage: 0,
    },
    discoverThisWeek: {
        content: [],
        filters: {},
        nextPage: 0,
    },
    discoverThisMonth: {
        content: [],
        filters: {},
        nextPage: 0,
    },
    discoverAllTime: {
        content: [],
        filters: {},
        nextPage: 0,
    },
    emptyGlobalTopics: [],

    homeFollowingFeed: {
        content: [],
        nextPage: 0,
    },
    homeInTheatersFeed: {
        content: [],
        nextPage: 0,
    },
    homeOnStreamingFeed: {
        content: [],
        nextPage: 0,
    },
    homeTopOfTheWeekFeed: {
        content: [],
        nextPage: 0,
    },
    homeTopicsFeed: {
        content: [],
        nextPage: 0,
    },


    // GLOBAL
    appUpdateRequired: false,
    appUpdateRecommended: false,
    appUpdateIgnored: false,
    currentAppVersion: REELAY_APP_VERSION,
    recommendedAppVersion: null,
    requiredAppVersion: null,
    justShowMeSignupVisible: false,
    tabBarVisible: true,

    // HOME SCREEN
    latestAnnouncement: null,
    latestAnnouncementDismissed: false,
    latestNotice: null,
    latestNoticeDismissed: false,
    latestNoticeSkipped: false,
    myHomeContent: {},
    myDismissalHistory: {},
    showFestivalsRow: false,

    // ON REELAYS
    likesVisible: false,
    commentsVisible: false,
    commentRefreshListener: 0,
    currentComment: '',
    discoverHasUnseenReelays: true,
    donateLinks: [],
    dotMenuVisible: false,

    // PROFILE
    isEditingProfile: false,
    followRequests: [],
    myCreatorStacks: [],
    myFollowing: [],
    myFollowers: [],
    myNotifications: [],
    myStreamingSubscriptions: [],
    mySettings: {},

    // SEARCH
    suggestedMovieResults: { titles: [], nextPage: 0 },
    suggestedSeriesResults: { titles: [], nextPage: 0 },

    // SIGNUP
    isLoading: true,
    isReturningUser: false,
    loginPasswordHidden: true,
    loginPasswordInputText: '',
    loginUsernameInputText: '',
    passwordLoginError: '',
    signedUpFromGuest: false,
    usernameLoginError: '',

    // UPLOAD
    refreshOnUpload: false,
    s3Client: null,
    uploadProgress: 0,
    uploadRequest: null,
    uploadStage: 'none',
}

const appReducer = ( state = initialState, action) => {
    switch(action.type) {
        // AUTHENTICATION
        case 'clearAuthSession':
            return { ...state, authSession: {}, };
        case 'setAuthSessionFromCognito':
            const authSession = cognitoSessionReducer(action.payload);
            return { ...state, authSession };
        case 'setCognitoUser':
            return { ...state, cognitoUser: action.payload }
        case 'setReelayDBUser':
            return { ...state, reelayDBUser: action.payload }
        case 'setReelayDBUserID':
            return { ...state, reelayDBUserID: action.payload }
        case 'setSignedIn':
            return { ...state, signedIn: action.payload }

        // CLUBS + WATCHLISTS
        case 'setMyClubs':
            const myClubs = action.payload;
            const myClubsSorted = myClubs.sort(sortByLastActivity);
            let myClubActivities = latestClubActivitiesReducer(myClubs);
            return { ...state, myClubs: myClubsSorted, myClubActivities };
        case 'setUpdatedClub':
            const updatedClub = action.payload;
            const updatedMyClubs = updateClubReducer(state.myClubs, updatedClub);
            myClubActivities = latestClubActivitiesReducer(updatedMyClubs);
            return { ...state, myClubs: updatedMyClubs, myClubActivities };    
        case 'setMyWatchlistItems':
            const myWatchlistItems = watchlistRecsReducer(action.payload);
            return { ...state, myWatchlistItems };    


        // FEEDS (migrating stuff over here in 1.05)
        case 'setDiscoverMostRecent':
            return { ...state, discoverMostRecent: action.payload };
        case 'setDiscoverThisWeek':
            return { ...state, discoverThisWeek: action.payload };
        case 'setDiscoverThisMonth':
            return { ...state, discoverThisMonth: action.payload };
        case 'setDiscoverAllTime':
            return { ...state, discoverAllTime: action.payload };
        case 'setEmptyGlobalTopics':
            return { ...state, emptyGlobalTopics: action.payload };

        case 'setHomeFollowingFeed':
            return { ...state, homeFollowingFeed: action.payload };
        case 'setHomeInTheatersFeed':
            return { ...state, homeInTheatersFeed: action.payload };
        case 'setHomeOnStreamingFeed':
            return { ...state, homeOnStreamingFeed: action.payload };
        case 'setHomeTopicsFeed':
            return { ...state, homeTopicsFeed: action.payload };
        case 'setHomeTopOfTheWeekFeed':
            return { ...state, homeTopOfTheWeekFeed: action.payload };

        // GLOBAL
        case 'setAppVersionInfo':
            const { minVersionRequired, recommendedVersion } = action.payload;
            if (minVersionRequired > state.currentAppVersion) return { ...state, appUpdateRequired: true, recommendedAppVersion: recommendedVersion, requiredAppVersion: minVersionRequired };
            else if (recommendedVersion > state.currentAppVersion) return { ...state, appUpdateRecommended: true, recommendedAppVersion: recommendedVersion, requiredAppVersion: minVersionRequired };
            return { ...state, recommendedAppVersion: recommendedVersion, requiredAppVersion: minVersionRequired };
        case 'setAppUpdateIgnored':
            return { ...state, appUpdateIgnored: action.payload };
        case 'setJustShowMeSignupVisible':
            return { ...state, justShowMeSignupVisible: action.payload }
        case 'setTabBarVisible':
            return { ...state, tabBarVisible: action.payload }        

        // HOME SCREEN
        case 'setLatestAnnouncement':
            const latestAnnouncement = latestAnnouncementReducer({ 
                announcement: action.payload,
                myDismissalHistory: state.myDismissalHistory,
                myFollowing: state.myFollowing,
                reelayDBUser: state.reelayDBUser,
            });
            const latestAnnouncementNotDismissed = dismissAnnouncementReducer({
                announcement: latestAnnouncement,
                dismissalHistory: state.myDismissalHistory,
            });
            return { ...state, latestAnnouncement: latestAnnouncementNotDismissed };
        case 'setLatestAnnouncementDismissed':
            return { ...state, latestAnnouncementDismissed: action.payload };
        case 'setLatestNotice':
            const latestNotice = latestNoticeReducer({
                latestNotice: action.payload,
                dismissalHistory: state.myDismissalHistory,
                myClubs: state.myClubs,
                myCreatorStacks: state.myCreatorStacks,
                userSub: state.reelayDBUserID,
            });
            const latestNoticeNotDismissed = dismissNoticeReducer({
                notice: latestNotice,
                dismissalHistory: state.myDismissalHistory,
            });
            return { ...state, latestNotice: latestNoticeNotDismissed };
        case 'setLatestNoticeDismissed':
            return { ...state, latestNoticeDismissed: action.payload }
        case 'setLatestNoticeSkipped':
            return { ...state, latestNoticeSkipped: action.payload }
        case 'setMyHomeContent':
            // also setting discover most recent here for now
            // holdover until we migrate entirely to the new discover feed
            let myHomeContent = action.payload;
            const discoverMostRecent = {
                content: myHomeContent.global,
                filters: {},
                nextPage: 1,
            };
            return { ...state, discoverMostRecent, myHomeContent }
        case 'setMyDismissalHistory':
            return { ...state, myDismissalHistory: action.payload }
        case 'setStreamingStacks':
            myHomeContent =  { ...state.myHomeContent };
            if (!myHomeContent.discover || !myHomeContent.following) {
                console.log('Invalid home content. Cannot set streaming stacks');
                return state;
            }

            const { nextDiscover, nextFollowing } = action.payload;
            if (nextDiscover) myHomeContent.discover.streaming = nextDiscover;
            if (nextFollowing) myHomeContent.following.streaming = nextFollowing;
            return { ...state, myHomeContent };
        case 'setShowFestivalsRow':
            return { ...state, showFestivalsRow: action.payload }            
        case 'setTopics': 
            const { discover, following, nextPage } = action.payload;
            myHomeContent = { ...state.myHomeContent };
            if (!myHomeContent.discover || !myHomeContent.following) {
                console.log('Invalid home content. Cannot set topics');
                return state;
            }

            if (discover) {
                myHomeContent.discover.topics = discover;
                myHomeContent.discover.topicsNextPage = nextPage;
            }
            if (following) {
                myHomeContent.following.topics = following;
                myHomeContent.following.topicsNextPage = nextPage;
            }
            return { ...state, myHomeContent };

        // ON REELAYS
        case 'setCommentsVisible':
            return { ...state, commentsVisible: action.payload }
        case 'setCommentRefreshListener':
            return { ...state, commentRefreshListener: action.payload }
        case 'setCurrentComment':
            return { ...state, currentComment: action.payload }
        case 'setDonateLinks':
            return { ...state, donateLinks: action.payload }        
        case 'setDotMenuVisible':
            return { ...state, dotMenuVisible: action.payload }
        case 'setDiscoverHasUnseenReelays':
            return { ...state, discoverHasUnseenReelays: action.payload }
        case 'setLikesVisible':
            return { ...state, likesVisible: action.payload }    

        // PROFILE
        case 'setIsEditingProfile':
            return { ...state, isEditingProfile: action.payload }    
        case 'setMyCreatorStacks':
            return { ...state, myCreatorStacks: action.payload }
        case 'setMyFollowing':
            return { ...state, myFollowing: action.payload }
        case 'setMyFollowers':
            return { ...state, myFollowers: action.payload }
        case 'setFollowRequests': // unused
            return { ...state, followRequests: action.payload }    
        case 'setMyNotifications':
            return { ...state, myNotifications: action.payload }
        case 'setMyStreamingSubscriptions':
            return { ...state, myStreamingSubscriptions: action.payload }

        // SEARCH
        case 'setSuggestedMovieResults':
            return { ...state, suggestedMovieResults: action.payload }
        case 'setSuggestedSeriesResults':
            return { ...state, suggestedSeriesResults: action.payload }

            return { ...state, myStreamingSubscriptions: action.payload } 
        case 'setMySettings':
            return { ...state, mySettings: action.payload }
        case 'updateMySettings': // payload e.g. { notifyCommentsOnMyReelays: true }
            const settingsToUpdate = action.payload;
            const oldMySettings = { ...state.mySettings };
            const newMySettings = getNewSettings(oldMySettings, settingsToUpdate);
            return { ...state, mySettings: newMySettings };
            
            
        // SIGNUP
        case 'setIsLoading':
            return { ...state, isLoading: action.payload }
        case 'setIsReturningUser':
            return { ...state, isReturningUser: action.payload }
        case 'setLoginPasswordHidden':
            return { ...state, loginPasswordHidden: action.payload }        
        case 'setLoginUsernameInputText':
            return { ...state, loginUsernameInputText: action.payload }
        case 'setLoginPasswordInputText':
            return { ...state, loginPasswordInputText: action.payload }
        case 'setPasswordLoginError':
            return { ...state, passwordLoginError: action.payload }    
        case 'setSignUpFromGuest':
            return { ...state, signUpFromGuest: action.payload }            
        case 'setUsernameLoginError':
            return { ...state, usernameLoginError: action.payload }

        // UPLOAD
        case 'setRefreshOnUpload':
            return { ...state, refreshOnUpload: action.payload }
        case 'setS3Client':
            return { ...state, s3Client: action.payload }
        case 'setUploadProgress':
            return { ...state, uploadProgress: action.payload }
        case 'setUploadRequest':
            return { ...state, uploadRequest: action.payload }
        case 'setUploadStage':
            return { ...state, uploadStage: action.payload }
                                
        default: 
            return state
    }
}

export const mapStateToProps = (state) => ({
    // AUTHENTICATION
    authSession: state.authSession,
    cognitoUser: state.cognitoUser,
    reelayDBUser: state.reelayDBUser,
    reelayDBUserID: state.reelayDBUserID,
    signedIn: state.signedIn,

    // CLUBS + WATCHLISTS
    myClubs: state.myClubs,
    myClubActivities: state.myClubActivities,
    myWatchlistItems: state.myWatchlistItems,

    // FEEDS
    discoverAllTime: state.discoverAllTime,
    discoverMostRecent: state.discoverMostRecent,
    discoverThisMonth: state.discoverThisMonth,
    discoverThisWeek: state.discoverThisWeek,
    emptyGlobalTopics: state.emptyGlobalTopics,
    
    homeFollowingFeed: state.homeFollowingFeed,
    homeInTheatersFeed: state.homeInTheatersFeed,
    homeOnStreamingFeed: state.homeOnStreamingFeed,
    homeTopOfTheWeekFeed: state.homeTopOfTheWeekFeed,
    homeTopicsFeed: state.homeTopicsFeed,

    // GLOBAL
    appUpdateRequired: state.appUpdateRequired,
    appUpdateRecommended: state.appUpdateRecommended,
    appUpdateIgnored: state.appUpdateIgnored,
    currentAppVersion: state.currentAppVersion,
    recommendedAppVersion: state.recommendedAppVersion,
    requiredAppVersion: state.requiredAppVersion,
    justShowMeSignupVisible: state.justShowMeSignupVisible,
    tabBarVisible: state.tabBarVisible,

    // HOME SCREEN
    latestAnnouncement: state.latestAnnouncement,
    latestAnnouncementDismissed: state.latestAnnouncementDismissed,
    latestNotice: state.latestNotice,
    latestNoticeDismissed: state.latestNoticeDismissed,
    latestNoticeSkipped: state.latestNoticeSkipped,
    myHomeContent: state.myHomeContent,
    myDismissalHistory: state.myDismissalHistory,
    showFestivalsRow: state.showFestivalsRow,

    // ON REELAYS
    commentsVisible: state.commentsVisible,
    commentRefreshListener: state.commentRefreshListener,
    currentComment: state.currentComment,
    discoverHasUnseenReelays: state.discoverHasUnseenReelays,
    donateLinks: state.donateLinks,
    dotMenuVisible: state.dotMenuVisible,
    likesVisible: state.likesVisible,

    // PROFILE
    isEditingProfile: state.isEditingProfile,
    myCreatorStacks: state.myCreatorStacks,
    myFollowing: state.myFollowing,
    myFollowers: state.myFollowers,
    followRequests: state.followRequests,
    myNotifications: state.myNotifications,
    myPreferences: state.myPreferences,
    myStreamingSubscriptions: state.myStreamingSubscriptions,

    // SEARCH
    suggestedMovieResults: state.suggestedMovieResults,
    suggestedSeriesResults: state.suggestedSeriesResults,

    // SIGNUP
    isLoading: state.isLoading,
    isReturningUser: state.isReturningUser,    
    loginPasswordHidden: state.loginPasswordHidden,
    loginPasswordInputText: state.loginPasswordInputText,
    loginUsernameInputText: state.loginUsernameInputText,
    passwordLoginError: state.passwordLoginError,
    signUpFromGuest: state.signUpFromGuest,
    usernameLoginError: state.usernameLoginError,

    // UPLOAD
    refreshOnUpload: state.refreshOnUpload,
    s3Client: state.s3Client,
    uploadProgress: state.uploadProgress,
    uploadRequest: state.uploadRequest,
    uploadStage: state.uploadStage,
});

let store = createStore(appReducer);
// const unsubscribe = store.subscribe(() => console.log(store.getState()));
export default store;