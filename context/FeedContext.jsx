import React, { createContext } from 'react';

export const FeedContext = createContext({
    justShowMeSignupVisible: false,
    refreshOnUpload: false,
});