import React, { useContext } from 'react';
import styled from 'styled-components';
import * as ReelayText from "../global/Text";
import { Image, Pressable, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';

import ReelayColors from '../../constants/ReelayColors';
import Constants from 'expo-constants';
import { getReelay, prepareReelay } from '../../api/ReelayDBApi';
import { useSelector } from 'react-redux';
import moment from 'moment';

const HeaderContainer = styled(View)`
    padding-left: 15px;
    padding-right: 15px;
    padding-bottom: 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`;
const HeaderContainerLeft = styled(View)`
    align-items: center;
    flex-direction: row;
`;
const HeaderContainerRight = styled(View)`
    display: flex;
    flex-direction: row;
`
const HeaderText = styled(ReelayText.H4Bold)`
    text-align: left;
    color: white;
    margin-top: 4px;
`
const IconContainer = styled(TouchableOpacity)`
    margin-left: 10px;
`
const TutorialButtonContainer = styled(Pressable)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 6px;
    flex-direction: row;
    margin-left: 12px;
    padding: 4px;
`
const TutorialButtonText = styled(ReelayText.CaptionEmphasized)`
    margin-left: 6px;
    color: white;
`
const UnreadIconIndicator = styled(View)`
    background-color: ${ReelayColors.reelayBlue}
    border-radius: 5px;
    height: 10px;
    width: 10px;
    position: absolute;
    right: 0px;
`

const HomeHeader = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const latestAnnouncement = useSelector(state => state.latestAnnouncement);
    const myNotifications = useSelector(state => state.myNotifications);
    const myFollowing = useSelector(state => state.myFollowing);
    const hasUnreadNotifications = myNotifications.filter(({ seen }) => !seen).length > 0;

    const showLatestAnnouncement = (latestAnnouncement && !latestAnnouncement?.error)
    const daysSinceSignedUp = moment().diff(moment(reelayDBUser?.createdAt), 'days');
    const showTutorialButton = (!showLatestAnnouncement) && (myFollowing.length > 0) && (daysSinceSignedUp < 7);

    const advanceToMyNotifications = () => navigation.push('NotificationScreen');
    const advanceToSearchScreen = () => navigation.push('SearchScreen');

	return (
        <HeaderContainer>
            <HeaderContainerLeft>
                <HeaderText>{'reelay'}</HeaderText>
                { showLatestAnnouncement && <WatchAnnouncementButton navigation={navigation} announcement={latestAnnouncement} /> }
                { showTutorialButton && <WatchTutorialButton navigation={navigation} /> }
            </HeaderContainerLeft>
            <HeaderContainerRight>
                <IconContainer onPress={advanceToSearchScreen}>
                    <Icon type='ionicon' size={27} color={'white'} name='search' />
                </IconContainer>
                <IconContainer onPress={advanceToMyNotifications}>
                    <Icon type='ionicon' size={27} color={'white'} name='notifications' />
                    { hasUnreadNotifications && <UnreadIconIndicator /> }
                </IconContainer>
            </HeaderContainerRight>
        </HeaderContainer>
	);
};

const WatchAnnouncementButton = ({ navigation, announcement }) => {
    const { reelaySub, title } = announcement;

    const loadAnnouncementVideoScreen = async () => {
        const announcementReelay = await getReelay(reelaySub);
        const preparedReelay = await prepareReelay(announcementReelay);
        navigation.push('SingleReelayScreen', { preparedReelay });
    }
    return (
        <TutorialButtonContainer onPress={loadAnnouncementVideoScreen}>
            <TutorialButtonText>{title}</TutorialButtonText>
            <IconContainer>
                <Icon type='ionicon' size={24} color={'white'} name='play-circle' />
            </IconContainer>
        </TutorialButtonContainer>
    );
}

const WatchTutorialButton = ({ navigation }) => {
    const loadWelcomeVideoScreen = async () => {
        const welcomeReelaySub = Constants.manifest.extra.welcomeReelaySub;
        const welcomeReelay = await getReelay(welcomeReelaySub, 'dev');
        const preparedReelay = await prepareReelay(welcomeReelay);
        navigation.push('SingleReelayScreen', { preparedReelay });
    }
    return (
        <TutorialButtonContainer onPress={loadWelcomeVideoScreen}>
            <TutorialButtonText>{'Welcome'}</TutorialButtonText>
            <IconContainer>
                <Icon type='ionicon' size={24} color={'white'} name='play-circle' />
            </IconContainer>
        </TutorialButtonContainer>
    );
}

export default HomeHeader;