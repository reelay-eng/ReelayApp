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
import { logAmplitudeEventProd } from '../utils/EventLogger';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';
import { useDispatch, useSelector } from 'react-redux';
import { showErrorToast, showMessageToast } from '../utils/toasts';
import { deleteClub } from '../../api/ClubsApi';

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
    border-bottom-color: #2D2D2D;
    border-bottom-width: 1px;
    height: 24px;
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
    text-align: center;
`

export default DeleteClubDrawer = ({ club, navigation, drawerVisible, setDrawerVisible }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();
    const closeDrawer = () => setDrawerVisible(false);
    const confirmDeleteText = useRef('');
    const [deleting, setDeleting] = useState(false);
    const myClubs = useSelector(state => state.myClubs);

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
                <PromptText>{`Are you sure you want to delete ${club.name} for everyone? Type \'delete\' below to confirm.`}</PromptText>
            </React.Fragment>
        );
    }

    const ConfirmDeleteButton = () => {
        const onConfirmDelete = async () => {
            try {
                if (confirmDeleteText.current !== 'delete') {
                    showErrorToast('Ruh roh! Confirmation text incorrect');
                    return;
                }
                setDeleting(true);
                const deleteClubResult = await deleteClub({
                    clubID: club.id,
                    reqUserSub: reelayDBUser?.sub,
                });
                console.log(deleteClubResult);

                const nextMyClubs = myClubs.filter(nextClub => nextClub.id !== club.id);
                dispatch({ type: 'setMyClubs', payload: nextMyClubs });
                setDeleting(false);
                navigation.popToTop();
                // todo: notify users
                showMessageToast(`You\'ve deleted the club ${club.name}`);
                return deleteClubResult;
            } catch (error) {
                console.log(error);
                showErrorToast('Ruh roh! Could not delete club. Try again?');
                setDeleting(false);
            }
        }
        return (
            <ConfirmDeleteButtonContainer onPress={onConfirmDelete}>
                { deleting && <ActivityIndicator /> }
                { !deleting && (
                    <React.Fragment>
                        <Icon type='ionicon' name='trash' size={16} color='white' />
                        <ConfirmDeleteButtonText>{'Delete club for everyone'}</ConfirmDeleteButtonText>                    
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
                        placeholder={"type \'delete\'"}
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