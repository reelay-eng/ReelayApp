import React, { createContext } from 'react';

export const VisibilityContext = createContext({
    commentsVisible: false,
    likesVisible: false,
    overlayVisible: false,
    overlayData: {},
    tabBarVisible: true,
});