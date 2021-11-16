import React, { createContext } from 'react';

export const AuthContext = createContext({
    credentials: {},
    isLoading: false,
    reelayDBUser: {},
    signedIn: false,
    session: {},
    user: {},
    username: '',
});