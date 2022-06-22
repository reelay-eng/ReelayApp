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
import { Icon } from 'react-native-elements';
import styled from 'styled-components/native';

import { AuthContext } from '../../context/AuthContext';
import BackButton from '../../components/utils/BackButton';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import Constants from 'expo-constants';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import ChooseClubPicture from '../../components/clubs/ChooseClubPicture';
import { manipulateAsync } from "expo-image-manipulator";
import { showErrorToast, showMessageToast } from '../../components/utils/toasts';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

import { Buffer } from "buffer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createClub } from '../../api/ClubsApi';

const { width } = Dimensions.get('window');

const CreateClubButtonContainer = styled(TouchableOpacity)`
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
const CreateScreenContainer = styled(SafeAreaView)`
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
const PrivacyIconContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    position: absolute;
    right: 20px;
`
const PrivacyText = styled(ReelayText.Subtitle2)`
    color: white;
    font-size: 16px;
    margin-right: 4px;
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
const TitleText = styled(ReelayText.Subtitle2)`
    color: ${(props) => props.disabled ? 'black' : 'white'};
    font-size: 16px;
`
const DescriptionInputField = styled(TitleInputField)`
    height: 90px;
`
const TITLE_MIN_LENGTH = 6;
const TITLE_MAX_LENGTH = 25;
const DESCRIPTION_MAX_LENGTH = 75;

const S3_UPLOAD_BUCKET = Constants.manifest.extra.reelayS3UploadBucket;
const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;

export default function CreateClubScreen({ navigation, route }) {
    const { reelayDBUser } = useContext(AuthContext);
    const authSession = useSelector(state => state.authSession);
    const myClubs = useSelector(state => state.myClubs);
    const s3Client = useSelector(state => state.s3Client);
    const [publishing, setPublishing] = useState(false);

    const dispatch = useDispatch();
    const clubPicSourceRef = useRef(null);
    const descriptionFieldRef = useRef(null);
    const descriptionTextRef = useRef('');
    const titleFieldRef = useRef(null);
    const titleTextRef = useRef('');

    const changeDescriptionText = (text) => descriptionTextRef.current = text;
    const changeTitleText = (text) => titleTextRef.current = text;
    const focusDescription = () => descriptionFieldRef?.current && descriptionFieldRef.current.focus();
    const focusTitle = () => titleFieldRef?.current && titleFieldRef.current.focus();

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });

    const CreateClubButton = () => {
        const onPress = async () => {
            if (publishing) return;
            const club = await publishClub();
            if (club && !club?.error) {
                logAmplitudeEventProd('clubCreated', {
                    creatorName: reelayDBUser?.username,
                    clubName: titleTextRef.current,
                    pictureAdded: !!clubPicSourceRef.current,
                });
                console.log('new club obj: ', club);
                // advance to invite screen
                navigation.popToTop();
                navigation.push('ClubActivityScreen', { club, promptToInvite: true });
            } else {
                console.log('could not create club obj');
            }
        };

        return (
            <CreateClubButtonContainer onPress={onPress}>
                { publishing && <ActivityIndicator/> }
                { !publishing && <TitleText>{'Create club'}</TitleText> }
            </CreateClubButtonContainer>
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
                <HeaderText>{'Create a club'}</HeaderText>
                <PrivacyIconContainer>
                    <PrivacyText>{'Private'}</PrivacyText>
                    <Icon type='ionicon' name='lock-closed' color='white' size={20} />
                </PrivacyIconContainer>
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
                authSession,
                creatorName: reelayDBUser?.username,
                creatorSub: reelayDBUser?.sub,
                name: titleTextRef.current,
                description: descriptionTextRef.current,
                visibility: 'private',
            }
            const createClubResult = await createClub(clubPostBody);
            if (!createClubResult || createClubResult.error) {
                showErrorToast('Ruh roh! Could not create club. Try again?');
                return { error: 'Could not create club' };
            }
            const { club } = createClubResult;
            const clubID = club?.id;
            club.members = [];
            club.titles = [];
            club.topics = [];

            // todo: handle bad upload
            if (clubID && clubPicSourceRef?.current?.uri) {
                const uploadResult = await uploadClubPicToS3(clubID, clubPicSourceRef.current.uri);
                console.log('club pic upload result: ', uploadResult);
                // todo: handle failed upload
            }
            dispatch({ type: 'setMyClubs', payload: [club, ...myClubs] });
            console.log(club);
            setPublishing(false);
            return club;
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
        <CreateScreenContainer>
            <View>
                <Header />
                <ChooseClubPicture clubPicSourceRef={clubPicSourceRef} />
                <TitleInput />
                <DescriptionInput />
            </View>
            <SectionContainerBottom>
                <CreateClubButton />
            </SectionContainerBottom>
        </CreateScreenContainer>
        </TouchableWithoutFeedback>
    );
};