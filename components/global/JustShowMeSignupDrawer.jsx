import React, { Fragment, useContext, useEffect } from 'react';
import { Image, Modal, Pressable, SafeAreaView, View } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import DogWithGlasses from '../../assets/images/dog-with-glasses.png';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';
import ReelayColors from '../../constants/ReelayColors';

import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';

export default JustShowMeSignupDrawer = ({ navigation }) => {
    const justShowMeSignupVisible = useSelector(state => state.justShowMeSignupVisible);

    const DrawerContainer = styled(View)`
        background-color: #1a1a1a;
        border-top-left-radius: 20px;
        border-top-right-radius: 20px;
        margin-top: auto;
        width: 100%;
    `
    const ModalContainer = styled(View)`
        position: absolute;
    `
    return (
        <ModalContainer>
            <Modal animationType="slide" transparent={true} visible={justShowMeSignupVisible}>
                <DrawerContainer>
                    <JustShowMeSignup navigation={navigation} />
                </DrawerContainer>
            </Modal>
        </ModalContainer>
    );
}

const JustShowMeSignup = () => {
    const { 
        reelayDBUser,
        setReelayDBUserID, 
    } = useContext(AuthContext);

    const dispatch = useDispatch();
    const closeDrawer = () => dispatch({ type: 'setJustShowMeSignupVisible', payload: false });

    const BottomContainer = styled(View)`
        align-items: center;
        width: 100%;
    `
    const DogWithGlassesImage = styled(Image)`
        height: 200px;
        width: 200px;
    `
    const DogWithGlassesContainer = styled(View)`
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
        width: 100%;
    `
    const ExplainText = styled(ReelayText.Body2Emphasized)`
        color: white;
        margin-bottom: 20px;
        text-align: center;
        width: 75%;
    `
    const HeaderText = styled(ReelayText.H5)`
        color: white;
        text-align: center;
    `
    const JustShowMeContainer = styled(SafeAreaView)`
        align-items: center;
        justify-content: space-around;
        height: 100%;
        margin: 10px;
    `
    const KeepBrowsingButton = styled(Pressable)`
        align-items: center;
        background-color: white;
        border-radius: 60px;
        height: 48px;
        justify-content: center;
        margin-bottom: 10px;
        width: 90%;
    `
    const KeepBrowsingText = styled(ReelayText.CaptionEmphasized)`
        color: black;
        text-align: center;
    `
    const SignUpButton = styled(Pressable)`
        align-items: center;
        background-color: ${ReelayColors.reelayBlue};
        border-radius: 60px;
        height: 48px;
        justify-content: center;
        width: 90%;
    `
    const SignUpText = styled(ReelayText.CaptionEmphasized)`
        color: white;
        text-align: center;
    `
    const TopContainer = styled(View)`
        align-items: center;
        justify-content: center;
        width: 100%;
    `

    const goToSignUp = async () => {
        try {
            logAmplitudeEventProd('guestGoToSignUp', {
                username: reelayDBUser?.username,
                email: reelayDBUser?.email,
            });
    
            dispatch({ type: 'setJustShowMeSignupVisible', payload: false });
            dispatch({ type: 'setSignedIn', payload: false });
            setReelayDBUserID(null);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Fragment>
            <JustShowMeContainer>
                <TopContainer>
                    <HeaderText>{'Join Reelay'}</HeaderText>
                    <DogWithGlassesContainer>
                        <DogWithGlassesImage source={DogWithGlasses} />
                    </DogWithGlassesContainer>
                    <ExplainText>
                        {'For this feature to work, we need to sign you up. It takes seconds!'}
                    </ExplainText>
                </TopContainer>
                <BottomContainer>
                    <KeepBrowsingButton onPress={closeDrawer}>
                        <KeepBrowsingText>{'Keep browsing'}</KeepBrowsingText>
                    </KeepBrowsingButton>
                    <SignUpButton onPress={goToSignUp}>
                        <SignUpText>{'Sign up or log in'}</SignUpText>
                    </SignUpButton>
                </BottomContainer>
            </JustShowMeContainer>
        </Fragment>
    );
}