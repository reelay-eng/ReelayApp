import { createStore } from "redux";
import { 
    cognitoSessionReducer, 
    stacksOnStreamingReducer, 
    updateClubReducer, 
    watchlistRecsReducer 
} from "./reducers";

const initialState = {
    authSession: {},
    cognitoUser: {},
    donateLinks: [],
    isEditingProfile: false,
    isLoading: true,
    isReturningUser: false,

    globalTopics: [],
    globalTopicsWithReelays: [],
    myClubs: [],
    myCreatorStacks: [],
    myFollowing: [],
    myFollowers: [],
    myNotifications: [],
    myWatchlistItems: [],

    myStreamingSubscriptions: [],
    myStacksFollowing: [],
    myStacksInTheaters: [],
    myStacksOnStreaming: [],
    myStacksAtFestivals: [],
    topOfTheWeek: [],

    followRequests: [],
    reelayDBUser: {},
    reelayDBUserID: null,
    signedIn: false,
    signedUpFromGuest: false,

    likesVisible: false,
    commentsVisible: false,
    currentComment: '',
    dotMenuVisible: false,
    hasUnseenGlobalReelays: true,
    justShowMeSignupVisible: false,
    refreshOnUpload: false,
    s3Client: null,
    
    showFestivalsRow: false,
    tabBarVisible: true,

    // authentication
    loginUsernameInputText: '',
    loginPasswordInputText: '',
    usernameLoginError: '',
    passwordLoginError: '',
    loginPasswordHidden: true,
}

const appReducer = ( state = initialState, action) => {
    switch(action.type) {
        case 'clearAuthSession':
            return { ...state, authSession: {}, };
        case 'setAuthSessionFromCognito':
            const authSession = cognitoSessionReducer(action.payload);
            return { ...state, authSession };
        case 'setCognitoUser':
            return { ...state, cognitoUser: action.payload }
        case 'setDonateLinks':
            return { ...state, donateLinks: action.payload }    
        case 'setIsEditingProfile':
            return { ...state, isEditingProfile: action.payload }    
        case 'setIsLoading':
            return { ...state, isLoading: action.payload }
        case 'setIsReturningUser':
            return { ...state, isReturningUser: action.payload }

        case 'setGlobalTopics':
            const globalTopics = action.payload;
            const globalTopicsWithReelays = globalTopics.filter((topic) => {
                return topic.reelays.length > 0;
            });
            return { ...state, globalTopics, globalTopicsWithReelays };
        case 'setMyClubs':
            return { ...state, myClubs: action.payload };
        case 'setUpdatedClub':
            const updatedClub = action.payload;
            const updatedMyClubs = updateClubReducer(state.myClubs, updatedClub);
            return { ...state, myClubs: updatedMyClubs };    
        case 'setMyCreatorStacks':
            return { ...state, myCreatorStacks: action.payload };
        case 'setMyFollowing':
            return { ...state, myFollowing: action.payload };
        case 'setMyFollowers':
            return { ...state, myFollowers: action.payload };
        case 'setMyNotifications':
            return { ...state, myNotifications: action.payload };
        case 'setMyWatchlistItems':
            const myWatchlistItems = watchlistRecsReducer(action.payload);
            return { ...state, myWatchlistItems };

        case 'setMyStreamingSubscriptions':
            return { ...state, myStreamingSubscriptions: action.payload }
        case 'setMyStacksFollowing':
            return { ...state, myStacksFollowing: action.payload }
        case 'setMyStacksInTheaters':
            return { ...state, myStacksInTheaters: action.payload }
        case 'setMyStacksOnStreaming':
            const myStacksOnStreaming = stacksOnStreamingReducer({
                stacksOnStreaming: action.payload, 
                streamingSubscriptions: state.myStreamingSubscriptions,
            });
            return { ...state, myStacksOnStreaming }
        case 'setMyStacksAtFestivals':
            return { ...state, myStacksAtFestivals: action.payload }
        case 'setTopOfTheWeek':
            return { ...state, topOfTheWeek: action.payload }

        case 'setFollowRequests':
            return { ...state, followRequests: action.payload }
        case 'setReelayDBUser':
            return { ...state, reelayDBUser: action.payload }
        case 'setReelayDBUserID':
            return { ...state, reelayDBUserID: action.payload }
        case 'setSignedIn':
            return { ...state, signedIn: action.payload }
        case 'setSignUpFromGuest':
            return { ...state, signUpFromGuest: action.payload }

        case 'setCommentsVisible':
            return { ...state, commentsVisible: action.payload }
        case 'setCurrentComment':
            return { ...state, currentComment: action.payload }
        case 'setDotMenuVisible':
            return { ...state, dotMenuVisible: action.payload }
        case 'setHasUnseenGlobalReelays':
            return { ...state, hasUnseenGlobalReelays: action.payload }
        case 'setJustShowMeSignupVisible':
            return { ...state, justShowMeSignupVisible: action.payload }
        case 'setLikesVisible':
            return { ...state, likesVisible: action.payload }
        case 'setRefreshOnUpload':
            return { ...state, refreshOnUpload: action.payload }
        case 'setS3Client':
            return { ...state, s3Client: action.payload }
            
        case 'setShowFestivalsRow':
            return { ...state, showFestivalsRow: action.payload }
        case 'setTabBarVisible':
            return { ...state, tabBarVisible: action.payload }    
        
        // authentication
        case 'setLoginUsernameInputText':
            return { ...state, loginUsernameInputText: action.payload }
        case 'setLoginPasswordInputText':
            return { ...state, loginPasswordInputText: action.payload }
        case 'setUsernameLoginError':
            return { ...state, usernameLoginError: action.payload }
        case 'setPasswordLoginError':
            return { ...state, passwordLoginError: action.payload }
        case 'setLoginPasswordHidden':
            return { ...state, loginPasswordHidden: action.payload }
            
        default: 
            return state
    }
}

