import React, { createContext } from 'react';

export const AuthContext = createContext({
    cognitoUser: {},
    isReturningUser: false,

    myCreatorStacks: [],
    myFollowers: [],

    followRequests: [],
    reelayDBUser: {},
    reelayDBUserID: null,
    signedIn: false,
    signUpFromGuest: false,
});