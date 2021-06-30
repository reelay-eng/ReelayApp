import { createSlice } from '@reduxjs/toolkit';
import { strike } from 'aws-amplify';

// maps state to user messages in UploadProgressBar
export const ReelayUploadStatus = {
    UPLOAD_STAGED: 'Upload staged.',
    UPLOAD_IN_PROGRESS: 'Upload in progress...',
    UPLOAD_COMPLETE: 'Upload complete!',
    UPLOAD_FAILED: 'Upload failed.',
    UPLOAD_CANCELLED: 'Upload cancelled',
    NOT_UPLOADING: 'Not uploading anything right now.',
};

export const createReelaySlice = createSlice({
    name: 'createReelay',
    initialState: {
        overlayVisible: true,
        titleObject: null,
        upload: {
            chunksUploaded: 0,
            chunksTotal: 0,
            uploadStatus: ReelayUploadStatus.NOT_UPLOADING,
        },
        videoSource: null,
    },
    reducers: {
        setVideoSource: (state, action) => {
            // action.payload contains videoSource string
            state.videoSource = action.payload;
        },
        setUploadStatus: (state, action) => {
            // action.payload contains upload object
            state.upload.chunksUploaded = action.payload.chunksUploaded;
            state.upload.chunksTotal = action.payload.chunksTotal;
            state.upload.uploadStatus = action.payload.uploadStatus;
        },
        tagTitle: (state, action) => {
            // action.payload contains a TMDbObject
            state.titleObject = action.payload;
            state.overlayVisible = false;
        },
        untagTitle: (state) => {
            state.titleObject = null;
            state.overlayVisible = true;
        },
    }
});

export const { 
    setUploadStatus,
    setVideoSource,
    tagTitle, 
    untagTitle,
} = createReelaySlice.actions
export default createReelaySlice.reducer