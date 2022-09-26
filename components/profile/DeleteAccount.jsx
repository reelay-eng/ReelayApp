import React, { useContext, useState } from "react";
import { View, Keyboard, Pressable } from "react-native";
import { Button } from '../global/Buttons';

// Context
import { AuthContext } from '../../context/AuthContext';

// Styling
import styled from "styled-components/native";
import * as ReelayText from "../global/Text";
import { HeaderWithBackButton } from "../global/Headers";
import ReelayColors from '../../constants/ReelayColors';
import { useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import DeleteAccountDrawer from "./DeleteAccountDrawer";
import ProfilePicture from "../global/ProfilePicture";

const AlignmentContainer = styled(View)`
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
`
const DeleteInfoText = styled(ReelayText.H6)`
    color: white;
    margin-left: 10px;
    margin-bottom: 10px;
    font-size: 16px;
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
    const [deleteAccountDrawerVisible, setDeleteAccountDrawerVisible] = useState(false);

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
            <HeaderWithBackButton navigation={navigation} text="delete account"/>
            <DeleteAccountWrapper 
                navigation={navigation} 
                reelayDBUser={reelayDBUser} 
                setDeleteAccountDrawerVisible={setDeleteAccountDrawerVisible}
            />
            {deleteAccountDrawerVisible && (
                <DeleteAccountDrawer 
                    drawerVisible={deleteAccountDrawerVisible}
                    setDrawerVisible={setDeleteAccountDrawerVisible}
                />
            )
            }
        </ViewContainer>
    )
}

const DeleteAccountWrapper = ({ navigation, reelayDBUser, setDeleteAccountDrawerVisible }) => {
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
                <DeleteButton setDeleteAccountDrawerVisible={setDeleteAccountDrawerVisible} />
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
        font-size: 20px;
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
                    {"Careful! This action is irreversible."}
                </DeleteInfoText>
                <DeleteInfoText>
                    {"All your reelays, comments, likes, follows, and other personal information will be permanently deleted from our records."}
                </DeleteInfoText>
                <DeleteInfoText>
                    {"Posts by others in your clubs and topics will not be deleted."}
                </DeleteInfoText>
                <DeleteInfoText>
                    {"You will be missed, but safely forgotten."}
                </DeleteInfoText>
            </DeleteInfoContainer>
        </>
  );
};

const DeleteButton = ({ setDeleteAccountDrawerVisible }) => {
    const deleteOnPress = () => {
        setDeleteAccountDrawerVisible(true);
    }

    return (
        <ButtonContainer>
            <Button
                text={"Continue"}
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
