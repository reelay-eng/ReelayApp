import React, { createContext } from 'react';

export const AuthContext = createContext({
    cognitoUser: {},
    credentials: {},
    isLoading: false,
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
    signUpFromGuest: false,
});