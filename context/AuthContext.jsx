import React, { createContext } from 'react';

export const AuthContext = createContext({
    cognitoUser: {},
    credentials: {},
    isLoading: false,
    reelayDBUser: {},
    signedIn: false,
    session: {},
    username: '',
});