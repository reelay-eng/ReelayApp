// redux
import { configureStore } from '@reduxjs/toolkit';
import { applyMiddleware } from 'redux';
import { createReelaySlice } from './slices/CreateReelaySlice';

// compose middleware
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension'
const composedEnhancer = composeWithDevTools(applyMiddleware(thunk));

// create store
export default store = configureStore({
    reducer: {
        createReelay: createReelaySlice.reducer
    },
    enhancers: [composedEnhancer],
    devTools: true
})