import { createStore } from "redux";

const initialState = {
    cognitoUser: {},
    credentials: {},
    isLoading: true,
    isReturningUser: false,

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

    followRequests: [],
    reelayDBUser: {},
    reelayDBUserID: null,
    signedIn: false,
    signedUpFromGuest: false,

    commentsVisible: false,
    currentComment: '',
    dotMenuVisible: false,
    hasUnseenGlobalReelays: false,
    justShowMeSignupVisible: false,
    likesVisible: false,
    refreshOnUpload: false,
    tabBarVisible: true,
    s3Client: null,
}

const appReducer = ( state = initialState, action) => {
    console.log('DISPATCHED ACTION: ', action.type, action.payload);
    switch(action.type) {
        case 'setCognitoUser':
            return { ...state, cognitoUser: action.payload }
        case 'setCredentials':
            return { ...state, credentials: action.payload }
        case 'setIsLoading':
            return { ...state, isLoading: action.payload }
        case 'setIsReturningUser':
            return { ...state, isReturningUser: action.payload }

        case 'setMyCreatorStacks':
            return { ...state, myCreatorStacks: action.payload }
        case 'setMyFollowing':
            return { ...state, myFollowing: action.payload }
        case 'setMyFollowers':
            return { ...state, myFollowers: action.payload }
        case 'setMyNotifications':
            return { ...state, myNotifications: action.payload }
        case 'setMyWatchlistItems':
            return { ...state, myWatchlistItems: action.payload }  

        case 'setMyStreamingSubscriptions':
            return { ...state, myStreamingSubscriptions: action.payload }
        case 'setMyStacksFollowing':
            return { ...state, myStacksFollowing: action.payload }
        case 'setMyStacksInTheaters':
            return { ...state, myStacksInTheaters: action.payload }
        case 'setMyStacksOnStreaming':
            return { ...state, myStacksOnStreaming: action.payload }
        case 'setMyStacksAtFestivals':
            return { ...state, myStacksAtFestivals: action.payload }

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
        case 'setTabBarVisible':
            return { ...state, tabBarVisible: action.payload }

        case 'setS3Client':
            return { ...state, s3Client: action.payload }
            
        default: 
            return state
    }
}

export const mapStateToProps = (state) => ({
    cognitoUser: state.cognitoUser,
    credentials: state.credentials,
    isLoading: state.isLoading,
    isReturningUser: state.isReturningUser,

    myCreatorStacks: state.myCreatorStacks,
    myFollowing: state.myFollowing,
    myFollowers: state.myFollowers,
    myNotifications: state.myNotifications,
    myWatchlistItems: state.myWatchlistItems,

    myStreamingSubscriptions: state.myStreamingSubscriptions,
    myStacksFollowing: state.myStacksFollowing,
    myStacksInTheaters: state.myStacksInTheaters,
    myStacksOnStreaming: state.myStacksOnStreaming,
    myStacksAtFestivals: state.myStacksAtFestivals,

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
    tabBarVisible: state.tabBarVisible,
    s3Client: state.s3Client,
});

let store = createStore(appReducer);
// const unsubscribe = store.subscribe(() => console.log(store.getState()));
export default store;