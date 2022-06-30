import React from "react";
import { Dimensions, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import * as ReelayText from '../global/Text';
import { useSelector } from "react-redux";
import styled from 'styled-components/native';

import moment from "moment";

import ProfilePicture from "../global/ProfilePicture";
import ReelayThumbnail from '../global/ReelayThumbnail';
import TitlePoster from "../global/TitlePoster";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronRight, faComments } from "@fortawesome/free-solid-svg-icons";
import { ClubsIconSVG } from "../global/SVGs";

const { width } = Dimensions.get('window');

const ACTIVITY_CARD_MARGIN = 8;
const ACTIVITY_CARD_WIDTH = (width - ACTIVITY_CARD_MARGIN) / 2;
const REELAY_CARD_HEIGHT = ACTIVITY_CARD_WIDTH * 2.125;
const TOPIC_CARD_HEIGHT = ACTIVITY_CARD_WIDTH * 1.25;
const TITLE_CARD_HEIGHT = ACTIVITY_CARD_WIDTH * 1.5;

const ActivityContainer = styled(View)`
    margin-bottom: 8px;
    margin-left: 4px;
    margin-right: 4px;
`
const ColumnsContainer = styled(View)`
    flex-direction: row;
    width: 100%;
`
const ColumnContainer = styled(View)`
    display: flex;
    flex: 1;
    width: 50%;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    padding: 15px;
`
const HeaderContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
`
const HeaderContainerLeft = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-left: 15px;
`
const OverlineText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    display: flex;
    flex: 1;
    padding-left: 6px;
    padding-right: 6px;
`
const SeeMoreContainer = styled(TouchableOpacity)`
    align-items: center;
    flex-direction: row;
    height: 24px;
`
const SeeMoreText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    margin-left: 16px;
`
const Spacer = styled(View)`
    width: 8px;
`
const TopicTitleText = styled(ReelayText.H6Emphasized)`
    color: white;
    display: flex;
    font-size: 16px;
    padding-left: 6px;
    padding-right: 18px;
`
const TitleCardContainer = styled(TouchableOpacity)`
`
const TopicCardContainer = styled(TouchableOpacity)`
    border-radius: 8px;
    flex-direction: row;
    height: ${TOPIC_CARD_HEIGHT}px;
    width: 100%;
`
const TopicDescriptionText = styled(ReelayText.CaptionEmphasized)`
    color: #86878B;
    display: flex;
    margin-left: 6px;
    margin-top: 4px;
`
const TopicCardGradient = styled(LinearGradient)`
    border-radius: 16px;
    height: 100%;
    width: 100%;
    position: absolute;
`
const TopicToplineLeftContainer = styled(View)`
    padding: 6px;
`
const TopicToplineRightContainer = styled(View)`
    flex: 1;
    padding: 6px;
    padding-left: 0px;
`
const TopicIconContainer = styled(View)`
    flex-direction: row;
    position: absolute;
    top: 6px;
    left: 6px;
`
const UnderlineContainer = styled(View)`
    align-items: center;
    bottom: 6px;
    flex-direction: row;
    padding: 4px;
    position: absolute;
    width: 100%;
`

