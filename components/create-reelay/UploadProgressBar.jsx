import React from 'react';
import { View, Text } from 'react-native';
import { TextStyles } from '../../styles';
import { ProgressBar } from 'react-native-paper';

import { useSelector } from 'react-redux';

const UploadProgressBar = () => {

    const chunksUploaded = useSelector((state) => state.createReelay.upload.chunksUploaded);
    // adding +1 prevents NaN errors. hack.
    const chunksTotal = useSelector((state) => state.createReelay.upload.chunksTotal) + 1;

    return (
        <View style={{width: 150, alignItems: 'center' }}>
            <ProgressBar progress={(chunksUploaded / chunksTotal)} color={'white'} />
            <Text style={TextStyles.whiteText}>{'Uploading...'}</Text>
        </View>
    );
}

export default UploadProgressBar;