import React, { useContext, useEffect, useRef, useState } from 'react';
import { 
    ActivityIndicator,
    Dimensions,
    Keyboard, 
    SafeAreaView, 
    TextInput, 
    TouchableOpacity,
    TouchableWithoutFeedback, 
    View,
} from 'react-native';
import styled from 'styled-components/native';

import { AuthContext } from '../../context/AuthContext';
import BackButton from '../../components/utils/BackButton';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import Constants from 'expo-constants';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import EditClubPic from '../../components/clubs/EditClubPic';
import { manipulateAsync } from "expo-image-manipulator";
import { showErrorToast, showMessageToast } from '../../components/utils/toasts';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

import { Buffer } from "buffer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 } from 'uuid';
import { editClub } from '../../api/ClubsApi';

import ClubPicture from '../../components/global/ClubPicture';
import EditClubPictureDrawer from '../../components/clubs/EditClubPictureDrawer';

const { width } = Dimensions.get('window');
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

const ClubPictureContainer = styled(View)`
    align-items: center;
    justify-content: center;
`
const EditPictureText = styled(ReelayText.Body2)`
    color: ${ReelayColors.reelayBlue};
    padding-top: 16px;
`
const EditScreenContainer = styled(SafeAreaView)`
    background-color: black;
    justify-content: space-between;
    height: 100%;
    width: 100%;
`
const HeaderContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-left: 10px;
    margin-bottom: 16px;
`
const HeaderText = styled(ReelayText.H5Emphasized)`
    color: white;
    margin-left: 20px;
    margin-top: 4px;
`
const SaveButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${(props) => props.disabled 
        ? 'white' 
        : ReelayColors.reelayBlue
    };
    border-radius: 40px;
    justify-content: center;
    height: 40px;
    width: ${width - 56}px;
`
const TitleInputField = styled(TextInput)`
    border-color: white;
    border-radius: 4px;
    border-width: 1px;
    color: white;
    font-family: Outfit-Regular;
    font-size: 16px;
    font-style: normal;
    letter-spacing: 0.15px;
    margin-top: 6px;
    padding: 12px;
`
const DescriptionInputField = styled(TitleInputField)`
    height: 90px;
`
const SectionContainer = styled(View)`
    margin-left: 20px;
    margin-right: 20px;
    margin-top: 16px;
`
const SectionContainerBottom = styled(SectionContainer)`
    align-items: center;
    bottom: 20px;
`
const TitleText = styled(ReelayText.Subtitle2)`
    color: ${(props) => props.disabled ? 'black' : 'white'};
    font-size: 16px;
`
const TITLE_MIN_LENGTH = 6;
const TITLE_MAX_LENGTH = 25;
const DESCRIPTION_MAX_LENGTH = 75;

const S3_UPLOAD_BUCKET = Constants.manifest.extra.reelayS3UploadBucket;
const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;

