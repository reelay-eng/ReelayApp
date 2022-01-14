import React, { createContext } from 'react';

export const FeedContext = createContext({
    commentsVisible: false,
    currentComment: '',
    dotMenueVisible: false,
    likesVisible: false,
    overlayVisible: false,
    overlayData: {},
    paused: false,
    playPauseVisible: 'none',
    tabBarVisible: true,
});