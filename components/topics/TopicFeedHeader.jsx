import React from "react";
import { Easing, TouchableOpacity, View } from "react-native";
import * as ReelayText from '../global/Text';
import BackButton from "../utils/BackButton";
import { LinearGradient } from "expo-linear-gradient";
import TextTicker from 'react-native-text-ticker';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BackButtonContainer = styled(View)`
    z-index: 3;
    margin-bottom: -12px;
`
const HeaderBackground = styled(View)`
    justify-content: flex-end;
    height: ${(props) => props.height}px;
    position: absolute;
    width: 100%;
`
const TopicGradient = styled(LinearGradient)`
    opacity: 0.5;
    height: 100%;
    width: 100%;
    position: absolute;
`
const TopicTitleRow = styled(View)`
    align-items: flex-end;
    flex-direction: row;
    padding-bottom: 4px;
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
    padding-bottom: 4px;
	text-align: center;
`

export default TopicFeedHeader = ({ navigation, topic }) => {
    const headerTopOffset = useSafeAreaInsets().top;
    const headerHeight = headerTopOffset + 24;
    const scrollDuration = topic.title.length * 180;

    return (
        <React.Fragment>
            <HeaderBackground height={headerHeight}>
                <TopicGradient colors={["#252527", "#19242E"]} />
                <TopicTitleRow>
                    <BackButtonContainer headerHeight={headerHeight}>
                        <BackButton navigation={navigation} />
                    </BackButtonContainer>
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