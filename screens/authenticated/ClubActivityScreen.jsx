import React, { useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import * as ReelayText from '../../components/global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import ClubBanner from '../../components/clubs/ClubBanner';
import ClubTitleCard from '../../components/clubs/ClubTitleCard';
import NoTitlesYetPrompt from '../../components/clubs/NoTitlesYetPrompt';

import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { getClubMembers, getClubTitles } from '../../api/ClubsApi';
import { AuthContext } from '../../context/AuthContext';
import { showErrorToast } from '../../components/utils/toasts';
import InviteMyFollowsDrawer from '../../components/clubs/InviteMyFollowsDrawer';

const { height, width } = Dimensions.get('window');

const ActivityScreenContainer = styled(View)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const AddTitleButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    flex-direction: row;
    justify-content: center;
    height: 40px;
    width: ${width - 32}px;
`
const AddTitleButtonOuterContainer = styled(View)`
    align-items: center;
    bottom: ${(props) => props.bottomOffset ?? 0}px;
    position: absolute;
    width: 100%;
`
const AddTitleButtonText = styled(ReelayText.Subtitle2)`
    color: white;
    margin-left: 4px;
`
const ScrollContainer = styled(ScrollView)`
    top: ${(props) => props.topOffset}px;
    height: ${(props) => height - props.topOffset}px;
    margin-bottom: ${(props) => props.bottomOffset}px;
    width: 100%;
`

export default ClubActivityScreen = ({ navigation, route }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const { clubID, promptToInvite } = route.params;
    const myClubs = useSelector(state => state.myClubs);
    const club = myClubs.find(nextClub => nextClub.id === clubID);
    const [inviteDrawerVisible, setInviteDrawerVisible] = useState(promptToInvite);

    const dispatch = useDispatch();
    const onGoBack = () => navigation.popToTop();
    const topOffset = useSafeAreaInsets().top + 80;
    const bottomOffset = useSafeAreaInsets().bottom;

    const [refreshing, setRefreshing] = useState(false);
    const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;
    const onRefresh = async () => {
        try { 
            setRefreshing(true);
            const [titles, members] = await Promise.all([
                getClubTitles(club.id, reelayDBUser?.sub),
                getClubMembers(club.id, reelayDBUser?.sub),
            ]);
            club.titles = titles;
            club.members = members;
            dispatch({ type: 'setMyClubs', payload: myClubs });
            setRefreshing(false); 
        } catch (error) {
            console.log(error);
            showErrorToast('Ruh roh! Could not load club activity');
            setRefreshing(false);
        }
    }

    useEffect(() => {
        if (!club.members?.length || !club.titles?.length) {
            onRefresh();
        }
    }, []);

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });

    const AddTitleButton = () => {
        const advanceToAddTitleScreen = () => navigation.push('ClubAddTitleScreen', { club });
        return (
            <AddTitleButtonOuterContainer bottomOffset={bottomOffset}>
                <AddTitleButtonContainer onPress={advanceToAddTitleScreen}>
                    <Icon type='ionicon' name='add-circle-outline' size={16} color='white' />
                    <AddTitleButtonText>{'Add a title'}</AddTitleButtonText>
                </AddTitleButtonContainer>
            </AddTitleButtonOuterContainer>
        );
    }

    return (
        <ActivityScreenContainer>
            <ScrollContainer 
                contentContainerStyle={{ alignItems: 'center', paddingBottom: 180 }}
                topOffset={topOffset} 
                bottomOffset={bottomOffset}
                refreshControl={refreshControl} 
                showsVerticalScrollIndicator={false}
            >
                { (!refreshing && !club.titles?.length) && <NoTitlesYetPrompt /> } 
                { (club.titles.length > 0 ) && club.titles.map((clubTitle) => {
                    // const matchClubTitle = (nextClubTitle) => (nextClubTitle.id === clubTitle.id);
                    // const clubFeedIndex = clubTitlesWithReelays.findIndex(matchClubTitle);
                    return (
                        <ClubTitleCard 
                            key={clubTitle.id} 
                            club={club}
                            clubTitle={clubTitle} 
                            navigation={navigation} 
                        />);
                })}
            </ScrollContainer>
            <ClubBanner club={club} navigation={navigation} onGoBack={onGoBack} />
            <AddTitleButton />
            { inviteDrawerVisible && (
                <InviteMyFollowsDrawer 
                    club={club}
                    drawerVisible={inviteDrawerVisible}
                    setDrawerVisible={setInviteDrawerVisible}
                    onRefresh={onRefresh}
                    provideSkipOption={true}
                />
            )}
        </ActivityScreenContainer>
    );
}