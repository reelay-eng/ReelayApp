import React from "react";
import { Dimensions, Pressable, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import * as ReelayText from '../global/Text';
import { useSelector } from "react-redux";
import styled from 'styled-components/native';

import moment from "moment";

import ReelayThumbnail from '../global/ReelayThumbnail';
import TitlePoster from "../global/TitlePoster";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import ClubPicture from "../global/ClubPicture";
import ReelayColors from "../../constants/ReelayColors";

const { width } = Dimensions.get('window');

const ACTIVITY_CARD_MARGIN = 16;
const ACTIVITY_CARD_WIDTH = (width - ACTIVITY_CARD_MARGIN) / 2;
const REELAY_CARD_HEIGHT = ACTIVITY_CARD_WIDTH * 2.125;
const TOPIC_CARD_HEIGHT = 300;

const ActivityContainer = styled(View)`
    margin-bottom: 8px;
    margin-left: 4px;
    margin-right: 4px;
`
const OverlineText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    display: flex;
    flex: 1;
    padding-left: 6px;
    padding-right: 6px;
`
const TopicTitleText = styled(ReelayText.H5Emphasized)`
    color: white;
    font-size: 18px;
    padding-left: 6px;
    padding-right: 18px;
`
const TitleCardContainer = styled(TouchableOpacity)`
`
const TopicCardContainer = styled(TouchableOpacity)`
    border-radius: 8px;
    height: ${TOPIC_CARD_HEIGHT}px;
    width: 100%;
`
const TopicDescriptionText = styled(ReelayText.CaptionEmphasized)`
    color: #86878B;
    margin-left: 6px;
    margin-top: 4px;
`
const TitleCardGradient = styled(LinearGradient)`
    border-radius: 16px;
    bottom: 0px;
    height: 120px;
    position: absolute;
    width: 100%;
`
const TopicCardGradient = styled(LinearGradient)`
    border-radius: 16px;
    height: 100%;
    width: 100%;
    position: absolute;
`
const TopicToplineLeftContainer = styled(View)`
    align-items: center;
    margin-top: 10px;
    padding: 6px;
    width: 100%;
`
const TopicToplineRightContainer = styled(View)`
    padding: 8px;
`
const TopicOverlayContainer = styled(Pressable)`
    height: 100%;
    justify-content: flex-end;
    padding-bottom: 48px;
    position: absolute;
    width: 100%;
`
const UnderlineContainer = styled(View)`
    align-items: center;
    bottom: 6px;
    flex-direction: row;
    padding: 6px;
    padding-bottom: 0px;
    position: absolute;
    width: 100%;
`

export default ClubActivityCard = ({ activity, navigation }) => {
    const myClubs = useSelector(state => state.myClubs);
    const club = myClubs.find(next => next.id === activity.clubID);
    const { activityType, reelays } = activity;
    if (activityType === 'member') return <View key={member?.userSub} />

    const ActivityUnderline = () => {
        return (
            <UnderlineContainer>
                <ClubPicture club={club} size={30} />
                <OverlineText numberOfLines={2}>{club?.name}</OverlineText>
            </UnderlineContainer>
        );
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
                    width={ACTIVITY_CARD_WIDTH} 
                />
                <TitleCardGradient colors={["transparent", "#1a1a1a"]} />
            </TitleCardContainer>
        )
    }    

    const InMyClubsTopicCard = ({ transparent = false }) => {
        const advanceToClubActivityScreen = () => {
            const club = myClubs.find(next => next.id === activity.clubID);
            navigation.navigate('ClubActivityScreen', { club });
        };

        return (
            <TopicCardContainer key={activity.id} onPress={advanceToClubActivityScreen}>
                { !transparent && <TopicCardGradient colors={[ReelayColors.reelayPurple, '#19242E']} /> }
                <TopicToplineLeftContainer>
                    <FontAwesomeIcon icon={faComments} color='white' size={48} />
                </TopicToplineLeftContainer>
                <TopicToplineRightContainer>
                    <TopicTitleText>{activity.title}</TopicTitleText>
                    <TopicDescriptionText>{activity.description}</TopicDescriptionText>
                </TopicToplineRightContainer>
            </TopicCardContainer>
        )
    }

    const TopicCardOverlay = ({ topic, onPress }) => {
        return (
            <TopicOverlayContainer onPress={onPress}>
                <TopicTitleText>{topic.title}</TopicTitleText>
            </TopicOverlayContainer>
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
                    asAllClubActivity={false}
                    asSingleClubActivity={true}
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
                    <TopicCardOverlay 
                        onPress={advanceToClubFeedScreen} 
                        topic={activity} 
                    />
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