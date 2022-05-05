import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, TouchableOpacity, View } from 'react-native';
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

const { width } = Dimensions.get('window');

const GRID_PADDING = 16;
const GRID_WIDTH = width - (2 * GRID_PADDING);
const GRID_HALF_MARGIN = 8;
const GRID_ROW_LENGTH = 4;
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
    color: white;
    margin-top: 4px;
`
const CreateClubGradient = styled(LinearGradient)`
    align-items: center;
    border-radius: ${CLUB_BUTTON_SIZE/2}px;
    height: ${CLUB_BUTTON_SIZE}px;
    justify-content: center;
    width: ${CLUB_BUTTON_SIZE}px;
`
const MyClubsScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const ClubButton = ({ navigation }) => {

}

const ClubButtonGrid = ({ children }) => {
    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <ClubGridContainer>
                { children }
            </ClubGridContainer>
        </ScrollView>
    );
}

const CreateClubButton = ({ navigation }) => {
    const advanceToCreateClub = () => {};
    return (
        <ClubButtonPressable onPress={advanceToCreateClub}>
            <CreateClubGradient colors={['#2977EF', '#FF4848']}>
                <Icon type='ionicon' name='add' size={CLUB_BUTTON_SIZE * 0.6} color='white' />
            </CreateClubGradient>
            <ClubTitleText>{'Create Club'}</ClubTitleText>
        </ClubButtonPressable>
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

export default MyClubsScreen = ({ navigation, route }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();

    useEffect(() => {
        logAmplitudeEventProd('openMyClubs', {
            username: reelayDBUser?.username,
            userSub: reelayDBUser?.sub,
        });
    }, [navigation]);

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    })

    if (reelayDBUser?.username === 'be_our_guest') {
        return <JustShowMeSignupPage navigation={navigation} headerText='My Clubs' />
    }

    return (
		<MyClubsScreenContainer>
            <BaseHeader text={'My Clubs'} />
            <ClubButtonGrid>
                <CreateClubButton navigation={navigation} />
                <MyWatchlistButton navigation={navigation} />
            </ClubButtonGrid>
		</MyClubsScreenContainer>
	);
};
