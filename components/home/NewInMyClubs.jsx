import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../../components/global/Text';
import { useSelector } from 'react-redux';
import ProfilePicture from '../global/ProfilePicture';
import Constants from 'expo-constants';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faAsterisk, faChevronRight, faCircle } from '@fortawesome/free-solid-svg-icons';
import { getClubTitles, getClubTopics } from '../../api/ClubsApi';
import { AuthContext } from '../../context/AuthContext';
import TitlePoster from '../global/TitlePoster';
import { VenueIcon } from '../utils/VenueIcon';

import moment from 'moment';
import { showErrorToast } from '../utils/toasts';
import ClubPicture from '../global/ClubPicture';

const { width } = Dimensions.get('window');

const BannerContainer = styled(View)`
    align-items: center;
    margin-top: 6px;
    margin-bottom: 6px;
`
const ClubTitleContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    width: 100%;
`
const ClubTitleText = styled(ReelayText.Caption)`
    align-items: center;
    color: white;
    display: flex;
    flex-direction: row;
    flex: 1;
    height: 52px;
    padding: 6px;
    padding-left: 0px;
    padding-right: 0px;
`
const DotIconContainer = styled(View)`
    align-items: center;
    margin-bottom: -2px;
    margin-left: 8px;
    margin-right: 8px;
`
const HeaderContainer = styled(View)`
    align-items: flex-end;
    flex-direction: row;
    margin-left: 15px;
    margin-top: 15px;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    margin-left: 12px;
`
const RowContainer = styled(ScrollView)`
    padding-left: 15px;
    padding-top: 8px;
    padding-bottom: 8px;
    flex-direction: row;
    width: 100%;
`
const SeeMoreContainer = styled(TouchableOpacity)`
    flex-direction: row;
    justify-content: space-between;
    padding: 8px;
    width: 100%;
`
const SeeMoreText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    font-size: 14px;
`
const TitleInfoContainer = styled(View)`
    display: flex;
    flex: 1;
    justify-content: center;
    margin-left: 8px;
`
const TopicBannerBackground = styled(TouchableOpacity)`
    align-items: center;
    background-color: #191919;
    border-radius: 8px;
    justify-content: space-between;
    flex-direction: row;
    padding: 6px;
    width: ${width - 20}px;
    zIndex: 3;
`
const TopicTextContainer = styled(View)`
    display: flex;
    flex: 1;
    padding: 6px;
`
const TopicDescription = styled(ReelayText.Body2)`
    color: white;
    display: flex;
    flex: 1;
`
const TitleText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 16px;
`
const TopicTitleText = styled(ReelayText.H5Bold)`
    color: white;
    display: flex;
    flex: 1;
    font-size: 16px;
`
const TitleUnderlineContainer = styled(View)`
    margin-top: 5px;
    margin-right: 8px;
    width: 100%;
`
const VenueContainer = styled(View)`
    margin-right: 5px;
`
const YearText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
`
const YearVenueContainer = styled(View)`
    align-items: center;
    flex-direction: row;
`

const MAX_ACTIVITY_COUNT = 8;
const WELCOME_REELAY_SUB = Constants.manifest.extra.welcomeReelaySub;

const TitleUnderline = ({ clubID, titleObj, reelays }) => {
	let displayYear = (titleObj.releaseYear) ? titleObj.releaseYear : '';
    const reelayObj = reelays?.[0];
    if (reelayObj?.sub === WELCOME_REELAY_SUB) displayYear = '2022';
    const positionString = (reelays?.length > 1) 
            ? `${reelays?.length} reelays` 
        : (reelays?.length === 1)
            ? '1 reelay'
        : 'title added';

    const myClubs = useSelector(state => state.myClubs);
    const matchClubID = (nextClub) => nextClub?.id === clubID;
    const club = myClubs.find(matchClubID);

    return (
        <TitleUnderlineContainer>
            <YearVenueContainer>
                { reelayObj?.content?.venue && 
                    <VenueContainer>
                        <VenueIcon venue={reelayObj?.content?.venue} size={20} border={1} />
                    </VenueContainer>
                }
                <ClubTitleContainer>
                    <ClubTitleText numberOfLines={2}>
                        {club?.name}
                        <DotIconContainer>
                            <FontAwesomeIcon icon={faCircle} size={6} color='white' />
                        </DotIconContainer>
                        {positionString}
                    </ClubTitleText>
                </ClubTitleContainer>
            </YearVenueContainer>
        </TitleUnderlineContainer>
    );
}

export const TitleBanner = ({ onPress, clubID, titleObj, reelays }) => {
    let displayTitle = (titleObj.display) ? titleObj.display : 'Title not found'; 
    const reelayObj = reelays?.[0];
    if (reelayObj?.sub === WELCOME_REELAY_SUB) displayTitle = 'Welcome to Reelay';

    return (
        <BannerContainer>
            <TopicBannerBackground onPress={onPress}>
                <TitlePoster title={titleObj} width={60} />
                <TitleInfoContainer>
                    <TitleText numberOfLines={2}>
                        {displayTitle}
                    </TitleText>
                    <TitleUnderline clubID={clubID} titleObj={titleObj} reelays={reelays} />
                </TitleInfoContainer>
                <ClubPicture club={{ id: clubID }} size={52} />
            </TopicBannerBackground>
        </BannerContainer>
    );
}

