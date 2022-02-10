import React, { createContext } from 'react';

export const FeedContext = createContext({
    currentComment: '',
    paused: false,
    playPauseVisible: 'none',
    tabBarVisible: true,
});