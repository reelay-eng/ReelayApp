import React, { useContext } from 'react';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import { ActionButton } from '../global/Buttons';
import { Icon } from 'react-native-elements';

import styled from 'styled-components';
import * as ReelayText from '../global/Text';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import HomeScreenCardStackImage from '../../assets/images/home/home-screen-cardstack.png';

import { getReelay, prepareReelay } from '../../api/ReelayDBApi';

const YouDontFollowContainer = styled.View`
    width: 100%;
    height: auto;
    margin-top: 4px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`
const YouDontFollowPosters= styled.Image`
    width: 162px;
    height: 156px;
    margin-bottom: -105px;
    margin-left: 15px;
    z-index: 2;
`
const YouDontFollowGradientContainer = styled.View`
    width: 90%;
    height: 273px;
    border-radius: 11px;
    display: flex;
    flex-direction: column;
    align-items: center;
`
const YouDontFollowGradientContentBox = styled.View`
    width: 100%;
    display: flex;
    align-items: center;
    margin-top: auto;
`
const YouDontFollowHeadline = styled(ReelayText.H5Bold)`
    color: white;
    text-align: center;
    margin-bottom: 5px;
`
const YouDontFollowBody = styled(ReelayText.Body1)`
    color: white;
    text-align: center;
    margin-bottom: 30px;
`
const YouDontFollowButtonBox = styled.View`
    width: 95%;
    height: 40px;
    margin-bottom: 15px;
`

export default EmptyWatchlistPrompt = ({ navigation }) => {
    const loadGlobalFeedWithPinnedWelcome = async () => {
        const welcomeReelaySub = Constants.manifest.extra.welcomeReelaySub;
        // the reelay was uploaded to dev visibility, not global
        const welcomeReelay = await getReelay(welcomeReelaySub, 'dev');
        const preparedReelay = await prepareReelay(welcomeReelay);
        navigation.push("FeedScreen", {
            initialRouteName: 'global',
            initialFeedPos: 0,
            pinnedReelay: preparedReelay,
        });
    }

    return (
        <YouDontFollowContainer>
            <YouDontFollowPosters source={HomeScreenCardStackImage}/>
            <YouDontFollowGradientContainer>
                <LinearGradient
                    colors={["#272525", "#19242E"]}
                    style={{
                        flex: 1,
                        opacity: 1,
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        borderRadius: 11,
                    }}
                /> 
                <YouDontFollowGradientContentBox>
                    <YouDontFollowHeadline>Find your crowd</YouDontFollowHeadline>
                    <YouDontFollowBody>Explore the global feed and find other reelayers to follow</YouDontFollowBody>
                    <YouDontFollowButtonBox>
                        <ActionButton
                            text="Take a quick tour"
                            onPress={loadGlobalFeedWithPinnedWelcome}
                            rightIcon={<Icon type='ionicon' name='play-circle' size={20} color='white' /> }
                        />
                    </YouDontFollowButtonBox>
                </YouDontFollowGradientContentBox>
            </YouDontFollowGradientContainer>
        </YouDontFollowContainer>
    )
}
