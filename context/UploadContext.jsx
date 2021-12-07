import React, { createContext } from 'react';

export const UploadContext = createContext({
    s3Client: null
});