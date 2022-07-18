import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';

import ProfilePicture from '../global/ProfilePicture';
import { Icon } from 'react-native-elements';
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import TopicDotMenuDrawer from './TopicDotMenuDrawer';
import ReelayColors from '../../constants/ReelayColors';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faComments, faSpinner } from '@fortawesome/free-solid-svg-icons';

const { height, width } = Dimensions.get('window');

const BottomRowContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin: 16px;
    margin-bottom: 0px;
    bottom: 16px;
    width: ${width - 64}px;
`
const BottomRowLeftText = styled(ReelayText.Subtitle2)`
    margin-left: 8px;
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
    background-color: #665f6b;
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
const CreatorName = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 14px;
    line-height: 20px;
`
const DescriptionLine = styled(View)`
    margin-left: 16px;
    margin-right: 16px;
    margin-bottom: 9px;
`
const DescriptionText = styled(ReelayText.CaptionEmphasized)`
    color: #86878B;
    line-height: 18px;
`
const DividerLine = styled(View)`
    background-color: rgba(255,255,255,0.1);
    height: 1px;
    margin: 10px;
    width: ${width - 56}px;
`
const DotMenuButtonContainer = styled(TouchableOpacity)`
    padding-left: 4px;
    padding-right: 4px;
`
const PlayReelaysButton = styled(TouchableOpacity)`
    align-items: center;
    border-radius: 17px;
    flex-direction: row;
    justify-content: center;
`
const SharedTopicText = styled(ReelayText.Overline)`
    color: white;
`
const TitleLine = styled(View)`
    margin-top: 16px;
    margin-left: 16px;
    margin-right: 16px;
    margin-bottom: 8px;
`
const TitleText = styled(ReelayText.H6Emphasized)`
    color: white;
    font-size: 18px;
`
const TopicCardGradient = styled(LinearGradient)`
    border-radius: 11px;
    height: 100%;
    width: 100%;
    position: absolute;
`
const TopicCardPressable = styled(TouchableOpacity)`
    background-color: black;
    border-radius: 11px;
    width: ${width-32}px;
`
const TopicCardView = styled(View)`
    background-color: black;
    border-radius: 11px;
    width: ${width-32}px;
`
const TopicOverlineView = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-top: 8px;
    margin-bottom: 8px;
    padding-left: 4px;
    width: ${width-32}px;
`
const TopicOverlineInfoView = styled(View)`
    margin-left: 8px;
`


const CardBottomRowNoStacks = ({ navigation, clubID, topic }) => {
    const advanceToCreateReelay = () => navigation.push('SelectTitleScreen', { clubID, topic });
    return (
        <BottomRowContainer>
            <BottomRowLeftText>{'0 reelays, be the first!'}</BottomRowLeftText>
            <CreateReelayButton onPress={advanceToCreateReelay}>
                <Icon type='ionicon' name='add' color='white' size={20} />
                <CreateReelayText>{'Add Reelay'}</CreateReelayText>
            </CreateReelayButton>
        </BottomRowContainer>
    );
}

const CardBottomRowWithStacks = ({ advanceToFeed, topic }) => {
    const MAX_DISPLAY_CREATORS = 5;
    const myFollowing = useSelector(state => state.myFollowing);
    const inMyFollowing = (creator) => !!myFollowing.find((followingObj) => followingObj?.creatorSub === creator?.sub);

    const getDisplayCreators = () => {
        // list up to five profile pics, first preference towards people you follow
        const uniqueCreatorEntries = topic.reelays.reduce((creatorEntries, nextReelay) => {
            const nextCreator = { 
                sub: nextReelay?.creator?.sub,
                username: nextReelay?.creator?.username,
                isFollowing: inMyFollowing(nextReelay?.creator)
            };

            if (!creatorEntries[nextCreator?.sub]) {
                creatorEntries[nextCreator?.sub] = nextCreator;
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
            <PlayReelaysButton onPress={advanceToFeed}>
                <Icon type='ionicon' name='play-circle' color='white' size={30} />
            </PlayReelaysButton>
        </BottomRowContainer>
    );
}

const CreatorProfilePicRow = ({ displayCreators, reelayCount }) => {
    const pluralCount = (reelayCount > 1) ? 's' : '';
    const reelayCountText = `${reelayCount} reelay${pluralCount}`;
    const renderProfilePic = (creator) => {
        return (
            <ContributorPicContainer key={creator?.sub}>
                <ProfilePicture user={creator} size={24} />
            </ContributorPicContainer>
        );
    }
    return (
        <ContributorRowContainer>
            { displayCreators.map(renderProfilePic) }
            <BottomRowLeftText>{reelayCountText}</BottomRowLeftText>
        </ContributorRowContainer>
    );
}

export default TopicCard = ({ advanceToFeed, clubID, navigation, topic }) => {
    const canPress = (topic.reelays.length > 0);
    const creator = {
        sub: topic.creatorSub,
        username: topic.creatorName,
    };

    const DotMenuButton = () => {
        const [topicDotMenuVisible, setTopicDotMenuVisible] = useState(false);
        const openDrawer = () => setTopicDotMenuVisible(true);
        return (
            <DotMenuButtonContainer onPress={openDrawer}>
                <Icon type='ionicon' name='ellipsis-horizontal' size={20} color='white' />
                { topicDotMenuVisible && (
                    <TopicDotMenuDrawer 
                        navigation={navigation}
                        topic={topic}
                        drawerVisible={topicDotMenuVisible}
                        setDrawerVisible={setTopicDotMenuVisible}
                    />
                )}
            </DotMenuButtonContainer>
        );
    }

    const TopicCardContainer = ({ canPress, children, onPress }) => {
        if (canPress) {
            return <TopicCardPressable activeOpacity={0.5} onPress={onPress}>{children}</TopicCardPressable>;
        } else {
            return <TopicCardView>{children}</TopicCardView>;
        }
    }

    const TopicOverline = () => {
        return (
            <TopicOverlineView>
                <ProfilePicture user={creator} size={32} />
                <TopicOverlineInfoView>
                    <CreatorName>{creator.username}</CreatorName>
                    <SharedTopicText>{'SHARED A TOPIC'}</SharedTopicText>
                </TopicOverlineInfoView>
            </TopicOverlineView>
        );
    }

    return (
        <Fragment>
            <TopicOverline />
            <TopicCardContainer canPress={canPress} onPress={advanceToFeed}>
                <TopicCardGradient colors={['#400817', '#19242E']} start={{ x: 0.5, y: 1 }} end={{ x: 0.5, y: -0.5 }} />
                <TitleLine>
                    <TitleText numberOfLines={2}>{topic.title}</TitleText>
                </TitleLine>
                { (topic.description.length > 0) && (
                    <DescriptionLine>
                        <DescriptionText numberOfLines={3}>{topic.description}</DescriptionText>
                    </DescriptionLine>
                )}
                <DividerLine />
                { (!topic.reelays.length) && (
                    <CardBottomRowNoStacks 
                        navigation={navigation} 
                        clubID={clubID} 
                        topic={topic} 
                    />
                )}
                { (topic.reelays.length > 0) && (
                    <CardBottomRowWithStacks advanceToFeed={advanceToFeed} topic={topic} />
                )}
            </TopicCardContainer>
        </Fragment>
    );
}
