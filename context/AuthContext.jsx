import React, { createContext } from 'react';

export const AuthContext = createContext({
    cognitoUser: {},
    credentials: {},
    isLoading: false,
    isReturningUser: false,

    myCreatorStacks: [],
    myFollowers: [],
    myNotifications: [],
    myWatchlistItems: [],

    followRequests: [],
    reelayDBUser: {},
    reelayDBUserID: null,
    signedIn: false,
    signUpFromGuest: false,
});