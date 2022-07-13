import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, Image, RefreshControl, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
import { ClubActivityCard } from '../../components/home/InMyClubs';
import { getClubsMemberOf, getAllMyClubActivities, getClubTitles, getClubTopics, getClubMembers } from '../../api/ClubsApi';
import { showErrorToast } from '../../components/utils/toasts';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { sortByLastActivity } from '../../redux/reducers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const GRID_PADDING = 16;
const GRID_WIDTH = width - (2 * GRID_PADDING);
const GRID_HALF_MARGIN = 8;
const GRID_ROW_LENGTH = 3;
const CLUB_BUTTON_SIZE = (GRID_WIDTH / GRID_ROW_LENGTH) - (2 * GRID_HALF_MARGIN);

const ActiveOptionText = styled(ReelayText.H6)`
    color: white;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 2px;
`
const BackgroundBox = styled(View)`
    align-items: center;
    background-color: black;
    border-radius: 8px;
    justify-content: center;
    flex-direction: row;
    height: 48px;
    padding: 2px;
    width: 100%;
`
const ButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    justify-content: center;
    height: 44px;
    width: 37.5%;
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
const HeaderText = styled(ReelayText.H4Bold)`
    text-align: left;
    color: white;
    margin-top: 4px;
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
    border-radius: 16px;
    border-width: 1.4px;
    height: 32px;
    justify-content: center;
    margin-right: 4px;
    padding-left: 1px;
    width: 32px;
`
const OptionText = styled(ReelayText.H6)`
    color: gray;
    font-size: 18px;
`
const Spacer = styled(View)`
    height: 30px;
`
const TopBarContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding: 10px;
    padding: 10px;
    padding-top: 0px;
`

export default MyClubsScreen = ({ navigation, route }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);
    const authSession = useSelector(state => state.authSession);
    const dispatch = useDispatch();
    const bottomOffset = useSafeAreaInsets().bottom;

    const myClubActivities = useSelector(state => state.myClubActivities);
    const filterMemberActivities = (nextActivity) => (nextActivity?.activityType !== 'member');
    const displayActivities = myClubActivities.filter(filterMemberActivities);
    const columnA = displayActivities.filter((activity, index) => index % 2 === 0);
    const columnB = displayActivities.filter((activity, index) => index % 2 === 1);

    // const myClubs = useSelector(state => state.myClubs);
    // const mySortedClubs = myClubs.sort(sortByLastActivity);
    const [selectedTab, setSelectedTab] = useState('recent activity');

    const renderActivity = (activity) => {
        return <ClubActivityCard key={activity.id} activity={activity} navigation={navigation} />
    }
    
    const NewClubButton = () => {
        const advanceToCreateClub = async () => navigation.push('CreateClubScreen');
        return (
            <NewClubButtonPressable onPress={advanceToCreateClub}>
                <Icon type='ionicon' name='add' size={24} color='white' />
            </NewClubButtonPressable>
        );
    }

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            const nextMyClubs = await getAllMyClubActivities({ authSession, reqUserSub: reelayDBUser?.sub });
            // dispatch({ type: 'setMyClubs', payload: nextMyClubs });
            setRefreshing(false);
        } catch (error) {
            console.log(error);
            showErrorToast('Ruh roh! Could not refresh clubs. Try again?');
            setRefreshing(false);
        }
    }

    useEffect(() => {
        logAmplitudeEventProd('openedMyClubs', {
            username: reelayDBUser?.username,
            userSub: reelayDBUser?.sub,
        });
    }, [navigation]);

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    });

    if (reelayDBUser?.username === 'be_our_guest') {
        return <JustShowMeSignupPage navigation={navigation} headerText='clubs' />
    }

    const ActivityColumns = () => {
        const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;
        const scrollStyle = { alignItems: 'center', width: '100%' };
        return (
            <ScrollView 
                bottomOffset={bottomOffset} 
                contentContainerStyle={scrollStyle}
                showVerticalScrollIndicator={false}
                refreshControl={refreshControl}
            >
                <ColumnsContainer>
                    <ColumnContainer>
                        { columnA.map(renderActivity) }
                    </ColumnContainer>
                    <ColumnContainer>
                        { columnB.map(renderActivity) }
                    </ColumnContainer>
                </ColumnsContainer>
                <Spacer />
            </ScrollView>
        );
    }

    const TabSelector = () => {
        return (
            <BackgroundBox>
                { ['recent activity', 'all my clubs'].map(tab => {
                    if (tab === selectedTab) {
                        return (
                            <ButtonContainer key={tab}>
                                <ActiveOptionText>{tab}</ActiveOptionText>
                                <FontAwesomeIcon icon={faCircle} color='white' size={4} /> 
                            </ButtonContainer>
                        );
                    } else {
                        return (
                            <ButtonContainer key={tab} onPress={() => setSelectedTab(tab)}>
                                <OptionText>{tab}</OptionText>
                                <View style={{ height: 6 }} />
                            </ButtonContainer>
                        );
                    }
                })}
            </BackgroundBox>
        );
    }    


    return (
		<MyClubsScreenContainer>
            <TopBarContainer>
                <HeaderText>{'clubs'}</HeaderText>
                <NewClubButton />
            </TopBarContainer>
            <TabSelector />
            <ActivityColumns />
		</MyClubsScreenContainer>
	);
};
