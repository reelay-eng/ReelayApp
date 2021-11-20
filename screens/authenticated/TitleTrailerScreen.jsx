import React, { useContext, useEffect, useState } from 'react';
import YoutubeVideoEmbed from '../../components/utils/YouTubeVideoEmbed';
import { 
    ActivityIndicator, 
    Dimensions, 
    Image,
    Pressable, 
    SafeAreaView, 
    ScrollView, 
    Text, 
    View,
    StyleSheet
} from 'react-native';
import styled from 'styled-components/native';

import {PassiveButton} from '../../components/global/Buttons';

export default TitleTrailerScreen = ({navigation, route}) => {
    const {TRAILER_HEIGHT, trailerURI} = route.params;
    const ViewContainer = styled(SafeAreaView)`
        width: 100%;
        height: 100%;
        background-color: #0d0d0d;
        display: flex;
        align-items: center;
    `
    const TitleOverlayTrailerContainer = styled(View)`
        width: 100%;
        margin-top: ${TRAILER_HEIGHT}px;
        height: ${TRAILER_HEIGHT}px;
    `
    const GoBackButtonContainer = styled(View)`
        width: 70%;
        height: 60px;
    `

    return (
        <ViewContainer>
            <TitleOverlayTrailerContainer>
                <YoutubeVideoEmbed youtubeVideoID={trailerURI} height={TRAILER_HEIGHT} />
            </TitleOverlayTrailerContainer>
            <GoBackButtonContainer>
                <PassiveButton fontSize='24px' text='Go Back' onPress={() => navigation.goBack()}></PassiveButton>
            </GoBackButtonContainer>
        </ViewContainer>
    )
}