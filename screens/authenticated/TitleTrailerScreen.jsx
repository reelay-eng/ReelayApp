import React, { useEffect } from 'react';
import YoutubeVideoEmbed from '../../components/utils/YouTubeVideoEmbed';
import { Dimensions, SafeAreaView, View, Pressable } from 'react-native';
import { Icon } from 'react-native-elements';
import styled from 'styled-components/native';
import * as ReelayText from "../../components/global/Text";

import * as ScreenOrientation from 'expo-screen-orientation';

const { height } = Dimensions.get('window');
const TRAILER_HEIGHT = height * 0.3;

export default TitleTrailerScreen = ({navigation, route }) => {
    const { trailerURI} = route.params;
    const ViewContainer = styled(SafeAreaView)`
        background-color: #0d0d0d;
        align-items: center;
    `
    const TitleOverlayTrailerContainer = styled(View)`
        width: 100%;
        margin-top: ${TRAILER_HEIGHT}px;
        height: ${TRAILER_HEIGHT}px;
    `
    const BackButtonContainer = styled(View)`
        position: absolute;
        top: 50px;
        left: 25px;
    `
    const LoadingTextContainer = styled(View)`
        position: absolute;
        width: 100%;
        height: 100%;
		justify-content: center;
		align-items: center;
	`;
    const LoadingText = styled(ReelayText.H6)`
        color: white;
    `

    return (
		<ViewContainer>
			<BackButtonContainer>
				<Pressable onPress={() => navigation.goBack()}>
					<Icon type="ionicon" name="close-outline" color="white" size={30} />
				</Pressable>
			</BackButtonContainer>
			<TitleOverlayTrailerContainer>
				<LoadingTextContainer>
					<LoadingText>Loading...</LoadingText>
				</LoadingTextContainer>
				<YoutubeVideoEmbed youtubeVideoID={trailerURI} height={TRAILER_HEIGHT} />
			</TitleOverlayTrailerContainer>
		</ViewContainer>
	);
}