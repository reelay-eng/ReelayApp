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
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { showErrorToast, showMessageToast } from '../../components/utils/toasts';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

import { editClub } from '../../api/ClubsApi';
import ClubPicture from '../../components/global/ClubPicture';
import DeleteClubDrawer from '../../components/clubs/DeleteClubDrawer';
import EditClubPictureDrawer from '../../components/clubs/EditClubPictureDrawer';
import { Icon } from 'react-native-elements';

const { width } = Dimensions.get('window');

const BackButtonContainer = styled(SafeAreaView)`
    left: 0px;
    position: absolute;
`
const ClubPictureContainer = styled(View)`
    align-items: center;
    justify-content: center;
`
const DeleteClubButtonContainer = styled(TouchableOpacity)`
    align-items: flex-end;
    flex-direction: row;
    height: 72px;
    justify-content: flex-end;
    position: absolute;
    right: 20px;
    padding-bottom: 12px;
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
const PicUploadingContainer = styled(View)`
    align-items: center;
    border-radius: 60px;
    height: 156px;
    justify-content: center;
    width: 156px;
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
const TopBarContainer = styled(View)`
    align-items: flex-end;
    flex-direction: row;
    height: 72px;
    justify-content: center;
    margin-bottom: 16px;
`
const TopBarText = styled(ReelayText.H5Emphasized)`
    color: white;
    margin-bottom: 10px;
`
const DescriptionInputField = styled(TitleInputField)`
    height: 90px;
`
const TITLE_MIN_LENGTH = 6;
const TITLE_MAX_LENGTH = 25;
const DESCRIPTION_MAX_LENGTH = 75;

export default function EditClubScreen({ navigation, route }) {
    const { reelayDBUser } = useContext(AuthContext);
    const { club } = route.params;
    const authSession = useSelector(state => state.authSession);
    const myClubs = useSelector(state => state.myClubs);

    const [deleteClubDrawerVisible, setDeleteClubDrawerVisible] = useState(false);
    const [editPicDrawerVisible, setEditPicDrawerVisible] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [uploadingPic, setUploadingPic] = useState(false);

    const dispatch = useDispatch();
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

    const DeleteClubButton = () => {
        const openConfirmDeleteDrawer = () => {
            setDeleteClubDrawerVisible(true);
        }
        return (
            <DeleteClubButtonContainer onPress={openConfirmDeleteDrawer}>
                <Icon type='ionicon' name='trash' color='white' size={24} />
            </DeleteClubButtonContainer>
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

    const EditableClubPic = () => {
        if (uploadingPic) {
            return (
                <ClubPictureContainer>
                    <PicUploadingContainer>
                        <ActivityIndicator />
                    </PicUploadingContainer>
                </ClubPictureContainer>
            );
        } else {
            return (
                <ClubPictureContainer>
                    <ClubPicture club={club} size={120} />
                    <TouchableOpacity onPress={() => setEditPicDrawerVisible(true)}>
                        <EditPictureText>{'Change picture'}</EditPictureText>
                    </TouchableOpacity>
                </ClubPictureContainer>
            )
        }
    }

    const Header = () => {
        return (
            <View>
                <TopBar />
                <EditableClubPic />
                <TitleInput />
                <DescriptionInput />
                <DeleteClubButton />
            </View>
        )
    }

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
                    authSession,
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

    const TopBar = () => {
        return (
            <TopBarContainer>
                <BackButtonContainer>
                    <BackButton navigation={navigation} />
                </BackButtonContainer>
                <TopBarText>{'Edit club info'}</TopBarText>
            </TopBarContainer>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <EditScreenContainer>
                <Header />
                <SectionContainerBottom>
                    <SaveButton />
                </SectionContainerBottom>
                { editPicDrawerVisible && (
                    <EditClubPictureDrawer
                        clubID={club.id}
                        drawerVisible={editPicDrawerVisible}
                        setDrawerVisible={setEditPicDrawerVisible}
                        setUploadingPic={setUploadingPic}
                    />
                )}
                { deleteClubDrawerVisible && (
                    <DeleteClubDrawer
                        club={club}
                        navigation={navigation}
                        drawerVisible={deleteClubDrawerVisible}
                        setDrawerVisible={setDeleteClubDrawerVisible}
                    />
                )}
            </EditScreenContainer>
        </TouchableWithoutFeedback>
    );
};
