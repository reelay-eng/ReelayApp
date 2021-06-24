import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-native-elements';
import { ReelayUploadStatus, setUploadStatus } from './CreateReelaySlice';

const UploadReelayButton = ({ navigation }) => {

    const tmdbTitleObject = useSelector((state) => state.createReelay.titleObject);
    const videoSource = useSelector((state) => state.createReelay.videoSource);
    const dispatch = useDispatch();

    const uploadReelay = () => {
      console.log('upload function called');
      dispatch(setUploadStatus({
        chunksUploaded: 0,
        chunksTotal: 1,
        uploadStatus: ReelayUploadStatus.UPLOAD_STAGED,
      }));
      console.log('dispatching nav to home');
      navigation.navigate('HomeFeedScreen');
    }

    return (
        <Button type='clear' title='Post' onPress={uploadReelay} />
    );
};

export default UploadReelayButton;