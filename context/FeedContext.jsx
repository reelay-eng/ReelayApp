import React, { createContext } from 'react';

export const FeedContext = createContext({
    commentsVisible: false,
    currentComment: '',
    donateLinks: [],
    dotMenueVisible: false,
    justShowMeSignupVisible: false,
    likesVisible: false,
    refreshOnUpload: false,
    tabBarVisible: true,
});