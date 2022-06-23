import { createStore } from "redux";
import { 
    announcementDismissalReducer,
    noticeDismissalReducer,
    cognitoSessionReducer, 
    latestAnnouncementReducer, 
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
    myDiscoverContent: {},
    myFollowingContent: {},
    myDismissalHistory: {},
    showFestivalsRow: false,
    topics: {},

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
            const latestAnnouncement = latestAnnouncementReducer({ 
                announcement: action.payload,
                myDismissalHistory: state.myDismissalHistory,
                myFollowing: state.myFollowing,
                reelayDBUser: state.reelayDBUser,
            });
            const latestAnnouncementNotDismissed = announcementDismissalReducer({
                announcement: latestAnnouncement,
                dismissalHistory: state.myDismissalHistory,
            });
            return { ...state, latestAnnouncement: latestAnnouncementNotDismissed };
        case 'setLatestAnnouncementDismissed':
            return { ...state, latestAnnouncementDismissed: action.payload };
        case 'setLatestNotice':
            const latestNotice = latestNoticeReducer({
                latestNotice: action.payload,
                myClubs: state.myClubs,
                myCreatorStacks: state.myCreatorStacks,
                userSub: state.reelayDBUserID,
            });
            const latestNoticeNotDismissed = noticeDismissalReducer({
                notice: latestNotice,
                dismissalHistory: state.myDismissalHistory,
            });
            return { ...state, latestNotice: latestNoticeNotDismissed };
        case 'setLatestNoticeDismissed':
            return { ...state, latestNoticeDismissed: action.payload }
        case 'setLatestNoticeSkipped':
            return { ...state, latestNoticeSkipped: action.payload }
        case 'setMyDiscoverContent':
            // let myDiscoverContent = action.payload;
            // const myStreamingStacks = stacksOnStreamingReducer({
            //     stacksOnStreaming: myDiscoverContent?.streaming,
            //     streamingSubscriptions: state?.myStreamingSubscriptions,
            // });
            // myDiscoverContent.streaming = myStreamingStacks;
            console.log('my discover content: ', Object.keys(action.payload));
            console.log('new topics: ', action.payload.newTopics?.length);
            console.log('popular topics: ', action.payload.popularTopics?.length);
            console.log('top of the week: ', action.payload.topOfTheWeek?.length);
            return { ...state, myDiscoverContent: action.payload }    
        case 'setMyFollowingContent':
            console.log('my following content: ', Object.keys(action.payload));
            return { ...state, myFollowingContent: action.payload }
        case 'setMyDismissalHistory':
            return { ...state, myDismissalHistory: action.payload }
        // case 'setMyStacksOnStreaming':
        //     const myStacksOnStreaming = stacksOnStreamingReducer({
        //         stacksOnStreaming: action.payload, 
        //         streamingSubscriptions: state.myStreamingSubscriptions,
        //     });
        //     myDiscoverContent = {
        //         ...state.myDiscoverContent,
        //         streaming: myStacksOnStreaming,
        //     };
        //     return { ...state, myDiscoverContent }
        case 'setStreamingStacks':
            let myFollowingContent = state.myFollowingContent;
            let myDiscoverContent = state.myDiscoverContent;
            const { discover, following } = action.payload;
            if (discover) myDiscoverContent.streaming = discover;
            if (following) myFollowingContent.streaming = following;
            return { ...state, myFollowingContent, myDiscoverContent };
        case 'setShowFestivalsRow':
            return { ...state, showFestivalsRow: action.payload }            
        case 'setTopics': 
            const { discoverNew, discoverPopular, followingNew } = action.payload;
            const nextDiscoverContent = state.myDiscoverContent;
            const nextFollowingContent = state.myFollowingContent;

            if (discoverNew) nextDiscoverContent.newTopics = discoverNew;
            if (discoverPopular) nextDiscoverContent.popularTopics = discoverPopular;
            if (followingNew) nextFollowingContent.newTopics = followingNew;
            return { 
                ...state, 
                myDiscoverContent: nextDiscoverContent, 
                myFollowingContent: nextFollowingContent 
            };

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
    myDiscoverContent: state.myDiscoverContent,
    myFollowingContent: state.myFollowingContent,
    myDismissalHistory: state.myDismissalHistory,
    showFestivalsRow: state.showFestivalsRow,
    topics: {
        discoverNew: state.myDiscoverContent?.newTopics,
        discoverPopular: state.myDiscoverContent?.popularTopics,
        followingNew: state.myFollowingContent?.newTopics
    },

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