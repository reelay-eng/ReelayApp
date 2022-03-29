import React, { createContext } from 'react';

export const AuthContext = createContext({
    cognitoUser: {},

    followRequests: [],
    reelayDBUser: {},
    reelayDBUserID: null,
});