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
    justify-content: center;
    width: 100%;
`
const ClubTitleText = styled(ReelayText.Caption)`
    align-items: center;
    color: white;
    display: flex;
    flex-direction: row;
    flex: 1;
    font-size: 14px;
    padding: 4px;
    padding-left: 0px;
    padding-right: 0px;
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
const OverlineContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-bottom: 4px;
    margin-left: 4px;
    width: 100%;
`
const OverlineText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
    margin-left: 6px;
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
const YearVenueContainer = styled(View)`
    align-items: center;
    flex-direction: row;
`

const MAX_ACTIVITY_COUNT = 8;
const WELCOME_REELAY_SUB = Constants.manifest.extra.welcomeReelaySub;

const TitleOverline = ({ activity }) => {
    const { activityType, reelays, title } = activity;
    if (reelays.length > 0) {
        const { creator } = activity.reelays[0];
        const overlineText = `${creator.username} reelayed`;
        return (
            <OverlineContainer>
                <ProfilePicture user={creator} size={30} />
                <OverlineText>{overlineText}</OverlineText>
            </OverlineContainer>
        );
    } else {
        const creator = {
            sub: activity?.addedByUserSub,
            username: activity?.addedByUsername,
        }
        const overlineText = `${creator.username} added`;
        return (
            <OverlineContainer>
                <ProfilePicture user={creator} size={30} />
                <OverlineText>{overlineText}</OverlineText>
            </OverlineContainer>
        );
    }
}

const TitleUnderline = ({ clubID, reelays }) => {
    const reelayObj = reelays?.[0];
    if (reelayObj?.sub === WELCOME_REELAY_SUB) displayYear = '2022';
    const positionString = (reelays?.length > 1) 
            ? `${reelays?.length} reelays` 
        : (reelays?.length === 1)
            ? '1 reelay'
        : 'Title added';

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
                    <ClubTitleText>{club?.name}</ClubTitleText>
                    {/* <ClubTitleText>{positionString}</ClubTitleText> */}
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
                    <TitleText numberOfLines={2}>{displayTitle}</TitleText>
                    <TitleUnderline clubID={clubID} reelays={reelays} />
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
    const myClubActivities = useSelector(state => state.myClubActivities);

    const filterActivitiesToUniqueClubs = (nextActivity, index) => {
        const matchClubID = (activity) => (activity?.clubID === nextActivity?.clubID);
        return myClubActivities.findIndex(matchClubID) === index;
    }    

    const filterMemberActivities = (nextActivity) => (nextActivity?.activityType !== 'member');
    const uniqueActivity = myClubActivities.filter(filterActivitiesToUniqueClubs);
    const activityCount = uniqueActivity?.length;

    const showAllActivities = activityCount < MAX_ACTIVITY_COUNT;
    const maxDisplayIndex = showAllActivities ? activityCount : MAX_ACTIVITY_COUNT;
    const displayActivity = myClubActivities
        .filter(filterMemberActivities)
        .filter(filterActivitiesToUniqueClubs)
        .slice(0, maxDisplayIndex);

    const advanceToClubActivityScreen = (clubID) => {
        const club = myClubs.find(nextClub => nextClub?.id === clubID);
        if (!club) {
            showErrorToast('Ruh roh! Couldn`t load that page. Try again?');
            return;
        }
        navigation.navigate('ClubActivityScreen', { club });
    }

    const renderActivity = (activity) => {
        const { clubID, activityType, reelays, title } = activity;
        const onPress = () => advanceToClubActivityScreen(clubID);
        if (activityType === 'title') {
            return (
                <BannerContainer key={`${clubID}-${activity?.id}`}>
                    <TitleOverline activity={activity} />
                    <TitleBanner
                        clubActivity={activity}
                        clubID={clubID}
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

    const SeeMore = () => {
        const advanceToNewInMyClubsScreen = () => {
            navigation.push('NewInMyClubsScreen');
        }
        return (
            <SeeMoreContainer onPress={advanceToNewInMyClubsScreen}>
                <SeeMoreText>{'See more'}</SeeMoreText>
                <FontAwesomeIcon icon={faChevronRight} size={16} color='white' />
            </SeeMoreContainer>
        );
    }

    return (
        <Fragment>
            <HeaderContainer>
                <FontAwesomeIcon icon={faAsterisk} color='white' size={24} />
                <HeaderText>{'In my clubs'}</HeaderText>
            </HeaderContainer>
            <RowContainer showsVerticalScrollIndicator={false}>
                { displayActivity.map(renderActivity) }
                <SeeMore />
            </RowContainer>
        </Fragment>
    )
}