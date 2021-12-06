import React, { createContext } from 'react';

export const UploadContext = createContext({
    chunksUploaded: 0,
    chunksTotal: 0,
    s3Client: null,
});