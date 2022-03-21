import React, { createContext } from 'react';

export const FeedContext = createContext({
    commentsVisible: false,
    currentComment: '',
    dotMenuVisible: false,
    hasUnseenGlobalReelays: false,
    justShowMeSignupVisible: false,
    likesVisible: false,
    tabBarVisible: true,
});