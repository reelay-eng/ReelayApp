import React from "react";
import { Dimensions, SafeAreaView, ScrollView, SectionList, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';

import { HeaderWithBackButton } from "../../components/global/Headers";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import moment from "moment";

import ProfilePicture from "../../components/global/ProfilePicture";
import ReelayThumbnail from '../../components/global/ReelayThumbnail';
import TitlePoster from "../../components/global/TitlePoster";
import ClubPicture from "../../components/global/ClubPicture";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";

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
const OverlineText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    display: flex;
    flex: 1;
    padding-left: 6px;
    padding-right: 6px;
`
const ScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const ScrollContainer = styled(ScrollView)`
    margin-bottom: ${props => props.bottomOffset}px;
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

export default NewInMyClubsScreen = ({ navigation, route }) => {
    const bottomOffset = useSafeAreaInsets().bottom + 20;
    const myClubs = useSelector(state => state.myClubs);
    const myClubActivities = useSelector(state => state.myClubActivities);
    const filterMemberActivities = (nextActivity) => (nextActivity?.activityType !== 'member');
    const displayActivities = myClubActivities.filter(filterMemberActivities);

    const columnA = displayActivities.filter((activity, index) => index % 2 === 0);
    const columnB = displayActivities.filter((activity, index) => index % 2 === 1);

    const ActivityUnderline = ({ activity }) => {
        const { activityType, reelays, title } = activity;
        if (reelays.length > 0) {
            const { creator } = activity.reelays[0];
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

    const InMyClubsTitleCard = ({ title }) => {
        const advanceToClubActivityScreen = () => {
            const club = myClubs.find(next => next.id === title.clubID);
            navigation.navigate('ClubActivityScreen', { club });
        };

        return (
            <TitleCardContainer onPress={advanceToClubActivityScreen} >
                <TitlePoster
                    title={title.title} 
                    width={ACTIVITY_CARD_WIDTH - 6} 
                />
            </TitleCardContainer>
        )
    }    

    const InMyClubsTopicCard = ({ topic }) => {
        const advanceToClubActivityScreen = () => {
            const club = myClubs.find(next => next.id === topic.clubID);
            navigation.navigate('ClubActivityScreen', { club });
        };
        return (
            <TopicCardContainer key={topic.id} onPress={advanceToClubActivityScreen}>
                <TopicCardGradient colors={['#400817', '#19242E']} />
                <TopicToplineLeftContainer>
                    <FontAwesomeIcon icon={faComments} color='white' size={24} />
                </TopicToplineLeftContainer>
                <TopicToplineRightContainer>
                    <TopicTitleText numberOfLines={2}>{topic.title}</TopicTitleText>
                    <TopicDescriptionText>{topic.description}</TopicDescriptionText>
                </TopicToplineRightContainer>
            </TopicCardContainer>
        )
    }

    const renderActivity = (activity) => {
        const { activityType, reelays, title } = activity;
        if (activityType === 'member') return <View key={member?.userSub} />
        const hasReelays = reelays?.length > 0;

        if (hasReelays) {
            const advanceToClubFeedScreen = () => {
                const club = myClubs.find(next => next.id === activity.clubID);

                const titleOrTopicHasReelays = (titleOrTopic) => (titleOrTopic?.reelays?.length > 0);
                const sortClubTitlesAndTopics = (titleOrTopic0, titleOrTopic1) => {
                    const lastActivity0 = moment(titleOrTopic0?.lastUpdatedAt);
                    const lastActivity1 = moment(titleOrTopic1?.lastUpdatedAt);
                    return lastActivity0.diff(lastActivity1, 'seconds') < 0;
                }
            
                const feedTitlesAndTopics = [...club.titles, ...club.topics]
                    .sort(sortClubTitlesAndTopics)
                    .filter(titleOrTopicHasReelays);

                const initFeedIndex = feedTitlesAndTopics.findIndex(next => next.id === activity.id);            
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
            const advanceToClubActivityScreen = () => {}; // todo 
            return (
                <ActivityContainer key={activity.id}>
                    <InMyClubsTitleCard title={activity} />
                    <ActivityUnderline activity={activity} />
                </ActivityContainer>
            );
        } else if (activityType === 'topic') {
            return (
                <ActivityContainer key={activity.id}>
                    <InMyClubsTopicCard topic={activity} />
                    <ActivityUnderline activity={activity} />
                </ActivityContainer>
            );
        } else {
            return <View key={activity?.id}/>;
        }
    }

    return (
        <ScreenContainer>
            <HeaderWithBackButton navigation={navigation} text={'New in my clubs'} />
            <ScrollContainer 
                bottomOffset={bottomOffset} 
                contentContainerStyle={{ 
                    alignItems: 'center',
                    width: '100%',
                }}
                showVerticalScrollIndicator={false}
            >
                <ColumnsContainer>
                    <ColumnContainer>
                        { columnA.map(renderActivity) }
                    </ColumnContainer>
                    <ColumnContainer>
                        { columnB.map(renderActivity) }
                    </ColumnContainer>
                </ColumnsContainer>
            </ScrollContainer>
        </ScreenContainer>
    )
}