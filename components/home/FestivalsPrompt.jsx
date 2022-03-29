import React, { useContext } from 'react';
import { View } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';

import * as ReelayText from '../global/Text';
import { ActionButton, PassiveButton } from '../global/Buttons';
import { LinearGradient } from 'expo-linear-gradient';

import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUserFestivalPreference } from '../../api/ReelayDBApi';
import { useDispatch } from 'react-redux';

const FestivalsPromptContainer = styled.View`
    align-items: center;
    margin: 10px;
    flex-direction: column;
    justify-content: center;
    padding-left: 10px;
    padding-right: 10px;
`
const FestivalIconContainer = styled(View)`
    margin: 20px;
`
const Headline = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 20px;
    margin-bottom: 5px;
    text-align: center;
    padding-left: 10px;
    padding-right: 10px;
`
const PromptBody = styled(ReelayText.Body1)`
    color: white;
    margin-bottom: 30px;
    padding-left: 10px;
    padding-right: 10px;
    text-align: center;
`
const ButtonBox = styled.View`
    height: 40px;
    flex-direction: row;
    margin-bottom: 15px;
    padding-left: 10px;
    padding-right: 10px;
    width: 50%;
`
const ButtonBoxRow = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-around;
    width: 100%;
`

export default FestivalsPrompt = ({ navigation, setShowFestivalsPrompt }) => {
    return (
        <FestivalsPromptContainer>
            <PromptGradient /> 
            <FestivalIcon />
            <Headline>{'Are you into film festivals?'}</Headline>
            <PromptBody>{'Choose whether you want to see reelays from festivals on your home page. You can always change this later in Settings.'}</PromptBody>
            <PromptResponseBox setShowFestivalsPrompt={setShowFestivalsPrompt} />
        </FestivalsPromptContainer>
    )
}

const FestivalIcon = () => {
    return (
        <FestivalIconContainer>
            <Icon type='font-awesome' name='pagelines' size={40} color='white' />
        </FestivalIconContainer>
    );
}

const PromptGradient = () => {
    return (
        <LinearGradient
            colors={["#272525", "#19242E"]}
            style={{
                flex: 1,
                opacity: 1,
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: `11px`,
            }}
        /> 
    );
}

const PromptResponseBox = ({ setShowFestivalsPrompt }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();

    const optInToFestivals = async () => {
        if (reelayDBUser?.username === 'be_our_guest') {
            dispatch({ type: 'setJustShowMeSignupVisible', payload: true });
            return;
        }

        AsyncStorage.setItem('hasSetFestivalPreference', 'true');
        const dbResult = await updateUserFestivalPreference(reelayDBUser?.sub, 'true');
        console.log(dbResult);
        setShowFestivalsPrompt(false);
        dispatch({ type: 'setShowFestivals', payload: true });
    }

    const optOutOfFestivals = async () => {
        if (reelayDBUser?.username === 'be_our_guest') {
            dispatch({ type: 'setJustShowMeSignupVisible', payload: true });
            return;
        }

        AsyncStorage.setItem('hasSetFestivalPreference', 'false');
        const dbResult = await updateUserFestivalPreference(reelayDBUser?.sub, 'false');
        console.log(dbResult);
        setShowFestivalsPrompt(false);
        dispatch({ type: 'setShowFestivals', payload: true });
    }

    return (
        <ButtonBoxRow>
            <ButtonBox>
                <PassiveButton text="No" onPress={optOutOfFestivals} />
            </ButtonBox>
            <ButtonBox>
                <ActionButton text="Yes" onPress={optInToFestivals} />
            </ButtonBox>
        </ButtonBoxRow>
    );
}