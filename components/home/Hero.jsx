import React, { useContext } from 'react'
import { View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import styled from 'styled-components/native';

import VideoPlayer from '../view-reelay/VideoPlayer'
import Poster from '../view-reelay/Poster';
import ReelayInfo from './ReelayInfo';
import Sidebar from './Sidebar';

import { VisibilityContext } from '../../context/VisibilityContext';

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
`
const RightContainer = styled(View)`
	flex: 1;
    flex-direction: column;
	justify-content: flex-end;
	align-items: flex-end;
`  

const Hero = ({ reelay, index, curPosition }) => {

    const visibilityContext = useContext(VisibilityContext);

    return (
        <View key={index}>
            <VideoPlayer
                videoURI={reelay.videoURI}
                playing={curPosition === index && !visibilityContext.overlayVisible}
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
                    <RightContainer>
                        <Poster titleObject={reelay.titleObject} showTitle={false} />
                        {/* <Sidebar avatar={reelay.creator.avatar} stats={reelay.stats} /> */}
                    </RightContainer>
                </Overlay>
            </Gradient>
        </View>
    );
}

export default Hero;