export const ClubActivityCard = ({ activity, navigation }) => {
    console.log('activity rendering: ', activity);
    const myClubs = useSelector(state => state.myClubs);
    const { activityType, reelays } = activity;
    if (activityType === 'member') return <View key={member?.userSub} />

    const ActivityUnderline = () => {
        if (reelays.length > 0) {
            const { creator } = reelays[0];
            const overlineText = `${creator.username} reelayed`;
            return (
                <UnderlineContainer>
                    <ProfilePicture user={creator} size={30} />
                    <OverlineText numberOfLines={2}>{overlineText}</OverlineText>
                </UnderlineContainer>
            );
        } else {
            const creator = {
                sub: activity?.addedByUserSub ?? activity?.creatorSub,
                username: activity?.addedByUsername ?? activity?.creatorName,
            }
            const overlineText = `${creator.username} added`;
            return (
                <UnderlineContainer>
                    <ProfilePicture user={creator} size={30} />
                    <OverlineText numberOfLines={2}>{overlineText}</OverlineText>
                </UnderlineContainer>
            );
        }    
    }

    const InMyClubsTitleCard = () => {
        const advanceToClubActivityScreen = () => {
            const club = myClubs.find(next => next.id === activity.clubID);
            navigation.navigate('ClubActivityScreen', { club });
        };

        return (
            <TitleCardContainer onPress={advanceToClubActivityScreen} >
                <TitlePoster
                    title={activity.title} 
                    width={ACTIVITY_CARD_WIDTH - 6} 
                />
            </TitleCardContainer>
        )
    }    

    const InMyClubsTopicCard = () => {
        const advanceToClubActivityScreen = () => {
            const club = myClubs.find(next => next.id === activity.clubID);
            navigation.navigate('ClubActivityScreen', { club });
        };
        return (
            <TopicCardContainer key={activity.id} onPress={advanceToClubActivityScreen}>
                <TopicCardGradient colors={['#400817', '#19242E']} />
                <TopicToplineLeftContainer>
                    <FontAwesomeIcon icon={faComments} color='white' size={24} />
                </TopicToplineLeftContainer>
                <TopicToplineRightContainer>
                    <TopicTitleText numberOfLines={2}>{activity.title}</TopicTitleText>
                    <TopicDescriptionText>{activity.description}</TopicDescriptionText>
                </TopicToplineRightContainer>
            </TopicCardContainer>
        )
    }

    const getClubFeedIndex = (club) => {
        const titleOrTopicHasReelays = (titleOrTopic) => (titleOrTopic?.reelays?.length > 0);
        const sortClubTitlesAndTopics = (titleOrTopic0, titleOrTopic1) => {
            const lastActivity0 = moment(titleOrTopic0?.lastUpdatedAt);
            const lastActivity1 = moment(titleOrTopic1?.lastUpdatedAt);
            return lastActivity0.diff(lastActivity1, 'seconds') < 0;
        }
    
        const feedTitlesAndTopics = [...club.titles, ...club.topics]
            .sort(sortClubTitlesAndTopics)
            .filter(titleOrTopicHasReelays);
        return feedTitlesAndTopics.findIndex(next => next.id === activity.id);            
    }

    const hasReelays = reelays?.length > 0;
    if (hasReelays) {
        const advanceToClubFeedScreen = () => {
            const club = myClubs.find(next => next.id === activity.clubID);
            const initFeedIndex = getClubFeedIndex(club);
            navigation.navigate('ClubFeedScreen', { club, initFeedIndex });
        };

        return (
            <ActivityContainer key={activity.id}>
                <ReelayThumbnail 
                    asTopOfTheWeek={false}
                    asNewInMyClubs={true}
                    height={REELAY_CARD_HEIGHT}
                    margin={0}
                    onPress={advanceToClubFeedScreen}
                    reelay={reelays[0]}
                    showPoster={true}
                    showVenue={true}
                    showIcons={true}
                    width={ACTIVITY_CARD_WIDTH}
                />
                { activityType === 'topic' && (
                    <TopicIconContainer>
                        <FontAwesomeIcon icon={faComments} color='white' size={24} />
                    </TopicIconContainer>                    
                )}
            </ActivityContainer>
        );
    } else if (activityType === 'title') {
        return (
            <ActivityContainer key={activity.id}>
                <InMyClubsTitleCard />
                <ActivityUnderline />
            </ActivityContainer>
        );
    } else if (activityType === 'topic') {
        return (
            <ActivityContainer key={activity.id}>
                <InMyClubsTopicCard />
                <ActivityUnderline />
            </ActivityContainer>
        );
    } else {
        return <View key={activity?.id}/>;
    }
}

export default InMyClubs = ({ navigation }) => {
    const MAX_ACTIVITIES_SHOWN = 6;

    const myClubActivities = useSelector(state => state.myClubActivities);
    const filterMemberActivities = (nextActivity) => (nextActivity?.activityType !== 'member');
    const displayActivities = myClubActivities.filter(filterMemberActivities);

    const columnA = displayActivities.filter((activity, index) => (index % 2 === 0) && (index < MAX_ACTIVITIES_SHOWN));
    const columnB = displayActivities.filter((activity, index) => (index % 2 === 1) && (index < MAX_ACTIVITIES_SHOWN));

    const renderActivity = (activity) => {
        return <ClubActivityCard activity={activity} navigation={navigation} />
    }

    const SeeMore = () => {
        const advanceToNewInMyClubsScreen = () => navigation.push('NewInMyClubsScreen');
        return (
            <SeeMoreContainer onPress={advanceToNewInMyClubsScreen}>
                <SeeMoreText>{'See More'}</SeeMoreText>
                <Spacer />
                <FontAwesomeIcon icon={faChevronRight} size={12} color='white' />
            </SeeMoreContainer>
        )
    }

    return (
        <View>
            <HeaderContainer>
                <HeaderContainerLeft>
                    <ClubsIconSVG size={24} />
                    <HeaderText>{'In my clubs'}</HeaderText>
                </HeaderContainerLeft>
            </HeaderContainer>
            <ColumnsContainer>
                <ColumnContainer>
                    { columnA.map(renderActivity) }
                </ColumnContainer>
                <ColumnContainer>
                    { columnB.map(renderActivity) }
                </ColumnContainer>
            </ColumnsContainer>
            <SeeMore />
        </View>
    );
}