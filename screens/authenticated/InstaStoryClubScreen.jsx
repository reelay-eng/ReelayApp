import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
import { ActivityIndicator, Dimensions, Image, PixelRatio, View } from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';

import InstaStoryBackground from '../../assets/images/shareOut/insta-stories-gradient-background.png';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import BackButton from '../../components/utils/BackButton';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import ClubPicture from '../../components/global/ClubPicture';
import { showMessageToast } from '../../components/utils/toasts';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';

const { height, width } = Dimensions.get('window');

const DescriptionText = styled(ReelayText.Body2Bold)`
    color: white;
    font-size: 16px;
    text-align: center;
    text-shadow-color: rgba(0, 0, 0, 0.5);
    text-shadow-offset: 1px 1px;
    text-shadow-radius: 1px;
`
const LoadingView = styled(View)`
    align-items: center;
    height: 100%;
    justify-content: center;
    position: absolute;
    width: 100%;
`
const HeaderView = styled(View)`
    top: ${props => props.topOffset}px;
    position: absolute;
    width: 100%;
`
const ScreenView = styled(View)`
    align-items: center;
    background-color: black;
    height: 100%;
    justify-content: center;
    width: 100%;
`
const StoryBackplateImage = styled(Image)`
    height: 100%;
    width: 100%;
`
const StoryBackplateView = styled(ViewShot)`
    align-items: center;
    height: ${props => props.height}px;
    justify-content: center;
    position: absolute;
    width: ${props => props.width}px;
`
const Spacer = styled(View)`
    height: 30px;
`
const StoryOverlayView = styled(View)`
    align-items: center;
    top: 18px;
    position: absolute;
    width: 80%;
`
const TitleText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    line-height: 24px;
    margin-top: 6px;
    text-align: center;
`
const CAN_USE_RN_SHARE = (Constants.appOwnership !== 'expo');
const INSTA_STORY_HEIGHT = 1920;
const INSTA_STORY_WIDTH = 1080;

export default InstaStoryClubScreen = ({ navigation, route }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const storyShareableRef = useRef(null);
    const storyShareableURI = useRef(null);

    const dispatch = useDispatch();
    const club = route?.params?.club;
    const url = route?.params?.url;

    const topOffset = useSafeAreaInsets().top;

    const pixelRatio = PixelRatio.get();
    const shareableLayoutHeight = INSTA_STORY_HEIGHT / pixelRatio;
    const shareableLayoutWidth = INSTA_STORY_WIDTH / pixelRatio;
    const clubPictureSize = shareableLayoutWidth / 2 ;

    const shareToInstagram = async () => {
        if (!CAN_USE_RN_SHARE) return;
        const RN_SHARE = require('react-native-share');
        const shareResult = await RN_SHARE.default.shareSingle({
            attributionURL: url,
            backgroundImage: storyShareableURI.current,
            url: url,
            social: RN_SHARE.Social.InstagramStories,
            type: 'image/png',
        });
        console.log('share result: ', shareResult);
        logAmplitudeEventProd('shareClubToInstaComplete', {
            club: club?.name,
            sharedBy: reelayDBUser?.username
        });
        navigation.goBack();
    }

    const StoryOverlay = () => {
        return (
            <StoryOverlayView topOffset={topOffset}>
                <FontAwesomeIcon icon={faUsers} size={40} color='white' />
                <TitleText numberOfLines={2}>{club?.name}</TitleText>
                <Spacer />
                <ClubPicture club={club} size={clubPictureSize} />
                <Spacer />
                <DescriptionText>{club?.description}</DescriptionText>
            </StoryOverlayView>
        );    
    }

    const StoryShareable = () => {
        const onImageLoad = useCallback(() => {
            console.log('shareable loaded')
            storyShareableRef.current.capture().then(uri => {
                console.log('shareable ref uri: ', uri);
                storyShareableURI.current = uri;
            })
        }, []);

        return (
            <StoryBackplateView 
                height={shareableLayoutHeight} 
                ref={storyShareableRef}
                width={shareableLayoutWidth
            }>
                <StoryBackplateImage 
                    onLoad={onImageLoad}
                    height={'100%'} 
                    source={InstaStoryBackground} 
                    width={'100%'}
                />
                <StoryOverlay />
            </StoryBackplateView>
        );
    }

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });

    useEffect(() => {
        const captureRefInterval = setInterval(() => {
            if (storyShareableURI.current) {
                console.log('sharing to insta starting...');
                clearInterval(captureRefInterval);
                Clipboard.setStringAsync(url).then(() => {
                    showMessageToast('Invite link copied to clipboard');
                    setTimeout(shareToInstagram, 1000);
                })
            }
        }, 250);
        logAmplitudeEventProd('shareClubToInstaStarted', {
            club: club?.name,
            sharedBy: reelayDBUser?.username
        });
        return () => clearInterval(captureRefInterval);
    }, []);

    return (
        <ScreenView>
            <LoadingView>
                <ActivityIndicator />
            </LoadingView>
            <StoryShareable />
            {/* { capturedBackplateURI && (
                <CapturedView>
                    <Image source={{ uri: capturedBackplateURI }} style={{
                        height: backplateLayoutHeight,
                        width: backplateLayoutWidth,
                    }} />
                </CapturedView>
            )} */}
            {/* { capturedOverlayURI && (
                <CapturedView>
                    <Image source={{ uri: capturedOverlayURI }} style={{
                        height: videoLayoutHeight,
                        width: videoLayoutWidth,
                    }} />
                </CapturedView>
            )} */}
            <HeaderView topOffset={topOffset}>
                <BackButton navigation={navigation} text={'insta story'} />
            </HeaderView>
        </ScreenView>
    )
}