export const mapStateToProps = (state) => ({
    authSession: state.authSession,
    cognitoUser: state.cognitoUser,
    donateLinks: state.donateLinks,
    isEditingProfile: state.isEditingProfile,
    isLoading: state.isLoading,
    isReturningUser: state.isReturningUser,

    globalTopics: state.globalTopics,
    globalTopicsWithReelays: state.globalTopicsWithReelays,
    myClubs: state.myClubs,
    myCreatorStacks: state.myCreatorStacks,
    myFollowing: state.myFollowing,
    myFollowers: state.myFollowers,
    myNotifications: state.myNotifications,
    myPreferences: state.myPreferences,
    myWatchlistItems: state.myWatchlistItems,

    myStreamingSubscriptions: state.myStreamingSubscriptions,
    myStacksFollowing: state.myStacksFollowing,
    myStacksInTheaters: state.myStacksInTheaters,
    myStacksOnStreaming: state.myStacksOnStreaming,
    myStacksAtFestivals: state.myStacksAtFestivals,
    topOfTheWeek: state.topOfTheWeek,

    followRequests: state.followRequests,
    reelayDBUser: state.reelayDBUser,
    reelayDBUserID: state.reelayDBUserID,
    signedIn: state.signedIn,
    signUpFromGuest: state.signUpFromGuest,

    commentsVisible: state.commentsVisible,
    currentComment: state.currentComment,
    dotMenuVisible: state.dotMenuVisible,
    hasUnseenGlobalReelays: state.hasUnseenGlobalReelays,
    justShowMeSignupVisible: state.justShowMeSignupVisible,
    likesVisible: state.likesVisible,
    refreshOnUpload: state.refreshOnUpload,
    s3Client: state.s3Client,
    
    showFestivalsRow: state.showFestivalsRow,
    tabBarVisible: state.tabBarVisible,

    loginUsernameInputText: state.loginUsernameInputText,
    loginPasswordInputText: state.loginPasswordInputText,
    usernameLoginError: state.usernameLoginError,
    passwordLoginError: state.passwordLoginError,
    loginPasswordHidden: state.loginPasswordHidden,
});

let store = createStore(appReducer);
// const unsubscribe = store.subscribe(() => console.log(store.getState()));
export default store;