import React, { createContext } from 'react';

export const AuthContext = createContext({
    cognitoUser: {},
    credentials: {},
    isLoading: false,
    following: [],
    followers: [],
    followRequests: [],
    reelayDBUser: {},
    signedIn: false,
    session: {},
    username: '',
});