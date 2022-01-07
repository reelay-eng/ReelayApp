import React, { createContext } from 'react';

export const AuthContext = createContext({
    cognitoUser: {},
    credentials: {},
    isLoading: false,
    myFollowing: [],
    myFollowers: [],
    myCreatorStacks: [],
    followRequests: [],
    reelayDBUser: {},
    signedIn: false,
    session: {},
    username: '',
    isReturningUser: false,
});