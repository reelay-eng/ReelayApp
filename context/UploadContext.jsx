import React, { createContext } from 'react';

export const UploadContext = createContext({
    uploading: false,
    uploadComplete: false,
    chunksUploaded: 0,
    chunksTotal: 0,
    uploadTitleObject: {},
    uploadOptions: {},
    uploadErrorStatus: false,
    uploadVideoSource: '',
});