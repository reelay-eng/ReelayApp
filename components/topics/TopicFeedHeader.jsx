import React from "react";
import { Easing, View } from "react-native";
import * as ReelayText from '../global/Text';
import BackButton from "../utils/BackButton";
import { LinearGradient } from "expo-linear-gradient";
import TextTicker from 'react-native-text-ticker';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HeaderBackground = styled(View)`
    background-color: rgba(0,0,0,0.2);
    justify-content: flex-end;
    height: ${(props) => props.height}px;
    position: absolute;
    width: 100%;
`
const PositionRow = styled(View)`
    align-items: center;
    justify-content: center;
    margin-bottom: -36px;
    padding: 4px;
    width: 100%;
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
    top: 10px;
    width: 100%;
`
const TitleTicker = styled(TextTicker)`
    color: white;
    display: flex;
    margin-top: 4px;
    font-family: Outfit-Regular;
	font-size: 16px;
	font-style: normal;
	line-height: 20px;
	letter-spacing: 0.15px;
	text-align: left;
`

export default TopicFeedHeader = ({ navigation, position, topic }) => {
    const headerTopOffset = useSafeAreaInsets().top;
    const headerHeight = headerTopOffset + 40;
    const positionText = `${position + 1}/${topic.reelays.length}`;
    const scrollDuration = topic.title.length * 180;

    return (
        <React.Fragment>
            <HeaderBackground height={headerHeight}>
                <TopicGradient colors={["#252527", "#19242E"]} />
                <PositionRow>
                    <PositionText>{positionText}</PositionText>
                </PositionRow>
                <TopicTitleRow>
                    <BackButton navigation={navigation} />
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
            </HeaderBackground>
        </React.Fragment>
    );
}