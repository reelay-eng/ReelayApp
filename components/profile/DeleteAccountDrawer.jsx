import React, { useContext, useRef, useState } from 'react';
import { 
    ActivityIndicator, 
    Dimensions, 
    Keyboard,
    KeyboardAvoidingView, 
    Modal, 
    Pressable, 
    TextInput,
    TouchableOpacity, 
    View,
} from 'react-native';
import { Icon } from 'react-native-elements';

import { AuthContext } from '../../context/AuthContext';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { useDispatch, useSelector } from 'react-redux';
import { Auth } from 'aws-amplify';
import { showErrorToast, showMessageToast, showSuccessToast } from '../utils/toasts';
import { deleteAccount } from '../../api/ReelayDBApi';

const { width } = Dimensions.get('window');

const Backdrop = styled(Pressable)`
    background-color: transparent;
    height: 100%;
    position: absolute;
    width: 100%;
`
const ConfirmDeleteButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayRed};
    border-radius: 8px;
    flex-direction: row;
    justify-content: center;
    height: 40px;
    width: ${width - 64}px;
`
const ConfirmDeleteButtonText = styled(ReelayText.Subtitle2)`
    color: white;
    margin-left: 4px;
`
const ConfirmTextInput = styled(TextInput)`
    color: white;
    font-family: Outfit-Regular;
    font-size: 16px;
    font-style: normal;
    letter-spacing: 0.15px;
    margin-left: 8px;
    padding: 4px;
    width: 100%;
`
const ConfirmTextInputContainer = styled(View)`
    background-color: #1a1a1a;
    border-color: white;
    border-radius: 8px;
    border-width: 1px;
    flex-direction: row;
    margin: 16px;
    padding: 5px;
    width: ${width - 64}px;
`
const DrawerContainer = styled(View)`
    align-items: center;
    background-color: #1a1a1a;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    margin-top: auto;
    max-height: 70%;
    padding-bottom: 80px;
    width: 100%;
`
const HeaderContainer = styled(View)`
    align-items: center;
    height: 16px;
    padding: 6px;
    padding: 6px;
    width: 100%;
`
const ModalContainer = styled(View)`
    position: absolute;
`
const PromptText = styled(ReelayText.Body2)`
    margin-top: 16px;
    margin-left: 32px;
    margin-right: 32px;
    color: white;
    text-align: left;
`

export default DeleteAccountDrawer = ({ navigation, drawerVisible, setDrawerVisible }) => {
    const { reelayDBUser, setReelayDBUserID } = useContext(AuthContext);

    const [deleting, setDeleting] = useState(false);
    const confirmDeleteText = useRef('');
    const closeDrawer = () => setDrawerVisible(false);
    const dispatch = useDispatch();
    const authSession = useSelector(state => state.authSession);

    const onChangeConfirmText = (text) => {
        confirmDeleteText.current = text;
    }

    const Header = () => {
        return (
            <HeaderContainer />
        );
    }

    const AreYouSurePrompt = () => {
        return (
            <React.Fragment>
                <PromptText>{`Are you sure you want to delete your account? It will disappear forever. Type \'${reelayDBUser.username}\' below to confirm.`}</PromptText>
            </React.Fragment>
        );
    }

    const ConfirmDeleteButton = () => {
        const onConfirmDelete = async () => {
            try {
                if (confirmDeleteText.current !== reelayDBUser.username) {
                    showErrorToast('Ruh roh! Confirmation text incorrect');
                    return;
                }
                setDeleting(true);

                const deleteAccountResult = await deleteAccount(reelayDBUser.sub, authSession);

                setDeleting(false);

                if (deleteAccountResult) {
                    dispatch({ type: 'setSignedIn', payload: false });
                    setReelayDBUserID(null);
                    const deleteResult = await Auth.deleteUser();
                    const signOutResult = await Auth.signOut();
                    dispatch({ type: 'clearAuthSession', payload: {} });

                    showSuccessToast(`You\'ve deleted your account`);
                    return deleteResult && signOutResult;
                }

                logAmplitudeEventProd('accountDeleted', {
                    userSub: reelayDBUser?.sub,
                    username: reelayDBUser?.username,
                });

                return deleteAccountResult;
            } catch (error) {
                const isNoCurrentUserError = error.toString().includes("No current user.");
                if (isNoCurrentUserError) {
                    showSuccessToast(`You\'ve deleted your account`);
                    logAmplitudeEventProd('accountDeleted', {
                        userSub: reelayDBUser?.sub,
                        username: reelayDBUser?.username,
                    });
                }
                else {
                    console.log("Account deleted error: ", error);
                    showErrorToast("Ruh roh! Couldn't delete your account. Try again?");
                    logAmplitudeEventProd('accountDeleted', {
                        error: error,
                        userSub: reelayDBUser?.sub,
                        username: reelayDBUser?.username,
                    });

                }
                
                setDeleting(false);
            }
        }
        return (
            <ConfirmDeleteButtonContainer onPress={onConfirmDelete}>
                { deleting && <ActivityIndicator /> }
                { !deleting && (
                    <React.Fragment>
                        <Icon type='ionicon' name='trash' size={16} color='white' />
                        <ConfirmDeleteButtonText>{'Delete Account'}</ConfirmDeleteButtonText>                    
                    </React.Fragment>
                )}
            </ConfirmDeleteButtonContainer>
        );
    }

    return (
        <ModalContainer>
            <Modal animationType='slide' transparent={true} visible={drawerVisible}>
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <Backdrop onPress={closeDrawer}/>
                <DrawerContainer>
                    <Header />
                    <AreYouSurePrompt />
                    <ConfirmTextInputContainer>
                    <ConfirmTextInput 
                        autoComplete='none'
                        autoCapitalize="none"
                        defaultValue={confirmDeleteText.current}
                        placeholder={`type \'${reelayDBUser.username}\'`}
                        placeholderTextColor={"gray"}
                        onChangeText={onChangeConfirmText}
                        onPressOut={Keyboard.dismiss()}
                        returnKeyLabel="return"
                        returnKeyType="default"                    
                    />    
                    </ConfirmTextInputContainer>
                    <ConfirmDeleteButton />
                </DrawerContainer>
                </KeyboardAvoidingView>
            </Modal>
        </ModalContainer>
    );
}