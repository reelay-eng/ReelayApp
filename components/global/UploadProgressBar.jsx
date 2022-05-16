import React from 'react';
import { useSelector } from 'react-redux';
import { Dimensions, View } from 'react-native';
import { Icon } from 'react-native-elements';

import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from './Text';
import * as Progress from 'react-native-progress';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const IconContainer = styled(View)`
    justify-content: flex-end;
    padding: 8px;
    padding-left: 0px;
`
const ProgressContainer = styled(View)`
    align-items: center;
    background-color: rgba(0,0,0,0.2);
    border-radius: 8px;
    flex-direction: row;
    left: 8px;
    padding: 8px;
    position: absolute;
    top: ${props => props.topOffset}px;
`
const ProgressText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    padding-top: 8px;
    padding-bottom: 8px;
`

export default UploadProgressBar = () => {
    const topOffset = useSafeAreaInsets().top + 108;
    const uploadProgress = useSelector(state => state.uploadProgress);
    const uploadStage = useSelector(state => state.uploadStage);

    const indeterminate = (uploadStage === 'upload-ready');
    const message = (uploadStage === 'uploading' || uploadStage === 'upload-ready') 
        ? 'UPLOADING' 
        : 'DONE';

    return (
        <ProgressContainer topOffset={topOffset}>
            <IconContainer>
            <Icon type='ionicon' name='cloud-upload-outline' color='white' size={24} />
            </IconContainer>
            <View>
                <ProgressText>{message}</ProgressText>
                <Progress.Bar
                    color={ReelayColors.reelayBlue} 
                    borderColor='white'
                    indeterminate={indeterminate} 
                    progress={uploadProgress} 
                    width={width - 64} 
                    height={8}
                    borderRadius={8}                
                />
            </View>
        </ProgressContainer>
    );
}