import React, { createContext } from 'react';

export const VisibilityContext = createContext({
    commentsVisible: false,
    currentComment: '',
    likesVisible: false,
    overlayVisible: false,
    overlayData: {},
    tabBarVisible: true,
});