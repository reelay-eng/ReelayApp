import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import styled from 'styled-components/native';

import VideoPlayer from '../view-reelay/VideoPlayer'
import ReelayInfo from './ReelayInfo'
import Sidebar from './Sidebar'
import TitleInfo from '../view-reelay/TitleInfo';

const Gradient = styled(LinearGradient)`
	height: 100%;
	justify-content: space-between;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	z-index: 1;
`
const Overlay = styled.View`
	flex: 1;
	flex-direction: row;
`

const Hero = ({ navigation, reelay, index, curPosition, titleObject }) => {
    return (
        <View key={index}>
            <VideoPlayer
                videoURI={reelay.videoURI}
                poster={require('../../assets/images/splash.png')}
                isPlay={curPosition === index}
            >
                <TitleInfo titleObject={titleObject} />
            </VideoPlayer>
            <Gradient
                locations={[0, 0.26, 0.6, 1]}
                colors={[
                    'rgba(26,26,26,0.6)',
                    'rgba(26,26,26,0)',
                    'rgba(26,26,26,0)',
                    'rgba(26,26,26,0.6)'
                ]}>
                <Overlay>
                    <ReelayInfo 
                        user={reelay.creator} 
                        movie={reelay.movie} 
                        titleObject={titleObject}
                    />
                    <Sidebar avatar={reelay.creator.avatar} stats={reelay.stats} />
                </Overlay>
            </Gradient>
        </View>
    );
}

export default Hero;