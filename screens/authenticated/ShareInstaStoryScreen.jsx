import React, { useEffect } from 'react';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, View } from 'react-native';
import { Video } from 'expo-av';
import { cacheDirectory, downloadAsync, getInfoAsync, makeDirectoryAsync } from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';
import styled from 'styled-components/native';

import InstaStoryBackground from '../../assets/images/shareOut/insta-stories-gradient-background.png';
import { HeaderWithBackButton } from '../../components/global/Headers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

const HeaderView = styled(View)`
    top: ${props => props.topOffset}px;
    position: absolute;
    width: 100%;
`
const ScreenView = styled(View)`
    align-items: center;
    background-color: black;
    height: 100%;
    width: 100%;
`
const StoryBackplate = styled(Image)`
    height: 100%;
    width: 100%;
`

const CAN_USE_RN_SHARE = (Constants.appOwnership !== 'expo');

export default InstaStoryScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const reelay = route?.params?.reelay;
    const topOffset = useSafeAreaInsets().top;

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    })

    const shareToInstagram = async () => {
        if (!CAN_USE_RN_SHARE) return;

        const videoDir = cacheDirectory + 'vid';
        const dirInfo = await getInfoAsync(videoDir);
        if (!dirInfo.exists) {
            console.log("Image directory doesn't exist, creating...");
            await makeDirectoryAsync(videoDir, { intermediates: true });
        }

        console.log('remote uri: ', reelay?.content);
        const localVideoURI = videoDir + '/' + reelay?.sub;
        console.log('local uri: ', localVideoURI);
        const localVideo = await downloadAsync(reelay?.content?.videoURI, localVideoURI);
        console.log(localVideo);

        const RN_SHARE = require('react-native-share');
        const shareResult = await RN_SHARE.default.shareSingle({
            attributionURL: url,
            backgroundVideo: localVideo?.uri,
            url: url,
            social: RN_SHARE.Social.InstagramStories,
            type: 'video/mp4',
        });
        console.log('share result: ', shareResult);
    }

    return (
        <ScreenView>
            <StoryBackplate source={InstaStoryBackground}>
                {/* <StoryHeaderInfo />
                <StoryVideo>
                    <StoryVideoOverlay />
                </StoryVideo> */}
            </StoryBackplate>
            <HeaderView topOffset={topOffset}>
                <HeaderWithBackButton navigation={navigation} text={'insta story'} />
            </HeaderView>
        </ScreenView>
    )
}