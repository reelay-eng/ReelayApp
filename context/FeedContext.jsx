import React, { createContext } from 'react';

export const FeedContext = createContext({
    commentsVisible: false,
    currentComment: '',
    likesVisible: false,
    overlayVisible: false,
    overlayData: {},
    playPauseVisible: 'none',
    tabBarVisible: true,
});