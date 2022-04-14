import React, { useContext, useState } from "react";
import { Pressable } from "react-native";
import { Icon } from "react-native-elements";
import { AuthContext } from "../../context/AuthContext";

import ReelayColors from "../../constants/ReelayColors";
import * as MediaLibrary from 'expo-media-library';
import { logAmplitudeEventProd } from "../utils/EventLogger";
import styled from 'styled-components/native';

const DownloadButtonPressable = styled(Pressable)`
    background-color: ${props => props.color}
    border-radius: 24px;
    align-items: center;
    justify-content: center;
    height: 48px;
    width: 80px;
    bottom: 10px;
    left: 10px;
`

export default DownloadButton = ({ titleObj, videoURI }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const [hasSavePermission, setHasSavePermission] = useState(null);
    const [downloadStage, setDownloadStage] = useState('preview');

    const getBackgroundColor = () => {
        if (downloadStage === 'preview') {
            return 'white';
        } else if (downloadStage === 'downloading') {
            return ReelayColors.reelayBlack;
        } else if (downloadStage === 'download-complete') {
            return 'green';
        } else {
            return ReelayColors.reelayRed;
        }
    }

    const getCurrentIconName = () => {
        if (downloadStage === 'preview') {
            return 'download';
        } else if (downloadStage === 'downloading') {
            return 'download';
        } else if (downloadStage === 'download-complete') {
            return 'checkmark-done';
        } else {
            return 'reload';
        }
    }

    const getCurrentIconColor = () => {
        if (downloadStage === 'preview') {
            return 'black';
        } else if (downloadStage === 'downloading') {
            return 'white';
        } else if (downloadStage === 'download-complete') {
            return 'white';
        } else {
            return ReelayColors.reelayRed;
        }
    }

    const downloadReelay = async () => {
        if (!hasSavePermission) {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            const nextHasSavePermission = status === 'granted';
            setHasSavePermission(nextHasSavePermission);
            if (!nextHasSavePermission) return;
        }

        try {
            setDownloadStage('downloading');
            await MediaLibrary.saveToLibraryAsync(videoURI);
            setDownloadStage('download-complete');
        } catch (error) {
            console.log('Could not save to local device...');
            logAmplitudeEventProd('saveToDeviceFailed', {
                username: reelayDBUser?.username,
                title: titleObj.display,
            });
            setDownloadStage('download-failed-retry');
        }
    }

    return (
        <DownloadButtonPressable onPress={downloadReelay} color={getBackgroundColor()}>
            <Icon type='ionicon' name={getCurrentIconName()} color={getCurrentIconColor()} size={24} />
        </DownloadButtonPressable>  
    );
}