export const TopicBanner = ({ onPress, topic }) => {
    return (
        <BannerContainer>
            <TopicBannerBackground onPress={onPress}>
                <TopicTextContainer>
                    <TopicTitleText numberOfLines={2}>
                        {topic?.title}
                    </TopicTitleText>
                    <TopicDescription numberOfLines={2}>
                        {topic?.description}
                    </TopicDescription>
                </TopicTextContainer>
                <ClubPicture club={{ id: topic?.clubID }} size={52} />
            </TopicBannerBackground>
        </BannerContainer>
    );
}

export default NewInMyClubs = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const authSession = useSelector(state => state.authSession);
    const myClubs = useSelector(state => state.myClubs);

    const [mostRecentActivity, setMostRecentActivity] = useState([]);

    const filterActivitiesToUniqueClubs = (nextActivity, index) => {
        const matchClubID = (activity) => (activity?.clubID === nextActivity?.clubID);
        if (nextActivity?.activityType === 'title') return false;
        return true;
        // return sortedClubActivites.findIndex(matchClubID) === index;
    }    

    const uniqueActivity = mostRecentActivity.filter(filterActivitiesToUniqueClubs);
    const activityCount = uniqueActivity?.length;

    const showAllActivities = activityCount < MAX_ACTIVITY_COUNT;
    const maxDisplayIndex = showAllActivities ? activityCount : MAX_ACTIVITY_COUNT;
    const displayActivity = mostRecentActivity.filter(filterActivitiesToUniqueClubs).slice(0, maxDisplayIndex);

    const advanceToClubActivityScreen = (clubID) => {
        const club = myClubs.find(nextClub => nextClub?.id === clubID);
        if (!club) {
            showErrorToast('Ruh roh! Couldn`t load that page. Try again?');
            return;
        }
        navigation.navigate('ClubActivityScreen', { club });
    }

    const allClubActivities = (activityEntries, nextClub) => {
        const { titles, topics } = nextClub;
        return [...activityEntries, ...titles, ...topics ];
    }

    const loadActivityForClub = async (club) => {
        const reqOptions = {
            authSession,
            clubID: club?.id,
            page: 0,
            reqUserSub: reelayDBUser?.sub,
        }
        const [titles, topics] = await Promise.all([
            getClubTitles(reqOptions),
            getClubTopics(reqOptions),
        ]);
        club.titles = titles;
        club.topics = topics;
        return club;
    }

    const loadAllMyClubActivity = async () => {
        const nextMyClubs = await Promise.all(myClubs.map(loadActivityForClub));
        const clubActivities = nextMyClubs.reduce(allClubActivities, []);
        const sortedClubActivites = clubActivities.sort(sortByLastUpdated);
        setMostRecentActivity(sortedClubActivites);
    }

    const renderActivity = (activity) => {
        const { id, clubID, activityType, reelays, title } = activity;
        const onPress = () => advanceToClubActivityScreen(clubID);
        if (activityType === 'title') {
            return (
                <BannerContainer key={id}>
                    <TitleBanner
                        clubActivity={activity}
                        navigation={navigation}
                        onPress={onPress}
                        posterWidth={60}
                        stack={reelays}
                        titleObj={title}
                    />
                </BannerContainer>
            )
        } else if (activityType === 'topic') {
            return <TopicBanner key={id} onPress={onPress} topic={activity} />;
        } else {
            return <View key={id} />;
        }
    }

    const sortByLastUpdated = (activity0, activity1) => {
        const lastActivity0 = moment(activity0?.lastUpdatedAt);
        const lastActivity1 = moment(activity1?.lastUpdatedAt);
        return lastActivity0.diff(lastActivity1, 'seconds');
    }

    const SeeMore = () => {
        const advanceToNewInMyClubsScreen = () => {
            navigation.push('NewInMyClubsScreen', { mostRecentActivity })
        }
        return (
            <SeeMoreContainer onPress={advanceToNewInMyClubsScreen}>
                <SeeMoreText>{'See more'}</SeeMoreText>
                <FontAwesomeIcon icon={faChevronRight} size={16} color='white' />
            </SeeMoreContainer>
        );
    }

    useEffect(() => {
        loadAllMyClubActivity();
    }, []);

    return (
        <Fragment>
            <HeaderContainer>
                <FontAwesomeIcon icon={faAsterisk} color='white' size={24} />
                <HeaderText>{'New in my clubs'}</HeaderText>
            </HeaderContainer>
            <RowContainer showsVerticalScrollIndicator={false}>
                { displayActivity.map(renderActivity) }
                <SeeMore />
            </RowContainer>
        </Fragment>
    )
}