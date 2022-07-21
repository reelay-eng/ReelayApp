import React, { Fragment, useContext, useEffect, useState } from 'react';
import { RefreshControl, SafeAreaView, TouchableOpacity, View } from 'react-native';
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
import ClubActivityCard from '../../components/clubs/ClubActivityCard';
import {  getAllMyClubActivities } from '../../api/ClubsApi';
import { showErrorToast } from '../../components/utils/toasts';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCircle, faChevronRight, faUsersViewfinder } from '@fortawesome/free-solid-svg-icons';
import { sortByLastActivity } from '../../redux/reducers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ReelayColors from '../../constants/ReelayColors';
import Constants from 'expo-constants';
import moment from 'moment';

const ACTIVITY_PAGE_SIZE = 20;
const CLUB_PIC_SIZE = 72;
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

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
const AddClubIconView = styled(View)`
    align-items: center;
    justify-content: center;
    height: ${CLUB_PIC_SIZE}px;
    width: ${CLUB_PIC_SIZE}px;
`
const ButtonView = styled(TouchableOpacity)`
    align-items: center;
    justify-content: center;
    height: 44px;
    width: 37.5%;
`
const ClubNameText = styled(ReelayText.H6Emphasized)`
    color: white;
    padding-bottom: 2px;
`
const ClubDescriptionText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    line-height: 18px;
    opacity: 0.6;
`
const ClubMemberCountText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    line-height: 18px;
    margin-top: 4px;
    opacity: 0.4;
`
const ClubRowArrowView = styled(View)`
    align-items: center;
    flex-direction: row;
    padding: 11px;
`
const ClubRowArrowSpacer = styled(View)`
    width: 5px;
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
    display: flex;
    flex: 1;
    padding-left: 12px;
    padding-right: 12px;
`
const ClubRowUnreadView = styled(View)`
    align-items: center;
    flex-direction: row;
    padding: 7px;
`
const ClubRowUnreadIndicator = styled(View)`
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 10px;
    height: 10px;
    width: 10px;
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
const TopRightButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    justify-content: center;
    margin-right: 10px;
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
    margin: 10px;
    padding-top: 0px;
`
const TopBarButtonView = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-right: -5px;
`
const UnreadIconIndicator = styled(View)`
	background-color: ${ReelayColors.reelayBlue}
	border-radius: 5px;
	height: 10px;
	width: 10px;
	position: absolute;
    top: 0px;
	right: 0px;
