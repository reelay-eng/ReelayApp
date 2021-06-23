import { createSlice } from '@reduxjs/toolkit';

// not in use yet

export const reelayFeedSlice = createSlice({
    name: 'reelayFeed',
    initialState: {
        reelayList: [],
        reelayListNextToken: null,
        selectedFeed: 'global',
        selectedFeedLoaded: false,
        selectedFeedPosition: 0,
    },
    reducers: {
        appendReelayList: (state, action) => {
            // action.payload contains an array of Reelay objects
            if (!state.reelayList) {
                state.reelayList = [];
            }
            state.reelayList = [...state.reelayList, ...action.payload.nextReelays];
            state.reelayListNextToken = action.payload.nextToken;
        },
        resetFocus: (state, action) => {
            const newSelectedFeed = action.payload.selectedFeed;
            if (newSelectedFeed && newSelectedFeed != state.selectedFeed) {
                state.reelayList = [];
                state.reelayListNextToken = null;
                state.selectedFeed = newSelectedFeed;
                state.selectedFeedLoaded = false;
            }
        },
        setFeedPosition: (state, action) => {
            // action.payload contains integer position in feed
            state.selectedFeedPosition = action.payload;
        },
        setReelayList: (state, action) => {
            state.reelayList = action.payload.initialReelays;
            state.reelayListNextToken = action.payload.nextToken;
            state.selectedFeedLoaded = true;
        },
    }
});

export const { 
    appendReelayList, 
    resetFocus, 
    setReelayList,
    setFeedPosition,
} = reelayFeedSlice.actions;
export default reelayFeedSlice.reducer;