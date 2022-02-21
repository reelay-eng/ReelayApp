import React, { createContext } from 'react';

export const AuthContext = createContext({
    cognitoUser: {},
    credentials: {},
    isLoading: false,

    myCreatorStacks: [],
    myFollowing: [],
    myFollowers: [],
    myNotifications: [],
    myWatchlistItems: [],

    followRequests: [],
    reelayDBUser: {},
    signedIn: false,
    isReturningUser: false,
});