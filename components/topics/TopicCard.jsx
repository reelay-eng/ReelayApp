import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';

import ProfilePicture from '../global/ProfilePicture';
import { Icon } from 'react-native-elements';
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from 'react-native-gesture-handler';

const { height, width } = Dimensions.get('window');

const BottomRowContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin: 16px;
    bottom: 4px;
`
const BottomRowLeftText = styled(ReelayText.Subtitle2)`
    color: #86878B;
`
const ContributorPicsContainer = styled(View)`

`
const CreateReelayButton = styled(TouchableOpacity)`
    align-items: center;
    background-color: #444950;
    border-radius: 17px;
    flex-direction: row;
    justify-content: center;
    height: 30px;
    padding-left: 8px;
    padding-right: 12px;
`
const CreateReelayText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    font-size: 12px;
    line-height: 16px;
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
    margin-left: 16px;
    margin-right: 16px;
    margin-bottom: 9px;
`
const DescriptionText = styled(ReelayText.CaptionEmphasized)`
    color: #86878B;
`
const TitleLine = styled(View)`
    margin-left: 16px;
    margin-right: 16px;
    margin-bottom: 8px;
`
const TitleText = styled(ReelayText.H6Emphasized)`
    color: white;
`
const TopicCardContainer = styled(View)`
    background-color: black;
    border-radius: 11px;
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

const CardBottomRowNoStacks = ({ navigation }) => {
    const advanceToCreateTopic = () => navigation.push('CreateTopicScreen');

    return (
        <BottomRowContainer>
            <BottomRowLeftText>
                {'0 reelays, be the first!'}
            </BottomRowLeftText>
            <CreateReelayButton onPress={advanceToCreateTopic}>
                <Icon type='ionicon' name='add' color='white' size={20} />
                <CreateReelayText>{'Create Reelay'}</CreateReelayText>
            </CreateReelayButton>
        </BottomRowContainer>
    );
}

export default TopicCard = ({ navigation, topic, stacks = [] }) => {
    const creator = {
        sub: topic.creatorSub,
        username: topic.creatorName,
    };

    return (
        <TopicCardContainer>
            <TopicCardGradient colors={['#252527', '#19242E']} />
            <CreatorLine>
                <ProfilePicture user={creator} size={24} />
                <CreatorName>{creator.username}</CreatorName>
            </CreatorLine>
            <TitleLine>
                <TitleText>{topic.title}</TitleText>
            </TitleLine>
            <DescriptionLine>
                <DescriptionText numberOfLines={2}>{topic.description}</DescriptionText>
            </DescriptionLine>
            { !stacks.length && <CardBottomRowNoStacks navigation={navigation} /> }
        </TopicCardContainer>
    );
}
