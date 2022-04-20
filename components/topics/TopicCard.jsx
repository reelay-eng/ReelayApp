import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';

import ProfilePicture from '../global/ProfilePicture';
import { Icon } from 'react-native-elements';
import { LinearGradient } from "expo-linear-gradient";

const { height, width } = Dimensions.get('window');

const CardBottomLine = styled(View)`

`
const ContributorPicsContainer = styled(View)`

`
const CreatorLine = styled(View)`
    align-items: center;
    flex-direction: row;
    margin: 16px;
`
const CreatorName = styled(ReelayText.CaptionEmphasized)`
    color: #86878B;
    margin-left: 6px;
    padding-top: 4px;
`
const DescriptionLine = styled(View)`
    margin-left: 18px;
`
const DescriptionText = styled(ReelayText.CaptionEmphasized)`
    color: #86878B;
`
const PromptLine = styled(View)`
    margin-left: 16px;
    margin-bottom: 4px;
`
const PromptText = styled(ReelayText.H5Emphasized)`
    color: white;
`
const TopicCardContainer = styled(View)`
    background-color: black;
    border-radius: 11px;
    height: 165px;
    margin-right: 8px;
    width: ${width-32}px;
`
const TopicCardGradient = styled(LinearGradient)`
    border-radius: 11px;
    height: 100%;
    width: 100%;
    position: absolute;
`
const WatchReelaysButtonContainer = styled(View)`

`
export default TopicCard = ({ topic }) => {
    const creator = {
        sub: topic.creatorSub,
        username: topic.creatorUsername,
    };

    return (
        <TopicCardContainer>
            <TopicCardGradient colors={['#252527', '#19242E']} />
            <CreatorLine>
                <ProfilePicture user={creator} size={24} />
                <CreatorName>{creator.username}</CreatorName>
            </CreatorLine>
            <PromptLine>
                <PromptText>{topic.prompt}</PromptText>
            </PromptLine>
            <DescriptionLine>
                <DescriptionText>{topic.description}</DescriptionText>
            </DescriptionLine>
        </TopicCardContainer>
    );
}


{/* <LinearGradient
colors={["transparent", "#0B1424"]}
style={{
    flex: 1,
    opacity: 0.6,
    width: "100%",
    height: "100%",
    borderRadius: "6px",
    position: 'absolute',
}}
/> */}
