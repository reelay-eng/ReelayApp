import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import styled from 'styled-components/native';

import VideoPlayer from '../view-reelay/VideoPlayer'
import TitleInfo from '../view-reelay/TitleInfo';
import ReelayInfo from './ReelayInfo'
import Sidebar from './Sidebar'

const Gradient = styled(LinearGradient)`
	height: 100%;
	justify-content: space-between;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	z-index: 1;
`
const InterfaceContainer = styled(View)`
    flex: 1;
`
const Overlay = styled(View)`
	flex: 1;
	flex-direction: row;
`
const TopContainer = styled(View)`
	flex: 1;
	flex-direction: row;
	justify-content: space-between;
	align-items: flex-start;
    align-self: flex-end;
`  

const Hero = ({ reelay, index, curPosition }) => {

    return (
        <View key={index}>
            <VideoPlayer
                videoURI={reelay.videoURI}
                poster={require('../../assets/images/splash.png')}
                isPlay={curPosition === index}
            >
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
                        titleObject={reelay.titleObject}
                    />
                    <Sidebar avatar={reelay.creator.avatar} stats={reelay.stats} />
                    <InterfaceContainer>
                        <TopContainer>
                            <TitleInfo titleObject={reelay.titleObject} />
                        </TopContainer>
                    </InterfaceContainer>
                </Overlay>
            </Gradient>
        </View>
    );
}

export default Hero;