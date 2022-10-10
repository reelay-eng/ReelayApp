import React, { useContext, useEffect, useRef, useState } from 'react';
import { 
    ActivityIndicator,
    Dimensions,
    Keyboard, 
    KeyboardAvoidingView, 
    SafeAreaView, 
    TextInput, 
    TouchableOpacity,
    TouchableWithoutFeedback, 
    View,
} from 'react-native';
import styled from 'styled-components/native';

import { AuthContext } from '../../context/AuthContext';
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
import { createClub, inviteMemberToClub } from '../../api/ClubsApi';
import { notifyNewMemberOnClubInvite } from '../../api/ClubNotifications';
import { HeaderWithBackButton } from '../../components/global/Headers';
import { faEarthAmericas, faLock, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const CreateChatText = styled(ReelayText.CaptionEmphasized)`
    color: white;
`
const CreateClubButtonView = styled(TouchableOpacity)`
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
const CreateScreenView = styled(SafeAreaView)`
    background-color: black;
    display: flex;
    flex: 1;
    justify-content: space-between;
    width: 100%;
`
const FinishPromptText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 28px;
    line-height: 36px;
`
const HeaderView = styled(View)`
    margin-bottom: 16px;
`
const PublicOrPrivateRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    width: 50%;
`
const PublicOrPrivateText = styled(ReelayText.Body1)`
    color: white;
    margin-left: 10px;
`
const ReviewSelectionsRow = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 36px;
    width: 100%;
`
const SectionView = styled(View)`
    margin-left: 20px;
    margin-right: 20px;
    margin-top: 16px;
`
const SectionViewBottom = styled(SectionView)`
    align-items: center;
    bottom: 20px;
`
const TitleInputField = styled(TextInput)`
    background-color: #1a1a1a;
    border-radius: 32px;
    border-width: 1px;
    color: white;
    font-family: Outfit-Regular;
    font-size: 18x;
    font-style: normal;
    letter-spacing: 0.15px;
    margin-top: 6px;
    padding: 16px;
    padding-left: 20px;
    padding-right: 20px;
`
const TitleText = styled(ReelayText.Subtitle2)`
    color: ${(props) => props.disabled ? 'black' : 'white'};
    font-size: 16px;
`
const DescriptionInputField = styled(TitleInputField)`
`
const Spacer = styled(View)`
    height: 12px;
`
const SpacerBig = styled(View)`
    height: 48px;
`

const TITLE_MIN_LENGTH = 6;
const TITLE_MAX_LENGTH = 25;
const DESCRIPTION_MAX_LENGTH = 75;

const S3_UPLOAD_BUCKET = Constants.manifest.extra.reelayS3UploadBucket;

export default CreateClubPart3Screen = ({ navigation, route }) => {
    const { clubVisibility, followsToSend } = route.params;
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
    const topOffset = useSafeAreaInsets().top;

    const changeDescriptionText = (text) => descriptionTextRef.current = text;
    const changeTitleText = (text) => titleTextRef.current = text;

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });

    const CreateClubButton = () => {
        const onPress = async () => {
            if (publishing) return;

            if (titleTextRef.current.length < TITLE_MIN_LENGTH) {
                titleFieldRef.current.focus();
                return;
            }

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
                navigation.push('ClubActivityScreen', { club, promptToInvite: false });
            } else {
                console.log('could not create club obj');
            }
        };

        return (
            <CreateClubButtonView onPress={onPress}>
                { publishing && <ActivityIndicator/> }
                { !publishing && <CreateChatText>{'Start the chat'}</CreateChatText> }
            </CreateClubButtonView>
        );
    }

    const DescriptionInput = () => {
        return (
            <SectionView>
                <DescriptionInputField 
                    ref={descriptionFieldRef}
                    blurOnSubmit={true}
                    maxLength={DESCRIPTION_MAX_LENGTH}
                    multiline
                    numberOfLines={3}
                    defaultValue={descriptionTextRef.current}
                    placeholder={"Description (optional)"}
                    placeholderTextColor={'rgba(255,255,255,0.6)'}
                    onChangeText={changeDescriptionText}
                    returnKeyLabel="done"
                    returnKeyType="done"
                />
            </SectionView> 
        );
    }

    const FinishPrompt = () => {
        return (
            <SectionView>
                <Spacer />
                <FinishPromptText>{'Finish setup'}</FinishPromptText>
            </SectionView>
        );
    }

    const Header = () => {
        return (
            <HeaderView>
                <HeaderWithBackButton navigation={navigation} text={'new chat'} />
            </HeaderView>
        );
    }

    const PublicOrPrivateRow = ({ isPrivate }) => {
        const headingText = (isPrivate) ? 'Private Chat' : 'Public Chat';
        const renderSettingIcon = () => (isPrivate)
            ? <FontAwesomeIcon icon={faLock} color='white' size={27} />
            : <FontAwesomeIcon icon={faEarthAmericas} color='white' size={27} />

        return (
            <PublicOrPrivateRowView>
                { renderSettingIcon() }
                <PublicOrPrivateText>{headingText}</PublicOrPrivateText>
            </PublicOrPrivateRowView>
        );
    }

    const ReviewInvitesRow = () => {
        const inviteCount = followsToSend?.length;
        if (inviteCount === 0) return <View />;

        const invitesPlural = (inviteCount > 1) ? 's' : '';
        const invitesText = `${inviteCount} invite${invitesPlural}`;
        
        return (
            <PublicOrPrivateRowView>
                <FontAwesomeIcon icon={faUserPlus} color='white' size={27} />
                <PublicOrPrivateText>{invitesText}</PublicOrPrivateText>
            </PublicOrPrivateRowView>
        );
    }

    const TitleInput = () => {
        return (
            <SectionView>
                <TitleInputField 
                    ref={titleFieldRef}
                    blurOnSubmit={true}
                    maxLength={TITLE_MAX_LENGTH}
                    multiline
                    numberOfLines={2}
                    defaultValue={titleTextRef.current}
                    placeholder={"Title (required)"}
                    placeholderTextColor={'rgba(255,255,255,0.6)'}
                    onChangeText={changeTitleText}
                    returnKeyLabel="done"
                    returnKeyType="done"
                />
            </SectionView> 
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
                visibility: clubVisibility,
            }
            const createClubResult = await createClub(clubPostBody);
            if (!createClubResult || createClubResult.error) {
                showErrorToast('Ruh roh! Could not create chat. Try again?');
                return { error: 'Could not create chat' };
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
            await sendAllInvites(club);
            setPublishing(false);
            return club;
        } catch (error) {
            console.log(error);
            showErrorToast('Ruh roh! Could not create chat. Please try again.');
            setPublishing(false);
            return null;
        }
    }

    const sendAllInvites = async (club) => {
        try {
            const sendInvite = async (followObj) => {
                const inviteMemberResult = await inviteMemberToClub({
                    authSession,
                    clubID: club.id,
                    userSub: followObj.followSub,
                    username: followObj.followName,
                    role: 'member',
                    invitedBySub: reelayDBUser?.sub,
                    invitedByUsername: reelayDBUser?.username,
                    clubLinkID: null,
                });
        
                notifyNewMemberOnClubInvite({
                    club,
                    invitedByUser: reelayDBUser,
                    newMember: {
                        sub: followObj.followSub,
                        username: followObj.followName,
                    },
                });
        
                logAmplitudeEventProd('inviteMemberToClub', {
                    invitedByUsername: reelayDBUser?.username,
                    invitedByUserSub: reelayDBUser?.sub,
                    newMemberUsername: followObj?.followName,
                    newMemberUserSub: followObj?.followSub,
                    club: club?.name,
                    clubID: club?.id,
                });
                
                return inviteMemberResult;
            }        

            const inviteResults = await Promise.all(followsToSend.map(sendInvite));
            const peopleWord = (inviteResults.length > 1) ? 'people' : 'person';
            showMessageToast(`Invited ${inviteResults.length} ${peopleWord} to ${club.name}`);
        } catch (error) {
            console.log(error);
            showErrorToast('Ruh roh! Couldn\'t send invites. Try again?');
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

    useEffect(() => {
        if (titleFieldRef?.current) titleFieldRef.current.focus();
    }, []);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView behavior='padding' style={{ 
                top: topOffset, flex: 1, justifyContent: 'flex-end' 
            }}>
                <View>
                    <Header />
                        <FinishPrompt />
                        <SpacerBig />
                        <ChooseClubPicture clubPicSourceRef={clubPicSourceRef} />
                        <TitleInput />
                        <DescriptionInput />
                        <ReviewSelectionsRow>
                            <PublicOrPrivateRow isPrivate={clubVisibility === 'private'} />
                            <ReviewInvitesRow />
                        </ReviewSelectionsRow>
                </View>
                <View style={{ flex: 1 }} />
                <SectionViewBottom>
                    <CreateClubButton />
                </SectionViewBottom>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};
