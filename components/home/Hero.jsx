import React, { useCallback, useContext } from 'react'
import { Dimensions, Pressable, SafeAreaView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import styled from 'styled-components/native';

import FeedVideoPlayer from './FeedVideoPlayer';
import Poster from './Poster';
import ReelayInfo from './ReelayInfo';

import { VisibilityContext } from '../../context/VisibilityContext';

const { height, width } = Dimensions.get('window');

const Gradient = styled(LinearGradient)`
	height: 100%;
	justify-content: space-between;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	z-index: 1;
`
const Overlay = styled(View)`
	flex: 1;
	flex-direction: row;
    width: 100%;
    height: 100%;
`
const RightContainer = styled(View)`
    position: absolute;
    left: ${width - 130}px;
    top: 40px;
    zIndex: 3;
`  

const Hero = ({ 
    stack, 
    index, 
    feedIndex,
    feedPosition, 
    stackIndex,
    stackPosition,
}) => {

    const visibilityContext = useContext(VisibilityContext);
    const reelay = stack[stackIndex];
    const isPlaying = (feedIndex === feedPosition)
                    && (stackIndex === stackPosition)
                    && (!visibilityContext.overlayVisible);

    const TapLayer = ({ onTap }) => {
        const TapLayerPressable = styled(Pressable)`
            height: 100%;
            width: 50%;
            position: absolute;
            top: 0px;
            left: ${(onTap === onRightTap ? width / 2 : 0)}px;
            background: transparent;
            zIndex: 2;
        `
        return <TapLayerPressable onPress={() => onTap(reelay, stackPosition)} />
    }

    const StackLocation = ({ position, length }) => {
        const StackLocationOval = styled(View)`
            align-items: flex-end;
            align-self: flex-end;
            background-color: white;
            border-radius: 10px;
            justify-content: center;
            height: 20px;
            width: 50px;
            zIndex: 3;
        `
        const StackLocationText = styled(Text)`
            align-self: center;
            color: black;
            font-size: 14px;
            font-family: System;
        `
        const text = String(position + 1) + ' / ' + String(length);
        return (
            <StackLocationOval>
                <StackLocationText>{ text }</StackLocationText>
            </StackLocationOval>
        );
    }

    return (
        <View key={index}>
            <FeedVideoPlayer
                isLooping={stack.length === 1}
                playing={isPlaying}
                position={stackPosition}
                reelay={reelay}
            >
            </FeedVideoPlayer>
            <Gradient
                locations={[0, 0.26, 0.6, 1]}
                colors={[
                    'rgba(26,26,26,0.6)',
                    'rgba(26,26,26,0)',
                    'rgba(26,26,26,0)',
                    'rgba(26,26,26,0.6)'
                ]}>
                <Overlay>
                    <RightContainer>
                        <Poster reelay={reelay} showTitle={false} />
                        <StackLocation position={stackPosition} length={stack.length} />
                    </RightContainer>
                    <ReelayInfo reelay={reelay} />
                </Overlay>
            </Gradient>
        </View>
    );
}

export default Hero;