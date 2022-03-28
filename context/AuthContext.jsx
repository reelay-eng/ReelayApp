import React, { createContext } from 'react';

export const AuthContext = createContext({
    cognitoUser: {},
    isLoading: false,
    isReturningUser: false,

    myCreatorStacks: [],
    myFollowers: [],

    followRequests: [],
    reelayDBUser: {},
    reelayDBUserID: null,
    signedIn: false,
    signUpFromGuest: false,
});