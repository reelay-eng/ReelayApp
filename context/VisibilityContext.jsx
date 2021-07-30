import React, { createContext } from 'react';

export const VisibilityContext = createContext({
    overlayVisible: false,
    overlayData: {},
    tabBarVisible: true,
});