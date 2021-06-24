import React, { useRef, useState } from 'react';
import { Auth, DataStore, Storage, progressCallback } from 'aws-amplify';
import { User, Artist, Movie, Reelay } from '../../src/models';
import { useDispatch, useSelector } from 'react-redux';

const UploadProgressBar = ({ titleObject, videoSource }) => {
    const tmdbTitleObject = useSelector((state) => state.createReelay.titleObject);
    const videoSource = useSelector((state) => state.createReelay.videoSource);
}