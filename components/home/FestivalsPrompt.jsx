import React, { useContext } from 'react';
import { View } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';

import * as ReelayText from '../global/Text';
import { ActionButton, PassiveButton } from '../global/Buttons';
import { LinearGradient } from 'expo-linear-gradient';

import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';

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

export default FestivalsPrompt = ({ navigation }) => {
    return (
        <FestivalsPromptContainer>
            <PromptGradient /> 
            <FestivalIcon />
            <Headline>{'Are you into film festivals?'}</Headline>
            <PromptBody>{'Say Yes to see reelays from festivals on your home page. You can always change this later in Settings.'}</PromptBody>
            <PromptResponseBox />
        </FestivalsPromptContainer>
    )
}

const FestivalIcon = () => {
    return (
        <FestivalIconContainer>
            <Icon type='ionicon' name='flash' size={40} color='white' />
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

const PromptResponseBox = () => {
    const { reelayDBUser } = useContext(AuthContext);
    const { setJustShowMeSignupVisible } = useContext(FeedContext);

    const optInToFestivals = () => {
        if (reelayDBUser?.username === 'be_our_guest') {
            setJustShowMeSignupVisible(true);
            return;
        }
    }
    
    const optOutOfFestivals = () => {
        if (reelayDBUser?.username === 'be_our_guest') {
            setJustShowMeSignupVisible(true);
            return;
        }
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