import React, { createContext } from 'react';

export const AuthContext = createContext({
    cognitoUser: {},

    myCreatorStacks: [],
    myFollowers: [],

    followRequests: [],
    reelayDBUser: {},
    reelayDBUserID: null,
    signedIn: false,
});