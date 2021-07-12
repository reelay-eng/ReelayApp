// redux
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query'
import { applyMiddleware } from 'redux';
import { createReelaySlice } from '../components/create-reelay/CreateReelaySlice';
import { reelayFeedSlice } from '../components/home/ReelayFeedSlice';

// compose middleware
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension'
const composedEnhancer = composeWithDevTools(applyMiddleware(thunk));

// includes code and comments from https://redux-toolkit.js.org/tutorials/rtk-query

// create store
export default store = configureStore({
    reducer: {
        createReelay: createReelaySlice.reducer,
        reelayFeed: reelayFeedSlice.reducer,
        // Add the generated reducer as a specific top-level slice
    },
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: getDefaultMiddleware(),
    enhancers: [composedEnhancer],
    devTools: true
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);