`

export default MyClubsScreen = ({ navigation, route }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);

    const authSession = useSelector(state => state.authSession);
    const dispatch = useDispatch();
    const bottomOffset = useSafeAreaInsets().bottom;

    const [selectedTab, setSelectedTab] = useState('recent activity');

    const renderActivity = (activity) => {
        return <ClubActivityCard key={activity.id} activity={activity} navigation={navigation} />
    }
    
    const onRefresh = async () => {
        // try {
        //     setRefreshing(true);
        //     const nextMyClubs = await getAllMyClubActivities({ authSession, reqUserSub: reelayDBUser?.sub });
        //     dispatch({ type: 'setMyClubs', payload: nextMyClubs });
        //     setRefreshing(false);
        // } catch (error) {
        //     console.log(error);
        //     showErrorToast('Ruh roh! Could not refresh clubs. Try again?');
        //     setRefreshing(false);
        // }
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

    const AllMyClubs = () => {
        const myClubs = useSelector(state => state.myClubs);
        const mySortedClubs = myClubs.sort(sortByLastActivity);
        const [displayClubs, setDisplayClubs] = useState(mySortedClubs);
        const [selectedFilters, setSelectedFilters] = useState(['all']);

        const filterPublicClubs = (club) => (club?.visibility === FEED_VISIBILITY);
        const filterPrivateClubs = (club) => (club?.visibility === 'private');
        const oneWeekAgo = moment().subtract(7, 'days');
        const filterLast7Days = (club) => {
            try {
                const diff = moment(club?.lastActivityAt).diff(oneWeekAgo);
                return diff > 0;
            } catch (error) {
                // todo: should keep or remove if no activity?
                return true;
            };
        }    
    
        const selectOrDeselectFilter = (filter) => {
            const foundFilter = selectedFilters.find(nextFilter => nextFilter === filter);
            if (foundFilter) {
                // remove the filter
                switch (filter) {
                    case 'all':
                        // do nothing
                        break;
                    default:
                        // set as all
                        setSelectedFilters(['all']);
                        setDisplayClubs(mySortedClubs);
                        break;
                }
            } else {
                // add the filter
                switch (filter) {
                    case 'all':
                        setSelectedFilters(['all']);
                        setDisplayClubs(mySortedClubs);
                        break;
                    case 'public':
                        const publicClubs = mySortedClubs.filter(filterPublicClubs);
                        setDisplayClubs(publicClubs);
                        setSelectedFilters(['public']);
                        break;
                    case 'private':
                        const privateClubs = mySortedClubs.filter(filterPrivateClubs);
                        setDisplayClubs(privateClubs);
                        setSelectedFilters(['private']);
                        break;
                    case 'new activity':
                        const newActivityClubs = mySortedClubs.filter(filterLast7Days);
                        setDisplayClubs(newActivityClubs);
                        setSelectedFilters(['new activity']);
                        break;
                    default:
                        break;
                }
            }
        }

        const MyClubsFilters = () => {
            const filters = ['all', 'public', 'private', 'new activity'];
            return (
                <FilterButtonRow>
                    { filters.map(filter => {
                        const isSelected = selectedFilters.includes(filter);
                        const onPress = () => selectOrDeselectFilter(filter);
                        return <FilterButton key={filter} filter={filter} onPress={onPress} selected={isSelected} />
                    })}
                </FilterButtonRow>
            );
        }

        const AddClubRow = ({ club }) => {
            const advanceToCreateClubScreen = () => navigation.push('CreateClubScreen');
            return (
                <ClubRowPressable onPress={advanceToCreateClubScreen}>
                    <AddClubIconView>
                        <FontAwesomeIcon icon={faUsersViewfinder} color='white' size={56} />
                    </AddClubIconView>
                    <ClubRowInfoView>
                        <ClubNameText>{'Create a club'}</ClubNameText>
                        <ClubDescriptionText numberOfLines={2}>{'Make a group for private reelays and invite your friends'}</ClubDescriptionText>
                    </ClubRowInfoView>
                    <ClubRowArrowView>
                        <Icon type='ionicon' name='add-circle-outline' color='white' size={28} />
                    </ClubRowArrowView>
                </ClubRowPressable>
            );
        }

        const ClubRow = ({ club }) => {
            const memberCount = club.memberCount ?? club.members?.length;
            const memberText = `${memberCount} member${memberCount !== 1 ? 's' : ''}`;
            const lastActivityAt = club.lastActivityAt ?? null;

            const matchClubMember = (nextMember) => nextMember?.userSub === reelayDBUser?.sub
            const clubMember = club.members.find(matchClubMember);
            const lastActivitySeenAt = clubMember?.lastActivitySeenAt ?? null;

            const getInitMarkUnread = () => {
                if (lastActivityAt && lastActivitySeenAt) {
                    try {
                        const dateDiff = moment(lastActivityAt).diff(moment(lastActivitySeenAt), 'seconds');
                        return (dateDiff > 0);
                    } catch (error) {
                        console.log(error);
                    }    
                } else {
                    return false;
                }
            }

            const [markUnread, setMarkUnread] = useState(getInitMarkUnread());

            const advanceToClubActivityScreen = () => {
                if (markUnread) setMarkUnread(false);
                navigation.push('ClubActivityScreen', { club });
            }
            
            return (
                <ClubRowPressable onPress={advanceToClubActivityScreen}>
                    <ClubPicture club={club} size={CLUB_PIC_SIZE} />
                    <ClubRowInfoView>
                        <ClubNameText>{club?.name}</ClubNameText>
                        { club.description?.length > 0 && (
                            <ClubDescriptionText numberOfLines={2}>{club.description}</ClubDescriptionText>
                        )}
                        <ClubMemberCountText>{memberText}</ClubMemberCountText>
                    </ClubRowInfoView>
                    { markUnread && (
                        <ClubRowUnreadView>
                            <ClubRowUnreadIndicator />
                        </ClubRowUnreadView>
                    )}
                    <ClubRowArrowView>
                        <FontAwesomeIcon icon={faChevronRight} color='white' size={18} />
                        <ClubRowArrowSpacer />
                    </ClubRowArrowView>
                </ClubRowPressable>
            );
        }

        const MyWatchlistRow = () => {
            const advanceToWatchlistScreen = () => navigation.push('WatchlistScreen');
            const myWatchlistItems = useSelector(state => state.myWatchlistItems);
            const watchlistCount = myWatchlistItems.filter(item => item?.hasAcceptedRec)?.length;
            const watchistText = `${watchlistCount} title${(watchlistCount === 1) ? '' : 's'}`;

            return (
                <ClubRowPressable onPress={advanceToWatchlistScreen}>
                    <View pointerEvents='none'>
                        <ProfilePicture user={reelayDBUser} size={CLUB_PIC_SIZE} />
                    </View>
                    <ClubRowInfoView>
                        <ClubNameText>{'My Watchlist'}</ClubNameText>
                        <ClubDescriptionText numberOfLines={2}>{watchistText}</ClubDescriptionText>
                    </ClubRowInfoView>
                    <ClubRowArrowView>
                        <FontAwesomeIcon icon={faChevronRight} color='white' size={18} />
                        <ClubRowArrowSpacer />
                    </ClubRowArrowView>
                </ClubRowPressable>
            );
        }

        const MyClubsList = () => {
            const scrollStyle = { alignItems: 'center', paddingBottom: 120, width: '100%' };
            return (
                <ScrollView
                    bottomOffset={bottomOffset} 
                    contentContainerStyle={scrollStyle}
                    showsVerticalScrollIndicator={false}
                >
                    { selectedFilters.includes('all') && (
                        <Fragment>
                            <AddClubRow />
                            <MyWatchlistRow />
                        </Fragment>
                    )}
                    { displayClubs.map(club => <ClubRow club={club} key={club?.id} />) }
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

    const FilterButton = ({ filter, onPress, selected = false }) => {
        return (
            <FilterButtonPressable key={filter} onPress={onPress} selected={selected}>
                <FilterButtonText>
                    { filter }
                </FilterButtonText>
            </FilterButtonPressable>
        );
    }

    const NotificationButton = () => {
        const advanceToNotificationScreen = () => navigation.push('NotificationScreen');
        const myNotifications = useSelector(state => state.myNotifications);
        const hasUnreadNotifications = myNotifications.filter(({ seen }) => !seen).length > 0;

        return (
            <TopRightButtonPressable onPress={advanceToNotificationScreen}>
                <Icon type='ionicon' size={27} color={'white'} name='notifications' />
                { hasUnreadNotifications && <UnreadIconIndicator /> }
            </TopRightButtonPressable>
        )
    }

    const RecentActivity = () => {
        const [selectedFilters, setSelectedFilters] = useState(['all']);
        const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;
        const scrollStyle = { alignItems: 'center', paddingBottom: 120, width: '100%' };

        const myClubActivities = useSelector(state => state.myClubActivities);
        const filterMemberActivities = (nextActivity, index) => (nextActivity?.activityType !== 'member');
        const shouldRenderActivity = (activity, index) => index < (page + 1) * ACTIVITY_PAGE_SIZE;
        const initDisplayActivities = myClubActivities.filter(filterMemberActivities).filter(shouldRenderActivity);;
        const [displayActivities, setDisplayActivities] = useState(initDisplayActivities);
    
        const columnA = displayActivities.filter((activity, index) => index % 2 === 0);
        const columnB = displayActivities.filter((activity, index) => index % 2 === 1);    

        const ActivityStainedGlass = () => {
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
            )
        }

        const RecentActivityFilters = () => {
            const filters = ['all', 'reelays', 'titles', 'topics'];
            return (
                <FilterButtonRow>
                    { filters.map(filter => {
                        const isSelected = selectedFilters.includes(filter);
                        const onPress = () => selectOrDeselectFilter(filter);
                        return <FilterButton key={filter} filter={filter} onPress={onPress} selected={isSelected} />
                    })}
                </FilterButtonRow>
            );
        }

        const selectOrDeselectFilter = (filter) => {
            const foundFilter = selectedFilters.find(nextFilter => nextFilter === filter);
            if (foundFilter) {
                // remove the filter
                switch (filter) {
                    case 'all':
                        // do nothing
                        break;
                    default:
                        // set as all
                        setSelectedFilters(['all']);
                        setDisplayActivities(initDisplayActivities);
                        break;
                }
            } else {
                // add the filter
                switch (filter) {
                    case 'all':
                        setSelectedFilters(['all']);
                        setDisplayActivities(initDisplayActivities);
                        break;
                    case 'reelays':
                        setSelectedFilters(['reelays']);
                        const hasReelays = (activity) => activity?.reelays?.length > 0;
                        setDisplayActivities(initDisplayActivities.filter(hasReelays));
                        break;
                    case 'titles':
                        const isTitle = (activity) => activity?.activityType === 'title';
                        setSelectedFilters(['titles']);
                        setDisplayActivities(initDisplayActivities.filter(isTitle));
                        break;
                    case 'topics':
                        const isTopic = (activity) => activity?.activityType === 'topic';
                        setDisplayActivities(initDisplayActivities.filter(isTopic));
                        setSelectedFilters(['topics']);
                        break;
                    default:
                        break;
                }
            }
        }

        return (
            <Fragment>
                <RecentActivityFilters />
                <ActivityStainedGlass />
            </Fragment>
        );
    }

    const SearchButton = () => {
        const advanceToSearchScreen = () => navigation.push('SearchScreen', { initialSearchType: 'Clubs' });
        return (
            <TopRightButtonPressable onPress={advanceToSearchScreen}>
                <Icon type='ionicon' size={27} color={'white'} name='search' />
            </TopRightButtonPressable>
        )
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
                <TopBarButtonView>
                    <SearchButton />
                    <NotificationButton />
                </TopBarButtonView>
            </TopBarView>
            <TabSelector />
            { selectedTab === 'recent activity' && <RecentActivity /> }
            { selectedTab === 'all my clubs' && <AllMyClubs /> }
            <BottomGradient colors={["transparent", "#0d0d0d"]} locations={[0.08, 1]} />
		</MyClubsScreenView>
	);
};
