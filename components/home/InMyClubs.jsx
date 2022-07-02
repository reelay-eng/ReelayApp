import React from "react";
import { Dimensions, Pressable, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { LinearGradient } from "expo-linear-gradient";
import * as ReelayText from '../global/Text';
import { useSelector } from "react-redux";
import styled from 'styled-components/native';

import moment from "moment";

import ReelayThumbnail from '../global/ReelayThumbnail';
import TitlePoster from "../global/TitlePoster";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronRight, faComments } from "@fortawesome/free-solid-svg-icons";
import { ClubsIconSVG } from "../global/SVGs";
import ClubPicture from "../global/ClubPicture";

const { width } = Dimensions.get('window');

const ACTIVITY_CARD_MARGIN = 16;
const ACTIVITY_CARD_WIDTH = (width - ACTIVITY_CARD_MARGIN) / 2;
const REELAY_CARD_HEIGHT = ACTIVITY_CARD_WIDTH * 2.125;
const TOPIC_CARD_HEIGHT = 300; // ACTIVITY_CARD_WIDTH * 1.25;
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
const CreateClubBackground = styled(View)`
    background-color: #FFFFFF;
    border-radius: 17px;
    height: 32px;
    opacity: 0.25;
    position: absolute;
    width: 125px;
`
const CreateClubPressable = styled(TouchableOpacity)`
    align-items: center;
    border-radius: 17px;
    flex-direction: row;
    justify-content: center;
    height: 32px;
    padding-left: 8px;
    padding-right: 12px;
    margin-bottom: 20px;
    width: 125px;
`
const CreateClubButtonText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    font-size: 12px;
    line-height: 16px;
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
    justify-content: flex-end;
    height: 24px;
    margin-bottom: 16px;
`
const SeeMoreText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    margin-left: 16px;
`
const Spacer = styled(View)`
    width: 8px;
`
const StartAClubContainer = styled(View)`
    align-items: center;
    border-radius: 8px;
    justify-content: center;
    margin: 16px;
`
const StartAClubContentContainer = styled(View)`
    padding: 16px;
    padding-left: 20px;
    padding-right: 20px;
`
const StartAClubCTAContainer = styled(View)`
    align-items: flex-end;
    margin-right: 16px;
    width: 100%;
`
const StartAClubGradient = styled(LinearGradient)`
    border-radius: 8px;
    height: 100%;
    position: absolute;
    width: 100%;
`
const StartAClubTitleText = styled(ReelayText.H5Emphasized)`
    color: white;
    line-height: 24px;
    margin-top: 12px;
    margin-bottom: 6px;
`
const StartAClubBodyText = styled(ReelayText.Body2Emphasized)`
    color: white;
    margin-bottom: 4px;
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
    padding: 4px;
    position: absolute;
    width: 100%;
`

export const ClubActivityCard = ({ activity, navigation }) => {
    const myClubs = useSelector(state => state.myClubs);
    const club = myClubs.find(next => next.id === activity.clubID);
    const { activityType, reelays } = activity;
    if (activityType === 'member') return <View key={member?.userSub} />

    const ActivityUnderline = () => {
        const overlineText = club?.name;
        return (
            <UnderlineContainer>
                <ClubPicture club={club} size={30} />
                <OverlineText numberOfLines={2}>{overlineText}</OverlineText>
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
                { !transparent && <TopicCardGradient colors={['#400817', '#19242E']} /> }
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

    const TopicCardOverlay = ({ topic }) => {
        return (
            <TopicOverlayContainer>
                <TopicTitleText>{topic.title}</TopicTitleText>
                { topic?.description?.length > 0 && <TopicDescriptionText numberOfLines={3}>{topic.description}</TopicDescriptionText> }
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
                { activityType === 'topic' && <TopicCardOverlay topic={activity} /> }
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

const StartAClubCard = ({ navigation }) => {
    const START_A_CLUB_TITLE = 'Start a club with friends';
    const START_A_CLUB_BODY = 'Share reelays together in private. For your roommates, your family, your Marvel team, your Succession obsession.';
    const START_A_CLUB_BODY1 = 'Share reelays together in private.';
    const START_A_CLUB_BODY2 = 'For your roommates, your family, your Marvel team, your Succession obsession.';

    const CreateClubButton = () => {
        const advanceToCreateClub = () => navigation.navigate('CreateClubScreen');
        return (
            <CreateClubPressable onPress={advanceToCreateClub}>
                <CreateClubBackground />
                <Icon type='ionicon' name='add' color='white' size={20} />
                <CreateClubButtonText>{'Create a club'}</CreateClubButtonText>
            </CreateClubPressable>
        );
    }

    return (
        <StartAClubContainer>
            <StartAClubGradient colors={[ '#FF4848', '#038AFF' ]}/>
            <StartAClubContentContainer>
                <StartAClubTitleText>{START_A_CLUB_TITLE}</StartAClubTitleText>
                <StartAClubBodyText>{START_A_CLUB_BODY1}</StartAClubBodyText>
                <StartAClubBodyText>{START_A_CLUB_BODY2}</StartAClubBodyText>
            </StartAClubContentContainer>
            <StartAClubCTAContainer>
                <CreateClubButton />
            </StartAClubCTAContainer>
        </StartAClubContainer>
    );
}

export default InMyClubs = ({ navigation }) => {
    const MAX_ACTIVITIES_SHOWN = 6;

    const myClubActivities = useSelector(state => state.myClubActivities);
    const filterMemberActivities = (nextActivity) => (nextActivity?.activityType !== 'member');
    const displayActivities = myClubActivities.filter(filterMemberActivities);
    const hasDisplayActivities = displayActivities.length > 0;

    const columnA = displayActivities.filter((activity, index) => (index % 2 === 0) && (index < MAX_ACTIVITIES_SHOWN));
    const columnB = displayActivities.filter((activity, index) => (index % 2 === 1) && (index < MAX_ACTIVITIES_SHOWN));

    const renderActivity = (activity) => {
        return <ClubActivityCard key={activity.id} activity={activity} navigation={navigation} />
    }

    const SeeMore = () => {
        const advanceToNewInMyClubsScreen = () => navigation.push('NewInMyClubsScreen');
        return (
            <SeeMoreContainer onPress={advanceToNewInMyClubsScreen}>
                <SeeMoreText>{'See More'}</SeeMoreText>
                <Spacer />
                <FontAwesomeIcon icon={faChevronRight} size={12} color='white' />
                <Spacer />
            </SeeMoreContainer>
        )
    }

    if (!hasDisplayActivities) {
        return <StartAClubCard navigation={navigation} />
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