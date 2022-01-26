import React, { createContext } from 'react';

export const FeedContext = createContext({
    commentsVisible: false,
    currentComment: '',
    dotMenueVisible: false,
    likesVisible: false,
    paused: false,
    playPauseVisible: 'none',
    tabBarVisible: true,
});