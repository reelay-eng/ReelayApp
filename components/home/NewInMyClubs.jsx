import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../../components/global/Text';
import { useSelector } from 'react-redux';
import ProfilePicture from '../global/ProfilePicture';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faAsterisk, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { getClubTitles, getClubTopics } from '../../api/ClubsApi';
import { AuthContext } from '../../context/AuthContext';

import moment from 'moment';
import TitleBanner from '../feed/TitleBanner';
import { showErrorToast } from '../utils/toasts';

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
const TitleBannerContainer = styled(View)`
    margin-top: 6px;
    margin-bottom: 6px;
`

const MAX_ACTIVITY_COUNT = 4;

export default NewInMyClubs = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const authSession = useSelector(state => state.authSession);
    const myClubs = useSelector(state => state.myClubs);
    const [mostRecentActivity, setMostRecentActivity] = useState([]);

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
        const filterActivitiesToUniqueClubs = (nextActivity, index) => {
            const matchClubID = (activity) => (activity?.clubID === nextActivity?.clubID);
            return sortedClubActivites.findIndex(matchClubID) === index;
        }    

        const mostRecentActivities = clubActivities.filter(filterActivitiesToUniqueClubs);
        const activityCount = mostRecentActivities?.length;
        const showAllActivities = activityCount < MAX_ACTIVITY_COUNT;
        const maxDisplayIndex = showAllActivities ? activityCount : MAX_ACTIVITY_COUNT;

        setMostRecentActivity(
            clubActivities
                .filter(filterActivitiesToUniqueClubs)
                .slice(0, maxDisplayIndex)
        );
    }

    const renderActivity = (activity) => {
        const { id, clubID, activityType, reelays, title } = activity;
        if (activityType === 'title') {
            return (
                <TitleBannerContainer key={id}>
                    <TitleBanner
                        clubActivity={activity}
                        navigation={navigation}
                        onPress={() => advanceToClubActivityScreen(clubID)}
                        posterWidth={60}
                        stack={reelays}
                        titleObj={title}
                    />
                </TitleBannerContainer>
            )
        } else if (activityType === 'topic') {
            return <View key={id} />;
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
        return (
            <SeeMoreContainer>
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
                { mostRecentActivity.map(renderActivity) }
                <SeeMore />
            </RowContainer>
        </Fragment>
    )
}