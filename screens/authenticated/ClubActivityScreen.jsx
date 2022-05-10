import React, { useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import * as ReelayText from '../../components/global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import ClubBanner from '../../components/clubs/ClubBanner';
import ClubTitleCard from '../../components/clubs/ClubTitleCard';
import NoTitlesYetPrompt from '../../components/clubs/NoTitlesYetPrompt';

import { useDispatch } from 'react-redux';
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
    width: 100%;
`

export default ClubActivityScreen = ({ navigation, route }) => {
    const { club, promptToInvite } = route.params;
    const { reelayDBUser } = useContext(AuthContext);
    const topOffset = useSafeAreaInsets().top + 80;
    const bottomOffset = useSafeAreaInsets().bottom;
    const dispatch = useDispatch();
    const onGoBack = () => navigation.popToTop();

    const [clubMembers, setClubMembers] = useState([]);
    const [clubTitles, setClubTitles] = useState([]);
    const [inviteDrawerVisible, setInviteDrawerVisible] = useState(promptToInvite);
    const [refreshing, setRefreshing] = useState(false);
    const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={loadClubTitles} progressViewOffset={400} />;

    const loadClubTitles = async () => {
        try { 
            setRefreshing(true);
            const titles = await getClubTitles(club.id, reelayDBUser?.sub);
            setClubTitles(titles);   
            setRefreshing(false); 
        } catch (error) {
            console.log(error);
            showErrorToast('Ruh roh! Could not load club activity');
            setRefreshing(false);
        }
    }

    const loadMembers = async () => {
        const members = await getClubMembers(club.id, reelayDBUser?.sub);
        setClubMembers(members);
    }

    useEffect(() => {
        loadClubTitles();
        loadMembers();
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
                contentContainerStyle={{ alignItems: 'center' }}
                topOffset={topOffset} 
                refreshControl={refreshControl} 
                showsVerticalScrollIndicator={false}
            >
                { (!refreshing && !clubTitles?.length) && <NoTitlesYetPrompt /> } 
                { (clubTitles.length > 0 ) && clubTitles.map((clubTitle) => {
                    return <ClubTitleCard key={clubTitle.id} clubTitle={clubTitle} navigation={navigation} />;
                })}
            </ScrollContainer>
            <ClubBanner club={club} navigation={navigation} onGoBack={onGoBack} />
            <AddTitleButton />
            { inviteDrawerVisible && (
                <InviteMyFollowsDrawer 
                    clubMembers={clubMembers}
                    drawerVisible={inviteDrawerVisible}
                    provideSkipOption={true}
                    setDrawerVisible={setInviteDrawerVisible}
                />
            )}
        </ActivityScreenContainer>
    );
}