import { createStore } from "redux";
import { 
    cognitoSessionReducer, 
    latestNoticeReducer,
    sortByLastActivity,
    stacksOnStreamingReducer, 
    updateClubReducer, 
    watchlistRecsReducer 
} from "./reducers";

const initialState = {
    // AUTHENTICATION
    authSession: {},
    cognitoUser: {},
    reelayDBUser: {},
    reelayDBUserID: null,
    signedIn: false,

    // CLUBS + WATCHLISTS
    myClubs: [],
    myWatchlistItems: [],

    // GLOBAL
    justShowMeSignupVisible: false,
    tabBarVisible: true,

    // HOME SCREEN
    globalTopics: [],
    globalTopicsWithReelays: [],
    latestAnnouncement: null,
    latestAnnouncementDismissed: false,
    latestNotice: null,
    latestNoticeDismissed: false,
    latestNoticeSkipped: false,
    myStacksFollowing: [],
    myStacksGlobal: [],
    myStacksInTheaters: [],
    myStacksOnStreaming: [],
    myStacksAtFestivals: [],
    showFestivalsRow: false,
    topOfTheWeek: [],

    // ON REELAYS
    likesVisible: false,
    commentsVisible: false,
    currentComment: '',
    donateLinks: [],
    dotMenuVisible: false,
    hasUnseenGlobalReelays: true,

    // PROFILE
    isEditingProfile: false,
    followRequests: [],
    myCreatorStacks: [],
    myFollowing: [],
    myFollowers: [],
    myNotifications: [],
    myStreamingSubscriptions: [],

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
            return { ...state, myClubs: myClubsSorted };
        case 'setUpdatedClub':
            const updatedClub = action.payload;
            const updatedMyClubs = updateClubReducer(state.myClubs, updatedClub);
            return { ...state, myClubs: updatedMyClubs };    
        case 'setMyWatchlistItems':
            const myWatchlistItems = watchlistRecsReducer(action.payload);
            return { ...state, myWatchlistItems };    

        // GLOBAL
        case 'setJustShowMeSignupVisible':
            return { ...state, justShowMeSignupVisible: action.payload }
        case 'setTabBarVisible':
            return { ...state, tabBarVisible: action.payload }        

        // HOME SCREEN
        case 'setGlobalTopics':
            const globalTopics = action.payload;
            const globalTopicsWithReelays = globalTopics.filter((topic) => {
                return topic.reelays.length > 0;
            });
            return { ...state, globalTopics, globalTopicsWithReelays };
        case 'setLatestAnnouncement':
            return { ...state, latestAnnouncement: action.payload };
        case 'setLatestAnnouncementDismissed': {
            return { ...state, latestAnnouncementDismissed: action.payload };
        }
        case 'setLatestNotice':
            const latestNotice = latestNoticeReducer({
                latestNotice: action.payload,
                myClubs: state.myClubs,
                myCreatorStacks: state.myCreatorStacks,
                userSub: state.reelayDBUserID,
            });
            return { ...state, latestNotice };
        case 'setLatestNoticeDismissed':
            return { ...state, latestNoticeDismissed: action.payload }
        case 'setLatestNoticeSkipped':
            return { ...state, latestNoticeSkipped: action.payload }
        case 'setMyStacksAtFestivals':
            return { ...state, myStacksAtFestivals: action.payload }    
        case 'setMyStacksFollowing':
            return { ...state, myStacksFollowing: action.payload }
        case 'setMyStacksGlobal':
            return { ...state, myStacksGlobal: action.payload };
        case 'setMyStacksInTheaters':
            return { ...state, myStacksInTheaters: action.payload }
        case 'setMyStacksOnStreaming':
            const myStacksOnStreaming = stacksOnStreamingReducer({
                stacksOnStreaming: action.payload, 
                streamingSubscriptions: state.myStreamingSubscriptions,
            });
            return { ...state, myStacksOnStreaming }
        case 'setShowFestivalsRow':
            return { ...state, showFestivalsRow: action.payload }        
        case 'setTopOfTheWeek':
            return { ...state, topOfTheWeek: action.payload }

        // ON REELAYS
        case 'setCommentsVisible':
            return { ...state, commentsVisible: action.payload }
        case 'setCurrentComment':
            return { ...state, currentComment: action.payload }
        case 'setDonateLinks':
            return { ...state, donateLinks: action.payload }        
        case 'setDotMenuVisible':
            return { ...state, dotMenuVisible: action.payload }
        case 'setHasUnseenGlobalReelays':
            return { ...state, hasUnseenGlobalReelays: action.payload }
        case 'setLikesVisible':
            return { ...state, likesVisible: action.payload }    

        // PROFILE
        case 'setIsEditingProfile':
            return { ...state, isEditingProfile: action.payload }    
        case 'setMyCreatorStacks':
            return { ...state, myCreatorStacks: action.payload };
        case 'setMyFollowing':
            return { ...state, myFollowing: action.payload };
        case 'setMyFollowers':
            return { ...state, myFollowers: action.payload };
        case 'setFollowRequests': // unused
            return { ...state, followRequests: action.payload }    
        case 'setMyNotifications':
            return { ...state, myNotifications: action.payload };
        case 'setMyStreamingSubscriptions':
            return { ...state, myStreamingSubscriptions: action.payload }  
            
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
    myWatchlistItems: state.myWatchlistItems,

    // GLOBAL
    justShowMeSignupVisible: state.justShowMeSignupVisible,
    tabBarVisible: state.tabBarVisible,

    // HOME SCREEN
    globalTopics: state.globalTopics,
    globalTopicsWithReelays: state.globalTopicsWithReelays,
    latestAnnouncement: state.latestAnnouncement,
    latestAnnouncementDismissed: state.latestAnnouncementDismissed,
    latestNotice: state.latestNotice,
    latestNoticeDismissed: state.latestNoticeDismissed,
    latestNoticeSkipped: state.latestNoticeSkipped,
    myStacksAtFestivals: state.myStacksAtFestivals,
    myStacksFollowing: state.myStacksFollowing,
    myStacksGlobal: state.myStacksGlobal,
    myStacksInTheaters: state.myStacksInTheaters,
    myStacksOnStreaming: state.myStacksOnStreaming,
    showFestivalsRow: state.showFestivalsRow,
    topOfTheWeek: state.topOfTheWeek,

    // ON REELAYS
    commentsVisible: state.commentsVisible,
    currentComment: state.currentComment,
    donateLinks: state.donateLinks,
    dotMenuVisible: state.dotMenuVisible,
    hasUnseenGlobalReelays: state.hasUnseenGlobalReelays,
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