import React, { useCallback, useEffect, useRef, useState } from 'react';
import Constants from 'expo-constants';
import { ActivityIndicator, Dimensions, Image, PixelRatio, View } from 'react-native';
import { Video } from 'expo-av';
import { cacheDirectory, downloadAsync, getInfoAsync, makeDirectoryAsync } from 'expo-file-system';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';

import InstaStoryBackground from '../../assets/images/shareOut/insta-stories-gradient-background.png';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { ReviewIconSVG, TopicsBannerIconSVG } from '../../components/global/SVGs';
import BackButton from '../../components/utils/BackButton';
import TitlePoster from '../../components/global/TitlePoster';
import StarRating from '../../components/global/StarRating';
import ProfilePicture from '../../components/global/ProfilePicture';
import ReelayColors from '../../constants/ReelayColors';
import { compositeReviewForInstagramStories } from '../../api/FFmpegApi';

const { height, width } = Dimensions.get('window');

const CapturedView = styled(View)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    height: 100%;
    justify-content: center;
    width: 100%;
`
const CreatorLine = styled(View)`
    align-items: center;
    bottom: 12px;
    flex-direction: row;
    left: 12px;
    position: absolute;
`
const CreatorText = styled(ReelayText.Body1)`
    color: white;
    margin-left: 8px;
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
const StarRatingLine = styled(View)`
    bottom: 48px;
    left: 12px;
    position: absolute;
`
const StoryVideoOverlayView = styled(ViewShot)`
    border-radius: 16px;
    height: ${props => props.height}px;
    padding: 12px;
    position: absolute;
    width: ${props => props.width}px;
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
const StoryHeaderInfoView = styled(View)`
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
const VIDEO_PLAYER_HEIGHT_RATIO = 0.62;
const VIDEO_PLAYER_WIDTH_RATIO = 0.55;

