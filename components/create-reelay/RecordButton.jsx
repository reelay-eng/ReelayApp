import React from 'react';
import { Dimensions, View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

const WINDOW_HEIGHT = Dimensions.get("window").height;

export default RecordButton = ({ disabled, onPress }) => {

    const RECORD_COLOR = '#cb2d26';
    const captureSize = Math.floor(WINDOW_HEIGHT * 0.07);

    const RecordButtonCenter = styled(TouchableOpacity)`
        background-color: ${RECORD_COLOR};
        height: ${captureSize}px;
        width: ${captureSize}px;
        border-radius: ${Math.floor(captureSize / 2)}px;
    `

    return (
        <View style={{ position: 'absolute' }}>
            <RecordButtonCenter activeOpacity={0.7} disabled={disabled} onPress={onPress} />
        </View>
    );
}


