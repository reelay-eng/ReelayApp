import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, Image, RefreshControl, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { BaseHeader } from '../../components/global/Headers'
import JustShowMeSignupPage from '../../components/global/JustShowMeSignupPage';
import { AuthContext } from '../../context/AuthContext';

import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import styled from 'styled-components/native';
import * as ReelayText from '../../components/global/Text';
import { Icon } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import ProfilePicture from '../../components/global/ProfilePicture';
import { ScrollView } from 'react-native-gesture-handler';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import ClubPicture from '../../components/global/ClubPicture';
import { getClubsMemberOf } from '../../api/ClubsApi';
import { showErrorToast } from '../../components/utils/toasts';

const { width } = Dimensions.get('window');

const GRID_PADDING = 16;
const GRID_WIDTH = width - (2 * GRID_PADDING);
const GRID_HALF_MARGIN = 8;
const GRID_ROW_LENGTH = 3;
const CLUB_BUTTON_SIZE = (GRID_WIDTH / GRID_ROW_LENGTH) - (2 * GRID_HALF_MARGIN);

const ClubButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    padding: ${GRID_HALF_MARGIN}px;
`
const ClubGridContainer = styled(View)`
    flex-direction: row;
    flex-wrap: wrap;
    padding: ${GRID_PADDING}px;
    width: 100%;
`
const ClubTitleText = styled(ReelayText.Body2)`
    text-align: center;
    color: white;
    margin-top: 4px;
    width: ${CLUB_BUTTON_SIZE}px;
`
const CreateClubGradient = styled(LinearGradient)`
    align-items: center;
    border-radius: ${CLUB_BUTTON_SIZE/2}px;
    height: ${CLUB_BUTTON_SIZE}px;
    justify-content: center;
    padding-left: 2px;
    padding-top: 2px;
    width: ${CLUB_BUTTON_SIZE}px;
`
const HeaderText = styled(ReelayText.H5Emphasized)`
    color: white;
    margin-top: 4px;
    text-align: left;
`
const MyClubsScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const NewClubButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: black;
    border-color: white;
    border-radius: 12px;
    border-width: 1.4px;
    height: 32px;
    justify-content: center;
    width: 40px;
`
const TopBarContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding: 20px;
`

export default MyClubsScreen = ({ navigation, route }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);
    const authSession = useSelector(state => state.authSession);
    const myClubs = useSelector(state => state.myClubs);
    const dispatch = useDispatch();

    const ClubButton = ({ club }) => {
        const advanceToClubScreen = () => navigation.push('ClubActivityScreen', { club, promptToInvite: false });
        const advanceToJoinScreen = () => navigation.push('ClubAcceptInviteScreen', { inviteCode: 'htsbq' });
        return (
            <ClubButtonPressable onPress={advanceToClubScreen}>
                <ClubPicture club={club} size={CLUB_BUTTON_SIZE} />
                <ClubTitleText>{club.name}</ClubTitleText>
            </ClubButtonPressable>
        );
    }

    const ClubButtonGrid = ({ children }) => {
        const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        return (
            <ScrollView refreshControl={refreshControl} showsVerticalScrollIndicator={false}>
                <ClubGridContainer>
                    { children }
                </ClubGridContainer>
            </ScrollView>
        );
    }    
    
    const CreateClubButton = () => {
        const advanceToCreateClub = async () => navigation.push('CreateClubScreen');
        return (
            <ClubButtonPressable onPress={advanceToCreateClub}>
                <CreateClubGradient colors={['#2977EF', '#FF4848']}>
                    <Icon type='ionicon' name='add' size={CLUB_BUTTON_SIZE * 0.6} color='white' />
                </CreateClubGradient>
                <ClubTitleText>{'Create Club'}</ClubTitleText>
            </ClubButtonPressable>
        );
    }

    const NewClubButton = () => {
        const advanceToCreateClub = async () => navigation.push('CreateClubScreen');
        return (
            <NewClubButtonPressable onPress={advanceToCreateClub}>
                <Icon type='ionicon' name='add' size={24} color='white' />
            </NewClubButtonPressable>
        );
    }
    
    const MyWatchlistButton = ({ navigation }) => {
        const { reelayDBUser } = useContext(AuthContext);
        const advanceToMyWatchlist = () => navigation.push('WatchlistScreen');
        return (
            <ClubButtonPressable onPress={advanceToMyWatchlist}>
                <TouchableWithoutFeedback>
                    <ProfilePicture user={reelayDBUser} size={CLUB_BUTTON_SIZE} />
                </TouchableWithoutFeedback>
                <ClubTitleText>{'My Watchlist'}</ClubTitleText>
            </ClubButtonPressable>
        );
    }

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            const nextMyClubs = await getClubsMemberOf({ authSession, userSub: reelayDBUser?.sub });
            dispatch({ type: 'setMyClubs', payload: nextMyClubs });
            setRefreshing(false);    
        } catch (error) {
            showErrorToast('Ruh roh! Could not refresh clubs. Try again?');
            setRefreshing(false);
        }
    }

    useEffect(() => {
        logAmplitudeEventProd('openMyClubs', {
            username: reelayDBUser?.username,
            userSub: reelayDBUser?.sub,
        });
    }, [navigation]);

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    });

    if (reelayDBUser?.username === 'be_our_guest') {
        return <JustShowMeSignupPage navigation={navigation} headerText='My Clubs' />
    }

    return (
		<MyClubsScreenContainer>
            <TopBarContainer>
                <HeaderText>{'My Clubs'}</HeaderText>
                <NewClubButton />
            </TopBarContainer>
            <ClubButtonGrid>
                {/* <CreateClubButton /> */}
                <MyWatchlistButton />
                { myClubs.map(club => <ClubButton key={club.id} club={club} />) }
            </ClubButtonGrid>
		</MyClubsScreenContainer>
	);
};
