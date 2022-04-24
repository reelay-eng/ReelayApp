import React, { Fragment, useContext, useEffect } from 'react';
import { Dimensions, Image, Modal, Pressable, SafeAreaView, View } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import DogWithGlasses from '../../assets/images/dog-with-glasses.png';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';
import ReelayColors from '../../constants/ReelayColors';

import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { Icon } from 'react-native-elements';

export default TopicAddFirstReelayDrawer = ({ navigation, drawerVisible, setDrawerVisible, publishedTopic }) => {

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
            <Modal animationType="slide" transparent={true} visible={drawerVisible}>
                <DrawerContainer>
                    <TopicAddFirstReelay navigation={navigation} setDrawerVisible={setDrawerVisible} />
                </DrawerContainer>
            </Modal>
        </ModalContainer>
    );
}

const TopicAddFirstReelay = ({ navigation, setDrawerVisible }) => {
    const { reelayDBUser } = useContext(AuthContext);

    const dispatch = useDispatch();
    const goBack = () => {
        setDrawerVisible(false);
        navigation.goBack();
    }

    const BottomContainer = styled(View)`
        align-items: center;
        width: 100%;
    `
    const CheckmarkContainer = styled(View)`
        align-items: center;
        justify-content: center;
        width: 100%;
    `
    const CreateReelayButton = styled(Pressable)`
        align-items: center;
        background-color: ${ReelayColors.reelayBlue};
        border-radius: 60px;
        height: 48px;
        flex-direction: row;
        justify-content: center;
        margin-bottom: 10px;
        width: 90%;
    `
    const CreateReelayText = styled(ReelayText.CaptionEmphasized)`
        color: white;
        margin-left: 4px;
        text-align: center;
    `
    const DogWithGlassesImage = styled(Image)`
        height: 100px;
        width: 100px;
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
        width: 90%;
    `
    const HeaderText = styled(ReelayText.H6Emphasized)`
        color: white;
        text-align: center;
    `
    const AddFirstReelayContainer = styled(SafeAreaView)`
        align-items: center;
        justify-content: space-around;
        margin: 10px;
    `
    const KeepBrowsingButton = styled(Pressable)`
        align-items: center;
        background-color: white;
        border-radius: 60px;
        height: 48px;
        justify-content: center;
        width: 90%;
    `
    const KeepBrowsingText = styled(ReelayText.CaptionEmphasized)`
        color: black;
        text-align: center;
    `
    const TopContainer = styled(View)`
        align-items: center;
        justify-content: center;
        margin-top: 10px;
        width: 100%;
    `

    const showMeSignupIfGuest = () => {
		if (reelayDBUser?.username === 'be_our_guest') {
			dispatch({ type: 'setJustShowMeSignupVisible', payload: true })
			return true;
		}
		return false;
	}

	const advanceToCreateReelay = () => {
		if (showMeSignupIfGuest()) return;
        setDrawerVisible(false);
        navigation.goBack();
        navigation.navigate('SelectTitleScreen', { topic: publishedTopic });
        
		logAmplitudeEventProd('advanceToCreateReelay', {
			username: reelayDBUser?.username,
			source: 'createTopic',
		});
	}

    return (
        <Fragment>
            <AddFirstReelayContainer>
                <TopContainer>
                    <CheckmarkContainer>
                        <Icon type='ionicon' name='checkmark' color='white' size={40} />
                    </CheckmarkContainer>
                    <HeaderText>{'Topic created'}</HeaderText>
                    <ExplainText>
                        {'Start the conversation by adding a Reelay'}
                    </ExplainText>
                    <DogWithGlassesContainer>
                        <DogWithGlassesImage source={DogWithGlasses} />
                    </DogWithGlassesContainer>
                </TopContainer>
                <BottomContainer>
                    <CreateReelayButton onPress={advanceToCreateReelay}>
                        <Icon type='ionicon' name='add-circle-outline' color='white' size={20} />
                        <CreateReelayText>{'Create a Reelay'}</CreateReelayText>
                    </CreateReelayButton>
                    <KeepBrowsingButton onPress={goBack}>
                        <KeepBrowsingText>{'Not now'}</KeepBrowsingText>
                    </KeepBrowsingButton>
                </BottomContainer>
            </AddFirstReelayContainer>
        </Fragment>
    );
}