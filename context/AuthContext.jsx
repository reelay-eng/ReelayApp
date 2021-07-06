import React, { createContext } from 'react';

export const AuthContext = createContext({
    signedIn: false,
    isLoading: false,
    user: null,
    username: '',
    userToken: '',
});