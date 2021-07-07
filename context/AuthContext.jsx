import React, { createContext } from 'react';

export const AuthContext = createContext({
    credentials: {},
    isLoading: false,
    signedIn: false,
    session: {},
    user: {},
    username: '',
});