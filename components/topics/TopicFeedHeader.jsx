import React from "react";
import { View } from "react-native";
import * as ReelayText from '../global/Text';
import BackButton from "../utils/BackButton";
import { LinearGradient } from "expo-linear-gradient";
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
const TopicTitleText = styled(ReelayText.H6Emphasized)`
    color: white;
    display: flex;
    margin-top: 4px;
`

export default TopicFeedHeader = ({ navigation, position, topic }) => {
    const headerTopOffset = useSafeAreaInsets().top;
    const headerHeight = headerTopOffset + 40;
    const positionText = `${position + 1}/${topic.reelays.length}`;

    return (
        <React.Fragment>
            <HeaderBackground height={headerHeight}>
                <TopicGradient colors={["#252527", "#19242E"]} />
                <PositionRow>
                    <PositionText>{positionText}</PositionText>
                </PositionRow>
                <TopicTitleRow>
                    <BackButton navigation={navigation} />
                    <TopicTitleText>{topic.title}</TopicTitleText>
                </TopicTitleRow>
            </HeaderBackground>
        </React.Fragment>
    );
}