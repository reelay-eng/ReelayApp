import React, { useContext, useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import ConfirmRetakeDrawer from '../../components/create-reelay/ConfirmRetakeDrawer';  
import Constants from 'expo-constants';
import PreviewVideoPlayer from '../../components/create-reelay/PreviewVideoPlayer';

import { Pressable, View, Keyboard, KeyboardAvoidingView } from 'react-native';
import * as ReelayText from '../../components/global/Text';
import { Icon } from 'react-native-elements';

import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import DownloadButton from '../../components/create-reelay/DownloadButton';
import UploadDescriptionAndStarRating from '../../components/create-reelay/UploadDescriptionAndStarRating';
import { useFocusEffect } from '@react-navigation/native';

const UPLOAD_VISIBILITY = Constants.manifest.extra.uploadVisibility;

const UploadButtonPressable = styled(Pressable)`
    background-color: ${props => props.color}
    border-radius: 24px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 48px;
    width: 125px;
    bottom: 10px;
    right: 12px;
`
const UploadButtonText = styled(ReelayText.H6Emphasized)`
    color: white;
    font-size: 16px;
    text-align: center;
`
const UploadBottomArea = styled(Pressable)`
    justify-content: flex-end;
`
const UploadBottomBar = styled(View)`
    flex-direction: row;
    justify-content: space-between;
    margin-top: 24px;
    margin-bottom: 40px;
`
const UploadScreenContainer = styled(View)`
    height: 100%;
    width: 100%;
    background-color: black;
    justify-content: space-between;
`

export default ReelayUploadScreen = ({ navigation, route }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();
    const { titleObj, videoURI, venue } = route.params;
    const [confirmRetakeDrawerVisible, setConfirmRetakeDrawerVisible] = useState(false);

    const descriptionRef = useRef('');
    const starCountRef = useRef(0);

    const topicID = route.params?.topicID;
    const globalTopics = useSelector(state => state.globalTopics);
    const reelayTopic = topicID ? globalTopics.find(nextTopic => nextTopic.id === topicID) : null;

    const publishReelay = async () => {
        if (!videoURI) {
            console.log('No video to upload.');
            return;
        }

        try {
            // Adding the file extension directly to the key seems to trigger S3 getting the right content type,
            // not setting contentType as a parameter in the Storage.put call.
            const destination = (topicID) ? 'InTopic' : 'OnProfile';
            const starRating = starCountRef.current * 2;
            const uploadTimestamp = Date.now();
            const videoS3Key = `reelayvid-${reelayDBUser?.sub}-${uploadTimestamp}.mp4`;
            
            const reelayDBBody = {
                creatorSub: reelayDBUser?.sub,
                creatorName: reelayDBUser.username,
                datastoreSub: uuidv4(), 
                description: descriptionRef.current,
                isMovie: titleObj.isMovie,
                isSeries: titleObj.isSeries,
                postedAt: uploadTimestamp,
                starRating: Math.floor(starRating/2),
                starRatingAddHalf: (starRating%2===1) ? true : false,
                tmdbTitleID: titleObj.id,
                topicID: topicID ?? null,
                venue: venue,
                videoS3Key: videoS3Key,
                visibility: UPLOAD_VISIBILITY,
            }

            const uploadRequest = {
                destination,
                reelayDBBody, 
                reelayTopic,
                videoURI, 
                videoS3Key,             
            }

            console.log('upload request: ', uploadRequest);
            dispatch({ type: 'setUploadRequest', payload: uploadRequest });
            dispatch({ type: 'setUploadStage', payload: 'upload-ready' });

            navigation.popToTop();
            navigation.navigate('Global');

        } catch (error) {
            // todo: better error catching
            console.log('Error uploading file: ', error);
        }
    }

    const Header = () => {
        const HeaderContainer = styled(View)`
            padding: 20px;
            align-items: flex-start;
        `;
        const HeaderText = styled(ReelayText.H5Emphasized)`
            text-align: center;
            color: white;
            margin-top: 4px;
            width: 90%;
            margin-right: 18px;
        `;
        const BackButton = styled(Pressable)`
            margin-top: 40px;
            margin-right: 20px;
        `;
        return (
            <>
                <HeaderContainer>
                    <BackButton onPress={() => setConfirmRetakeDrawerVisible(true)}>
                        <Icon type="ionicon" name="arrow-back-outline" color="white" size={24} />
                    </BackButton>
                </HeaderContainer>
            </>
        );
    };

    const UploadButton = () => {
        return (
            <UploadButtonPressable onPress={publishReelay} color={ReelayColors.reelayBlue}>
                <UploadButtonText>{'Post'}</UploadButtonText>
            </UploadButtonPressable>
        );
    }

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });

    return (
        <UploadScreenContainer>
            <PreviewVideoPlayer title={titleObj} videoURI={videoURI} />
            <Header navigation={navigation} />
            <KeyboardAvoidingView behavior='position'>
                <UploadBottomArea onPress={Keyboard.dismiss}>
                    <UploadDescriptionAndStarRating 
                        starCountRef={starCountRef}
                        descriptionRef={descriptionRef}
                    />
                    {/* { showProgressBar && <UploadProgressBar /> } */}
                    <UploadBottomBar>
                        <DownloadButton titleObj={titleObj} videoURI={videoURI} />
                        <UploadButton />
                    </UploadBottomBar>
                </UploadBottomArea>
            </KeyboardAvoidingView>
            <ConfirmRetakeDrawer 
                navigation={navigation} titleObj={titleObj} 
                confirmRetakeDrawerVisible={confirmRetakeDrawerVisible}
                setConfirmRetakeDrawerVisible={setConfirmRetakeDrawerVisible}
                lastState={"Upload"}
            />
        </UploadScreenContainer>
    );
};
