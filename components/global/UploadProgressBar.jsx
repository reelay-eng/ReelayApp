import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';

import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from './Text';
import * as Progress from 'react-native-progress';
import * as MediaLibrary from 'expo-media-library';

import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showErrorToast } from '../utils/toasts';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const CloseContainer = styled(TouchableOpacity)`
    align-items: center;
    justify-content: flex-end;
    padding-left: 8px;
`
const IconContainer = styled(TouchableOpacity)`
    justify-content: center;
    padding: 8px;
    padding-left: 0px;
`
const FailureControlsContainer = styled(View)`
    align-items: center;
    flex-direction: row;
`
const ProgressContainer = styled(View)`
    align-items: center;
    background-color: rgba(0,0,0,0.36);
    border-radius: 8px;
    flex-direction: row;
    left: 10px;
    padding: 8px;
    position: absolute;
    top: ${props => props.topOffset}px;
`
const ProgressText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    padding-bottom: 8px;
`

export default UploadProgressBar = ({ mountLocation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const uploadProgress = useSelector(state => state.uploadProgress);
    const uploadRequest = useSelector(state => state.uploadRequest);
    const uploadStage = useSelector(state => state.uploadStage);

    const [hasSavePermission, setHasSavePermission] = useState(null);
    const [downloadStage, setDownloadStage] = useState('download-ready');

    const indeterminate = (uploadStage === 'upload-ready');
    const dispatch = useDispatch();
    const { top } = useSafeAreaInsets();

    const topOffset = (mountLocation === 'globalFeed') 
            ? (top + 108) 
        : (mountLocation === 'globalTopics')
            ? (top + 140)
        : top;

    const uploadIconName = (uploadStage === 'upload-failed-retry') 
        ? 'reload-outline' 
        : 'cloud-upload-outline';

    const downloadIconName = (downloadStage === 'download-ready')
            ? 'download-outline'
        : (downloadStage === 'downloading')
            ? 'hourglass'
        : (downloadStage === 'download-complete')
            ? 'checkmark-done'
        : 'reload';

    const message = (uploadStage === 'uploading') 
            ? 'UPLOADING' 
        : (uploadStage === 'upload-failed-retry') 
            ? 'UPLOAD FAILED. RETRY?' 
        : 'DONE';
    
    const progressBarColor = (uploadStage === 'upload-failed-retry') 
        ? ReelayColors.reelayRed 
        : ReelayColors.reelayBlue;

    // we only need to make space for the close button on retry failed
    const progressBarWidth = (uploadStage === 'upload-failed-retry')
        ? width - 132
        : width - 68;


    const downloadVideo = async () => {
        if (!hasSavePermission) {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            const nextHasSavePermission = status === 'granted';
            setHasSavePermission(nextHasSavePermission);
            if (!nextHasSavePermission) return;
        }

        try {
            setDownloadStage('downloading');
            await MediaLibrary.saveToLibraryAsync(uploadRequest?.videoURI);
            setDownloadStage('download-complete');
        } catch (error) {
            console.log('Could not save to local device...');
            logAmplitudeEventProd('saveToDeviceFailed', {
                username: reelayDBUser?.username,
            });
            showErrorToast('Oops. Could not save to local device');
            setDownloadStage('download-failed-retry');
        }
    }
    
    const hideProgressBar = () => {
        // clear the request, forget it ever happened
        dispatch({ type: 'setUploadStage', payload: 'none' });
        dispatch({ type: 'setUploadProgress', payload: 0.0 });
        dispatch({ type: 'setUploadRequest', payload: null });
    }

    const setRetryUpload = () => {
        if (uploadStage !== 'upload-failed-retry') return;
        dispatch({ type: 'setUploadStage', payload: 'upload-ready' });
    }

    return (
        <ProgressContainer topOffset={topOffset}>
            <IconContainer onPress={setRetryUpload}>
                <Icon type='ionicon' name={uploadIconName} color='white' size={24} />
            </IconContainer>
            <View>
                <ProgressText>{message}</ProgressText>
                <Progress.Bar
                    color={progressBarColor} 
                    borderColor='white'
                    indeterminate={indeterminate} 
                    progress={uploadProgress} 
                    width={progressBarWidth} 
                    height={8}
                    borderRadius={8}                
                />
            </View>
            { uploadStage === 'upload-failed-retry' && (
                <FailureControlsContainer>
                    <CloseContainer onPress={downloadVideo}>
                        <Icon type='ionicon' name={downloadIconName} color='white' size={24} />
                    </CloseContainer>
                    <CloseContainer onPress={hideProgressBar}>
                        <Icon type='ionicon' name='close' color='white' size={24} />
                    </CloseContainer>
                </FailureControlsContainer>
            )}
        </ProgressContainer>
    );
}