export default function EditClubScreen({ navigation, route }) {
    const { reelayDBUser } = useContext(AuthContext);
    const { club } = route.params;
    const myClubs = useSelector(state => state.myClubs);
    const s3Client = useSelector(state => state.s3Client);
    const [editPicDrawerVisible, setEditPicDrawerVisible] = useState(false);
    const [publishing, setPublishing] = useState(false);

    const dispatch = useDispatch();
    const clubPicSourceRef = useRef(null);
    const descriptionFieldRef = useRef(null);
    const descriptionTextRef = useRef(club.description);
    const titleFieldRef = useRef(null);
    const titleTextRef = useRef(club.name);

    const changeDescriptionText = (text) => descriptionTextRef.current = text;
    const changeTitleText = (text) => titleTextRef.current = text;
    const focusDescription = () => descriptionFieldRef?.current && descriptionFieldRef.current.focus();
    const focusTitle = () => titleFieldRef?.current && titleFieldRef.current.focus();

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });

    const SaveButton = () => {
        const onPress = async () => {
            if (publishing) return;

            try {
                setPublishing(true);
                const editBody = {};
                if (titleTextRef.current !== club.name) {
                    editBody.name = titleTextRef.current;
                    club.name = titleTextRef.current;
                }
                if (descriptionTextRef.current !== club.description) {
                    editBody.description = descriptionTextRef.current;
                    club.description = descriptionTextRef.current;
                }

                // todo: not fully working yet
                dispatch({ type: 'setMyClubs', payload: myClubs });
                const editResult = await editClub({
                    clubID: club.id,
                    reqUserSub: reelayDBUser?.sub,
                    ...editBody,
                });
                setPublishing(false);
                console.log(editResult);
                navigation.popToTop();    
            } catch (error) {
                console.log(error);
                showErrorToast('Ruh roh! Couldn\'t save changes. Try again?');
                setPublishing(false);
            }
        };

        return (
            <SaveButtonContainer onPress={onPress}>
                { publishing && <ActivityIndicator/> }
                { !publishing && <TitleText>{'Save changes'}</TitleText> }
            </SaveButtonContainer>
        );
    }

    const DescriptionInput = () => {
        return (
            <SectionContainer>
                <TitleText>{'Description'}</TitleText>
                <TouchableWithoutFeedback onPress={focusDescription}>
                    <DescriptionInputField 
                        ref={descriptionFieldRef}
                        blurOnSubmit={true}
                        maxLength={DESCRIPTION_MAX_LENGTH}
                        multiline
                        numberOfLines={3}
                        defaultValue={descriptionTextRef.current}
                        placeholder={"Who's the club for?"}
                        placeholderTextColor={'rgba(255,255,255,0.6)'}
                        onChangeText={changeDescriptionText}
                        onPressOut={Keyboard.dismiss()}
                        returnKeyLabel="done"
                        returnKeyType="done"
                    />
                </TouchableWithoutFeedback>   
            </SectionContainer> 
        );
    }

    const Header = () => {
        return (
            <HeaderContainer>
                <BackButton navigation={navigation} />
                <HeaderText>{'Edit club info'}</HeaderText>
            </HeaderContainer>
        );
    }

    const TitleInput = () => {
        return (
            <SectionContainer>
                <TitleText>{'Title'}</TitleText>
                <TouchableWithoutFeedback onPress={focusTitle}>
                    <TitleInputField 
                        ref={titleFieldRef}
                        blurOnSubmit={true}
                        maxLength={TITLE_MAX_LENGTH}
                        multiline
                        numberOfLines={2}
                        defaultValue={titleTextRef.current}
                        placeholder={"Give this club a name"}
                        placeholderTextColor={'rgba(255,255,255,0.6)'}
                        onChangeText={changeTitleText}
                        onSubmitEditing={Keyboard.dismiss}
                        onPressOut={Keyboard.dismiss}
                        returnKeyLabel="done"
                        returnKeyType="done"
                    />
                </TouchableWithoutFeedback>   
            </SectionContainer> 
        );
    }

    const publishClub = async () => {
        try {
            setPublishing(true);
            const clubPostBody = {
                creatorName: reelayDBUser?.username,
                creatorSub: reelayDBUser?.sub,
                name: titleTextRef.current,
                description: descriptionTextRef.current,
                visibility: 'private',
            }
            const clubObj = await createClub(clubPostBody);
            // todo: handle bad upload
            const clubID = clubObj?.id;
            console.log('club object: ', clubObj);
            if (clubID && clubPicSourceRef?.current?.uri) {
                const uploadResult = await uploadClubPicToS3(clubID, clubPicSourceRef.current.uri);
                console.log('club pic upload result: ', uploadResult);
                // todo: handle failed upload
            }
            dispatch({ type: 'setMyClubs', payload: [clubObj, ...myClubs] });
            console.log(clubObj);
            setPublishing(false);
            return clubObj;
        } catch (error) {
            console.log(error);
            showErrorToast('Ruh roh! Could not create club. Please try again.');
            setPublishing(false);
            return null;
        }
    }

    const uploadClubPicToS3 = async (clubID, photoURI) => {
        const resizedPhoto = await resizeImage(photoURI);
		const resizedPhotoURI = resizedPhoto.base64;
		const photoBuffer = Buffer.from(resizedPhotoURI, "base64");
        const photoS3Key = `public/clubpic-${clubID}.jpg`;
		const uploadResult = await s3Client.send(
			new PutObjectCommand({
				Bucket: S3_UPLOAD_BUCKET,
				Key: photoS3Key,
				ContentType: "image/jpg",
				CacheControl: "no-cache",
				Body: photoBuffer,
			})
		);
        return uploadResult;
	};

    const resizeImage = async (photoURI) => {
		const photoHeight = 256;
		const compression = 1 // 0 is most compressed, 1 is not compressed
		const resizeResult = await manipulateAsync(
			photoURI,
			[{ resize: { height: photoHeight }}],
			{ compress: compression, base64: true }
		);
		return resizeResult;
	}

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <EditScreenContainer>
                <View>
                    <Header />
                    <ClubPictureContainer>
                        <ClubPicture club={club} size={120} />
                        <TouchableOpacity onPress={() => setEditPicDrawerVisible(true)}>
                            <EditPictureText>{'Change picture'}</EditPictureText>
                        </TouchableOpacity>
                    </ClubPictureContainer>
                    <TitleInput />
                    <DescriptionInput />
                </View>
                <SectionContainerBottom>
                    <SaveButton />
                </SectionContainerBottom>
                { editPicDrawerVisible && (
                    <EditClubPictureDrawer
                        clubID={club.id}
                        drawerVisible={editPicDrawerVisible}
                        setDrawerVisible={setEditPicDrawerVisible}
                    />
                )}
            </EditScreenContainer>
        </TouchableWithoutFeedback>
    );
};
