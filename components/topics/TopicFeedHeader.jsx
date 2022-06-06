import React from "react";
import { Easing, Pressable, TouchableOpacity, View } from "react-native";
import * as ReelayText from '../global/Text';
import BackButton from "../utils/BackButton";
import { LinearGradient } from "expo-linear-gradient";
import TextTicker from 'react-native-text-ticker';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faForwardStep, faBackwardStep } from "@fortawesome/free-solid-svg-icons";

const BackButtonContainer = styled(View)`
    position: absolute;
    top: ${props => props.headerHeight - 70}px;
    z-index: 3;
`
const HeaderBackground = styled(View)`
    background-color: rgba(0,0,0,0.2);
    justify-content: flex-end;
    height: ${(props) => props.height}px;
    position: absolute;
    width: 100%;
`
const PositionRow = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    top: 8px;
    padding: 4px;
    width: 100%;
    z-index: 2;
`
const DisabledText = styled(ReelayText.Subtitle2)`
    color: gray;
`
const PositionText = styled(ReelayText.Subtitle2)`
    color: white;
`
const TopicGradient = styled(LinearGradient)`
    opacity: 0.5;
    height: 100%;
    width: 100%;
    position: absolute;
`
const TopicTitleRow = styled(View)`
    align-items: center;
    flex-direction: row;
    padding: 4px;
    width: 100%;
`
const TitleTicker = styled(TextTicker)`
    color: white;
    display: flex;
    font-family: Outfit-Regular;
	font-size: 16px;
	font-style: normal;
	line-height: 20px;
	letter-spacing: 0.15px;
	text-align: left;
`
const ForwardBackButton = styled(TouchableOpacity)`
    align-items: center;
    border-color: ${props => props.disabled ? 'gray' : 'white'};
    border-radius: 80px;
    border-width: 1px;
    justify-content: center;
    margin-left: 12px;
    margin-right: 12px;
    padding: 4px;
`

export default TopicFeedHeader = ({ navigation, position, onTappedOldest, onTappedNewest, topic }) => {
    const headerTopOffset = useSafeAreaInsets().top;
    const headerHeight = headerTopOffset + 56;
    const positionText = `${position + 1}/${topic.reelays.length}`;
    const scrollDuration = topic.title.length * 180;
    const atOldestReelay = (position === 0);
    const atNewestReelay = (position === topic?.reelays?.length - 1);

    return (
        <React.Fragment>
            <HeaderBackground height={headerHeight}>
                <TopicGradient colors={["#252527", "#19242E"]} />
                <PositionRow>
                    <ForwardBackButton onPress={onTappedOldest} disabled={atOldestReelay}>
                        <FontAwesomeIcon icon={ faBackwardStep } size={18} color={atOldestReelay ? 'gray' : 'white'} />
                    </ForwardBackButton>
                    <PositionText>{positionText}</PositionText>
                    <ForwardBackButton onPress={onTappedNewest} disabled={atNewestReelay}>
                        <FontAwesomeIcon icon={ faForwardStep } size={18} color={atNewestReelay ? 'gray' : 'white'} />
                    </ForwardBackButton>
                </PositionRow>
                <TopicTitleRow>
                    <TitleTicker 
                        animationType={'scroll'} 
                        bounce={false} 
                        duration={scrollDuration} 
                        easing={Easing.linear} 
                        loop 
                        marqueeDelay={1000} 
                        repeatSpacer={25}
                    >
                        {topic.title}
                    </TitleTicker>
                </TopicTitleRow>
                <BackButtonContainer headerHeight={headerHeight}>
                    <BackButton navigation={navigation} />
                </BackButtonContainer>
            </HeaderBackground>
        </React.Fragment>
    );
}