import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';

import ProfilePicture from '../global/ProfilePicture';
import { Icon } from 'react-native-elements';
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

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
const ContributorPicContainer = styled(View)`
    margin-left: -10px;
`
const ContributorRowContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-left: 10px;
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
const PlayReelaysButton = styled(TouchableOpacity)`
    align-items: center;
    border-radius: 17px;
    flex-direction: row;
    justify-content: center;
`
const TitleLine = styled(View)`
    margin-left: 16px;
    margin-right: 16px;
    margin-bottom: 8px;
`
const TitleText = styled(ReelayText.H6Emphasized)`
    color: white;
`
const TopicCardContainer = styled(TouchableOpacity)`
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

const CardBottomRowNoStacks = ({ navigation, topic }) => {
    const advanceToCreateReelay = () => navigation.push('SelectTitleScreen', { topic });
    return (
        <BottomRowContainer>
            <BottomRowLeftText>{'0 reelays, be the first!'}</BottomRowLeftText>
            <CreateReelayButton onPress={advanceToCreateReelay}>
                <Icon type='ionicon' name='add' color='white' size={20} />
                <CreateReelayText>{'Create Reelay'}</CreateReelayText>
            </CreateReelayButton>
        </BottomRowContainer>
    );
}

const CardBottomRowWithStacks = ({ advanceToTopicsFeed, topic }) => {
    const MAX_DISPLAY_CREATORS = 5;
    const myFollowing = useSelector(state => state.myFollowing);
    const inMyFollowing = (creator) => !!myFollowing.find((nextFollowing) => nextFollowing.sub === creator.sub);

    const getDisplayCreators = () => {
        // list up to five profile pics, first preference towards people you follow
        const uniqueCreatorEntries = topic.reelays.reduce((creatorEntries, nextReelay) => {
            const nextCreator = { 
                sub: nextReelay.creator.sub,
                username: nextReelay.creator.username,
                isFollowing: inMyFollowing(nextReelay.creator)
            };

            if (!creatorEntries[nextCreator.sub]) {
                creatorEntries[nextCreator.sub] = nextCreator;
            }
            return creatorEntries;
        }, {});

        const uniqueCreatorList = Object.values(uniqueCreatorEntries);
        if (uniqueCreatorList.length <= MAX_DISPLAY_CREATORS) return uniqueCreatorList;
        return uniqueCreatorList.slice(MAX_DISPLAY_CREATORS);
    }
    
    return (
        <BottomRowContainer>
            <CreatorProfilePicRow 
                displayCreators={getDisplayCreators()} 
                reelayCount={topic.reelays.length} 
            />
            <PlayReelaysButton onPress={advanceToTopicsFeed}>
                <Icon type='ionicon' name='play-circle' color='white' size={30} />
            </PlayReelaysButton>
        </BottomRowContainer>
    );
}

const CreatorProfilePicRow = ({ displayCreators, reelayCount }) => {
    const renderProfilePic = (creator) => {
        return (
            <ContributorPicContainer key={creator.sub}>
                <ProfilePicture user={creator} size={24} />
            </ContributorPicContainer>
        );
    }
    return (
        <ContributorRowContainer>
            { displayCreators.map(renderProfilePic)}
            <BottomRowLeftText>
                {`    ${reelayCount} reelays`}
            </BottomRowLeftText>
        </ContributorRowContainer>
    );
}

export default TopicCard = ({ globalTopicIndex, navigation, topic }) => {
    const creator = {
        sub: topic.creatorSub,
        username: topic.creatorName,
    };

    const advanceToTopicsFeed = () => {
        if (topic.reelays.length) {
            navigation.push('TopicsFeedScreen', { 
                initTopicIndex: globalTopicIndex 
            });    
        }
    }

    return (
        <TopicCardContainer onPress={advanceToTopicsFeed}>
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
            { (!topic.reelays.length) && <CardBottomRowNoStacks navigation={navigation} topic={topic} /> }
            { (topic.reelays.length > 0) && (
                <CardBottomRowWithStacks advanceToTopicsFeed={advanceToTopicsFeed} topic={topic} />
             )}
        </TopicCardContainer>
    );
}
