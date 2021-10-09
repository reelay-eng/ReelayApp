import React, { createContext } from 'react';

export const UploadContext = createContext({
    chunksUploaded: 0,
    chunksTotal: 0,
    hasSelectedTitle: false,
    uploading: false,
    uploadComplete: false,
    uploadTitleObject: {},
    uploadOptions: {},
    uploadErrorStatus: false,
    uploadVideoSource: '',
    venueSelected: '',
});