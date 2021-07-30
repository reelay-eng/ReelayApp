import React, { useState } from 'react';
import { Dimensions, View, TouchableOpacity } from 'react-native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import styled from 'styled-components/native';

const WINDOW_HEIGHT = Dimensions.get("window").height;

export default RecordButton = ({ disabled, recording, onPress, onComplete }) => {

    const REELAY_DURATION_SECONDS = 15;
    const RECORD_COLOR = '#cb2d26';
    const captureSize = Math.floor(WINDOW_HEIGHT * 0.07);
    const ringSize = captureSize + 20;

    const RecordButtonCenter = styled(TouchableOpacity)`
        background-color: ${RECORD_COLOR};
        height: ${captureSize}px;
        width: ${captureSize}px;
        border-radius: ${Math.floor(captureSize / 2)}px;
    `

    return (
        <View style={{ position: 'absolute' }}>
            <CountdownCircleTimer 
                    colors={[[RECORD_COLOR]]}
                    duration={REELAY_DURATION_SECONDS} 
                    isPlaying={recording} 
                    onComplete={onComplete}
                    size={ringSize} 
                    strokeWidth={5} 
                    strokeLinecap={'round'}>
                <RecordButtonCenter activeOpacity={0.7} disabled={disabled} onPress={onPress} />
            </CountdownCircleTimer>
        </View>
    );
}