export default InstaStoryScreen = ({ navigation, route }) => {
    const capturedBackplateURI = useRef(null);
    const capturedOverlayURI = useRef(null);
    const localReelayVideoURI = useRef(null);

    const dispatch = useDispatch();
    const reelay = route?.params?.reelay;
    const url = route?.params?.url;

    const backplateRef = useRef(null);
    const overlayRef = useRef(null);
    const topOffset = useSafeAreaInsets().top;

    const pixelRatio = PixelRatio.get();
    const backplateLayoutHeight = INSTA_STORY_HEIGHT / pixelRatio;
    const backplateLayoutWidth = INSTA_STORY_WIDTH / pixelRatio;
    const videoLayoutHeight = backplateLayoutHeight * VIDEO_PLAYER_HEIGHT_RATIO;
    const videoLayoutWidth = backplateLayoutWidth * VIDEO_PLAYER_WIDTH_RATIO;

    const downloadReelayVideo = async () => {
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
        console.log('local video: ', localVideo);
        localReelayVideoURI.current = localVideo?.uri;
    }

    const shareToInstagram = async () => {
        if (!CAN_USE_RN_SHARE) return;
        const inputURIs = {
            backplateURI: capturedBackplateURI.current.replace('/private', 'file:///'),
            overlayURI: capturedOverlayURI.current.replace('/private', 'file:///'),
            videoURI: localReelayVideoURI.current,
        }

        const offsets = {
            top: (backplateLayoutHeight - videoLayoutHeight) * (pixelRatio / 2),
            left:  (backplateLayoutWidth - videoLayoutWidth) * (pixelRatio / 2),
        }

        const compositeVideoURI = await compositeReviewForInstagramStories({
            inputURIs, offsets
        });

        const RN_SHARE = require('react-native-share');
        const shareResult = await RN_SHARE.default.shareSingle({
            attributionURL: url,
            backgroundVideo: compositeVideoURI,
            url: url,
            social: RN_SHARE.Social.InstagramStories,
            type: 'video/mp4',
        });
        console.log('share result: ', shareResult);
    }

    const StoryBackplate = () => {
        const onImageLoad = useCallback(() => {
            console.log('backplate loaded')
            backplateRef.current.capture().then(uri => {
                console.log('backplate ref uri: ', uri);
                capturedBackplateURI.current = uri;
            })
        }, []);

        return (
            <StoryBackplateView 
                height={backplateLayoutHeight} 
                ref={backplateRef}
                width={backplateLayoutWidth
            }>
                <StoryBackplateImage 
                    onLoad={onImageLoad}
                    height={'100%'} 
                    source={InstaStoryBackground} 
                    width={'100%'}
                />
                <StoryHeaderInfo />
            </StoryBackplateView>
        );
    }

    const StoryVideoOverlay = () => {
        const starRating = reelay.starRating + (reelay.starRatingAddHalf ? 0.5 : 0);

        const onImageLoad = useCallback(() => {
            console.log('overlay loaded');
            overlayRef.current.capture().then(uri => {
                console.log('overlay ref uri: ', uri);
                capturedOverlayURI.current = uri;
            });
        }, []);

        const onCapture = useCallback(uri => {
            capturedOverlayURI.current = uri;
            // console.log('overlay loaded');
            // overlayRef.current.capture().then(uri => {
            //     console.log('overlay ref uri: ', uri);
                // capturedOverlayURI.current = uri;
            // });
        }, []);

        return (
            <StoryVideoOverlayView 
                captureMode='mount'
                onCapture={onCapture}
                height={videoLayoutHeight} 
                // ref={overlayRef}
                width={videoLayoutWidth}
            >
                <TitlePoster onLoad={onImageLoad} title={reelay?.title} width={videoLayoutWidth / 4} />
                <CreatorLine>
                    <ProfilePicture border user={reelay.creator} size={30} />
                    <CreatorText>{reelay.creator.username}</CreatorText>
                </CreatorLine>
                { starRating > 0 && (
                    <StarRatingLine>
                        <StarRating
                            disabled={true}
                            rating={starRating}
                            starSize={20}
                            starStyle={{ paddingRight: 4 }}
                        />
                    </StarRatingLine>
                )}
            </StoryVideoOverlayView>
        );
    }

    const StoryHeaderInfo = () => {
        if (reelay?.topicID) {
            return (
                <StoryHeaderInfoView topOffset={topOffset}>
                    <TopicsBannerIconSVG />
                    <TitleText numberOfLines={2}>{reelay?.topicTitle}</TitleText>
                </StoryHeaderInfoView>
            );    
        } else {
            return (
                <StoryHeaderInfoView topOffset={topOffset}>
                    <ReviewIconSVG />
                    <TitleText numberOfLines={2}>{reelay.title.display}</TitleText>
                </StoryHeaderInfoView>
            );    
        }
    }

    const StoryVideo = () => {
        const storyVideoStyle = {
            borderRadius: 16,
            top: ((backplateLayoutHeight - videoLayoutHeight) / 2),
            left: (backplateLayoutWidth - videoLayoutWidth) / 2,
            height: videoLayoutHeight, 
            width: videoLayoutWidth,
            position: 'absolute',
        }
        return (
            <StoryBackplateView height={backplateLayoutHeight} width={backplateLayoutWidth}>
            <Video
                isLooping={true}
                isMuted={false}
                resizeMode='cover'
                shouldPlay={true}
                source={{ uri: reelay?.content?.videoURI }}
                style={storyVideoStyle}
                useNativeControls={false}
                volume={1.0}    
            />

            </StoryBackplateView>
        );
    }

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });

    useEffect(() => {
        // if (capturedBackplateURI && capturedOverlayURI) {
            // console.log('sharing to insta starting...');
        //     shareToInstagram();
        // }
        const captureRefInterval = setInterval(() => {
            if (capturedBackplateURI.current && 
                capturedOverlayURI.current && 
                localReelayVideoURI.current
            ) {
                console.log('sharing to insta starting...');
                clearInterval(captureRefInterval);
                shareToInstagram();
            }
        }, 250);
        downloadReelayVideo();
        return () => clearInterval(captureRefInterval);
    }, []);

    return (
        <ScreenView>
            <LoadingView>
                <ActivityIndicator />
            </LoadingView>
            <StoryBackplate />
            <StoryVideo />
            <StoryVideoOverlay />
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
