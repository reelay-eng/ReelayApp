import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, RefreshControl, SafeAreaView, TouchableOpacity, View } from 'react-native';
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
import { useFocusEffect } from '@react-navigation/native';
import ClubPicture from '../../components/global/ClubPicture';
import { ClubActivityCard } from '../../components/home/InMyClubs';
import {  getAllMyClubActivities } from '../../api/ClubsApi';
import { showErrorToast } from '../../components/utils/toasts';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { sortByLastActivity } from '../../redux/reducers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReelayColors from '../../constants/ReelayColors';

const { width } = Dimensions.get('window');

const ACTIVITY_PAGE_SIZE = 10;

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
const BackgroundView = styled(View)`
    align-items: center;
    background-color: black;
    border-radius: 8px;
    justify-content: center;
    flex-direction: row;
    height: 48px;
    padding: 2px;
    width: 100%;
`
const BottomGradient = styled(LinearGradient)`
    position: absolute;
    bottom: 0px;
    opacity: 0.8;
    height: 40px;
    width: 100%;
`
const ButtonView = styled(TouchableOpacity)`
    align-items: center;
    justify-content: center;
    height: 44px;
    width: 37.5%;
`
const ClubNameText = styled(ReelayText.H6)`
    color: white;
`
const ClubDescriptionText = styled(ReelayText.CaptionEmphasized)`
    color: #ffffff;
    opacity: 0.5;
`
const ClubRowPressable = styled(TouchableOpacity)`
    align-items: center;
    flex-direction: row;
    margin: 16px;
    margin-top: 10px;
    margin-bottom: 10px;
    width: 100%;
`
const ClubRowInfoView = styled(View)`
    margin-left: 12px;
`
const ColumnsView = styled(View)`
    flex-direction: row;
    width: 100%;
`
const ColumnView = styled(View)`
    display: flex;
    flex: 1;
    width: 50%;
`
const FilterButtonPressable = styled(TouchableOpacity)`
    background-color: ${props => props.selected 
        ? ReelayColors.reelayBlue 
        : 'rgba(255, 255, 255, 0.1)'
    };
    border-radius: 8px;
    margin-right: 8px;
    padding-left: 8px;
    padding-right: 8px;
    padding-top: 2px;
    padding-bottom: 2px;
`
const FilterButtonText = styled(ReelayText.Subtitle2)`
    color: white;
`
const FilterButtonRow = styled(View)`
    align-items: center;
    flex-direction: row;
    margin: 16px;
`
const HeaderText = styled(ReelayText.H4Bold)`
    text-align: left;
    color: white;
    margin-top: 4px;
`
const MyClubsScreenView = styled(View)`
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
const TopBarView = styled(SafeAreaView)`
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
    const [page, setPage] = useState(0);

    const authSession = useSelector(state => state.authSession);
    const dispatch = useDispatch();
    const bottomOffset = useSafeAreaInsets().bottom;

    const myClubActivities = useSelector(state => state.myClubActivities);
    const filterMemberActivities = (nextActivity, index) => (nextActivity?.activityType !== 'member' && shouldRenderActivity(index));
    const shouldRenderActivity = (index) => index < (page + 1) * ACTIVITY_PAGE_SIZE;
    const displayActivities = myClubActivities.filter(filterMemberActivities);

    const columnA = displayActivities.filter((activity, index) => index % 2 === 0);
    const columnB = displayActivities.filter((activity, index) => index % 2 === 1);

    const myClubs = useSelector(state => state.myClubs);
    const mySortedClubs = myClubs.sort(sortByLastActivity);
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

    const RecentActivity = () => {
        const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;
        const scrollStyle = { alignItems: 'center', paddingBottom: 210, width: '100%' };
        return (
            <ScrollView 
                bottomOffset={bottomOffset} 
                contentContainerStyle={scrollStyle}
                showVerticalScrollIndicator={false}
                refreshControl={refreshControl}
            >
                <ColumnsView>
                    <ColumnView>
                        { columnA.map(renderActivity) }
                    </ColumnView>
                    <ColumnView>
                        { columnB.map(renderActivity) }
                    </ColumnView>
                </ColumnsView>
                <Spacer />
            </ScrollView>
        );
    }

    const FilterButton = ({ filter, onPress, selected = false }) => {
        return (
            <FilterButtonPressable key={filter} onPress={onPress} selected={selected}>
                <FilterButtonText>
                    { filter }
                </FilterButtonText>
            </FilterButtonPressable>
        );
    }

    const AllMyClubs = () => {
        const [selectedFilters, setSelectedFilters] = useState([]);
        const selectOrDeselectFilter = (filter) => {
            const foundFilter = selectedFilters.find(nextFilter => nextFilter === filter);
            if (foundFilter) {
                setSelectedFilters(selectedFilters.filter(nextFilter => nextFilter !== filter));
            } else {
                setSelectedFilters([...selectedFilters, filter ]);
            }
        }

        useEffect(() => {
            console.log('selected filters: ', selectedFilters);
        }, [selectedFilters]);

        const MyClubsFilters = () => {
            const filters = ['all', 'public', 'private', 'new activity'];
            return (
                <FilterButtonRow>
                    { filters.map(filter => {
                        const isSelected = selectedFilters.includes(filter);
                        const onPress = () => selectOrDeselectFilter(filter);
                        return <FilterButton filter={filter} onPress={onPress} selected={isSelected} />
                    })}
                </FilterButtonRow>
            );
        }

        const ClubRow = ({ club }) => {
            const advanceToClubActivityScreen = () => navigation.push('ClubActivityScreen', { club });
            return (
                <ClubRowPressable onPress={advanceToClubActivityScreen}>
                    <ClubPicture club={club} size={64} />
                    <ClubRowInfoView>
                        <ClubNameText>{club?.name}</ClubNameText>
                        <ClubDescriptionText>{club?.description}</ClubDescriptionText>
                    </ClubRowInfoView>
                </ClubRowPressable>
            );
        }

        const MyClubsList = () => {
            const scrollStyle = { alignItems: 'center', paddingBottom: 300, width: '100%' };
            return (
                <ScrollView
                    bottomOffset={bottomOffset} 
                    contentContainerStyle={scrollStyle}
                    showsVerticalScrollIndicator={false}
                >
                    { mySortedClubs.map(club => <ClubRow club={club} />) }
                </ScrollView>
            );
        }

        return (
            <Fragment>
                <MyClubsFilters />
                <MyClubsList />
            </Fragment>
        );
    }

    const TabSelector = () => {
        return (
            <BackgroundView>
                { ['recent activity', 'all my clubs'].map(tab => {
                    if (tab === selectedTab) {
                        return (
                            <ButtonView key={tab}>
                                <ActiveOptionText>{tab}</ActiveOptionText>
                                <FontAwesomeIcon icon={faCircle} color='white' size={4} /> 
                            </ButtonView>
                        );
                    } else {
                        return (
                            <ButtonView key={tab} onPress={() => setSelectedTab(tab)}>
                                <OptionText>{tab}</OptionText>
                                <View style={{ height: 6 }} />
                            </ButtonView>
                        );
                    }
                })}
            </BackgroundView>
        );
    }    


    return (
		<MyClubsScreenView>
            <TopBarView>
                <HeaderText>{'clubs'}</HeaderText>
                <NewClubButton />
            </TopBarView>
            <TabSelector />
            <View>
                { selectedTab === 'recent activity' && <RecentActivity /> }
                { selectedTab === 'all my clubs' && <AllMyClubs /> }
                {/* <RecentActivity />
                <AllMyClubs /> */}
            </View>
            <BottomGradient colors={["transparent", "#0d0d0d"]} locations={[0.08, 1]} />
		</MyClubsScreenView>
	);
};
