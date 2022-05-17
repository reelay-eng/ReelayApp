import React, { useContext, useState } from "react";
import { Pressable } from "react-native";
import { Icon } from "react-native-elements";
import { AuthContext } from "../../context/AuthContext";

import ReelayColors from "../../constants/ReelayColors";
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { logAmplitudeEventProd } from "../utils/EventLogger";
import styled from 'styled-components/native';
import { showErrorToast } from "../utils/toasts";

const DownloadButtonPressable = styled(Pressable)`
    background-color: ${({ color }) => color};
    border-radius: 24px;
    align-items: center;
    justify-content: center;
    height: ${({ height }) => height}px;
    width: ${({ width }) => width}px;
    bottom: 10px;
    left: 10px;
`

export default DownloadButton = ({ 
    titleObj, 
    videoURI, 
    height = 48, 
    width = 80, 
    uploadedReelay = null,
}) => {
    const { reelayDBUser } = useContext(AuthContext);
    const [hasSavePermission, setHasSavePermission] = useState(null);
    const [downloadStage, setDownloadStage] = useState('preview');

    const getBackgroundColor = () => {
        if (downloadStage === 'preview') {
            return 'white';
        } else if (downloadStage === 'downloading') {
            return 'gray';
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
            return 'white';
        }
    }

    const downloadReelayRemote = async () => {
        const fileKey = `/${uploadedReelay.sub}.mp4`;
        const reelayDir = FileSystem.cacheDirectory + 'reelays';
        const dirInfo = await FileSystem.getInfoAsync(reelayDir);
        if (!dirInfo.exists) {
            console.log("Reelay directory doesn't exist, creating...");
            await FileSystem.makeDirectoryAsync(reelayDir, { intermediates: true });
        }            
        const localURI = reelayDir + fileKey;
        await FileSystem.downloadAsync(uploadedReelay.content.videoURI, localURI);
        return localURI;
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
            let localURI = videoURI;
            if (uploadedReelay) {
                localURI = await downloadReelayRemote();
            }
            await MediaLibrary.saveToLibraryAsync(localURI);
            setDownloadStage('download-complete');
        } catch (error) {
            console.log('Could not save to local device...');
            logAmplitudeEventProd('saveToDeviceFailed', {
                username: reelayDBUser?.username,
                title: titleObj?.display,
            });
            showErrorToast('Oops. Could not save to local device');
            setDownloadStage('download-failed-retry');
        }
    }

    return (
        <DownloadButtonPressable 
            color={getBackgroundColor()} 
            onPress={downloadReelay} 
            height={height} 
            width={width}
        >
            <Icon type='ionicon' name={getCurrentIconName()} color={getCurrentIconColor()} size={24} />
        </DownloadButtonPressable>  
    );
}