import React, { useContext, useState } from "react";
import { Dimensions, View, Keyboard, Pressable, TouchableOpacity } from "react-native";
import { Button } from '../global/Buttons';

// Context
import { AuthContext } from '../../context/AuthContext';

// Styling
import styled from "styled-components/native";
import * as ReelayText from "../global/Text";
import { HeaderWithBackButton } from "../global/Headers";
import ReelayColors from '../../constants/ReelayColors';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { showErrorToast, showMessageToast } from "../utils/toasts";
import ProfilePicture from "../global/ProfilePicture";

const { width } = Dimensions.get('window');

const AlignmentContainer = styled(View)`
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
`
const DeleteInfoText = styled(ReelayText.Body2)`
    color: white;
    margin-left: 10px;
    text-align: left;
`
const DeleteInfoContainer = styled(View)`
    align-items: flex-start;
    width: 90%;
`
const ButtonContainer = styled(View)`
    width: 90%;
    height: 45px;
    margin: 6px;
`
const BottomButtonsContainer = styled(View)`
    width: 100%;
    position: absolute;
    bottom: 80px;
    flex-direction: column;
    align-items: center;
`

export default DeleteAccount = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();
    const ViewContainer = styled(View)`
        width: 100%;
        height: 100%;
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
    `

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    })

    return (
        <ViewContainer>
            <HeaderWithBackButton navigation={navigation} text="Delete Account"/>
            <DeleteAccountWrapper 
                navigation={navigation} 
                reelayDBUser={reelayDBUser} 
            />
        </ViewContainer>
    )
}

const DeleteAccountWrapper = ({ navigation, reelayDBUser }) => {
    const DeleteAccountContainer = styled(Pressable)`
        width: 90%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    `
    const Divider = styled(View)`
        border-bottom-width: 1px;
        border-bottom-color: #2e2e2e;
        border-style: solid;
        height: 1px;
        opacity: 0.7;
        width: 98%;
        margin-bottom: 15px;
    `

    const [deletingAccount, setDeletingAccount] = useState(false);

    const deleteAccount = async () => {
        setDeletingAccount(true);
        // delete account
        // reroute to log in screen
        // send toast message
        showMessageToast("Account successfully deleted!")
        setDeletingAccount(false);
        return true;
    }

    const cancelOnPress = () => {
        navigation.pop();
    }

    return (
        <DeleteAccountContainer onPress={Keyboard.dismiss}>
            <Divider />
            <AlignmentContainer>
                <ProfilePicWithInfo user={reelayDBUser}/>
            </AlignmentContainer>
            <BottomButtonsContainer>
                <DeleteButton deleteAccount={deleteAccount} deletingAccount={deletingAccount} />
                <CancelButton cancelOnPress={cancelOnPress} />
            </BottomButtonsContainer>
        </DeleteAccountContainer>
    )
}


const ProfilePicWithInfo = ({user}) => {
    const ProfilePictureContainer = styled(View)`
        margin-bottom: 50px;
    `
    const SectionTitleContainer = styled(View)`
        align-self: center;
        margin: 15px;
    `;
    const SectionTitleText = styled(ReelayText.Subtitle1Emphasized)`
        align-self: center;
        color: white;
    `;

	return (
        <>
            <SectionTitleContainer>
                <SectionTitleText>{user.username}</SectionTitleText>
            </SectionTitleContainer>

            <ProfilePictureContainer>
                <ProfilePicture border user={user} size={120}/>
            </ProfilePictureContainer>

            <DeleteInfoContainer>
                <DeleteInfoText>
                    {"- This action is irreversible!"}
                </DeleteInfoText>
                <DeleteInfoText>
                    {"- Include something about what would happen to posts if delete"}
                </DeleteInfoText>
            </DeleteInfoContainer>
        </>
  );
};

const DeleteButton = ({deleteAccount, deletingAccount}) => {
    // popup modal

    const deleteOnPress = () => {
        console.log("want to delete")
    }

    return (
        <ButtonContainer>
            <Button
                text={"Delete"}
                onPress={deleteOnPress}
                backgroundColor={ReelayColors.reelayRed}
                fontColor="white"
                borderRadius="26px"
            />
        </ButtonContainer>
    )
}

const CancelButton = ({cancelOnPress}) => {
    return (
        <ButtonContainer>
            <Button
                text={"Cancel"}
                onPress={cancelOnPress}
                backgroundColor="white"
                fontColor={ReelayColors.reelayBlack}
                borderRadius="26px"
            />
        </ButtonContainer>
    )
}
