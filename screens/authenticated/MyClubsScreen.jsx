import React, { Fragment, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import JustShowMeSignupPage from '../../components/global/JustShowMeSignupPage';
import { AuthContext } from '../../context/AuthContext';

import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import styled from 'styled-components/native';
import * as ReelayText from '../../components/global/Text';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import ClubPicture from '../../components/global/ClubPicture';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronRight, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { sortByLastActivity } from '../../redux/reducers';

import ReelayColors from '../../constants/ReelayColors';
import Constants from 'expo-constants';
import moment from 'moment';
import EmptyClubsCard from '../../components/clubs/EmptyClubsCard';
import DiscoverClubs from '../../components/home/DiscoverClubs';
import { getAllClubsFollowing, searchPublicClubs } from '../../api/ClubsApi';
import SearchField from '../../components/create-reelay/SearchField';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CLUB_PIC_SIZE = 72;
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

const BottomGradient = styled(View)`
    position: absolute;
    background-color: black;
    bottom: 0px;
    height: ${props => props.bottomOffset + 52}px;
    width: 100%;
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
    margin: 12px;
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
const EmptyClubsView = styled(View)`
    align-items: center;
    display: flex;
    flex: 1;
    justify-content: center;
    width: 100%;
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
    margin: 12px;
`
const HeaderText = styled(ReelayText.H5Bold)`
    text-align: left;
    color: white;
    margin-top: 8px;
`
const MyClubsScreenView = styled(View)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const RefreshView = styled(MyClubsScreenView)`
    align-items: center;
    justify-content: center;
`
const SearchFieldOverlay = styled(TouchableOpacity)`
    height: 100%;
    position: absolute;
    width: 100%;
`
const SectionBodyText = styled(ReelayText.H6)`
    align-self: flex-start;
    color: white;
    font-size: 16px;
    margin: 12px;
`
const SectionHeaderText = styled(ReelayText.H6Emphasized)`
    align-self: flex-start;
    color: white;
    font-size: 24px;
    margin: 12px;
    margin-bottom: 0px;
`
const TopRightButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    justify-content: center;
    margin-right: 10px;
`
const TopBarView = styled(SafeAreaView)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin: 12px;
    padding-top: 0px;
`
const TopBarButtonView = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-right: -7px;
    margin-top: 7px;
`

export default MyClubsScreen = ({ navigation }) => {
    const authSession = useSelector(state => state.authSession);
    const bottomOffset = useSafeAreaInsets().bottom;
    const currentAppLoadStage = useSelector(state => state.currentAppLoadStage);
    const dispatch = useDispatch();
    const myClubs = useSelector(state => state.myClubs);
    const { reelayDBUser } = useContext(AuthContext);

    const [refreshCounter, setRefreshCounter] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const searchResultsRef = useRef([]);
    const searchUpdateCountRef = useRef(0);

    const refreshDiscoverClubs = useCallback(() => {
        setRefreshCounter(refreshCounter + 1);
    }, [refreshCounter]);

    const refreshMyClubs = async () => {
        const nextMyClubs = await getAllClubsFollowing({ authSession, reqUserSub: reelayDBUser?.sub });
        dispatch({ type: 'setMyClubs', payload: nextMyClubs ?? [] });
    }

    const onRefresh = () => {
        setRefreshing(true);
        refreshDiscoverClubs();
        refreshMyClubs();
        setRefreshing(false);
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
        return <JustShowMeSignupPage navigation={navigation} headerText='My Clubs' />
    }

    const AllMyClubs = () => {
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

        const ClubRow = ({ club }) => {
            const countableClubMembers = club.members.filter(member => {
                return (member?.role !== 'banned' && member?.hasAcceptedInvite);
            })
            const memberCount = countableClubMembers?.length;
            const memberText = `${memberCount} member${memberCount !== 1 ? 's' : ''}`;
            const lastActivityAt = club.lastActivityAt ?? null;

            const matchClubMember = (nextMember) => nextMember?.userSub === reelayDBUser?.sub
            const clubMember = countableClubMembers.find(matchClubMember);
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

        return (
            <View>
                <SectionHeaderText>{'Your chats'}</SectionHeaderText>
                <MyClubsFilters />
                { displayClubs.map(club => <ClubRow club={club} key={club?.id} />) }
            </View>
        );
    }

    const EmptyClubs = () => {
        return (
            <EmptyClubsView>
                <SectionHeaderText>{'Your chats'}</SectionHeaderText>
                <SectionBodyText>{'You have not joined or created any chats yet'}</SectionBodyText>
                <EmptyClubsCard navigation={navigation} />
            </EmptyClubsView>
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

    const NewClubButton = () => {
        const advanceToCreateClubScreen = () => navigation.push('CreateClubScreen');
        return (
            <TopRightButtonPressable onPress={advanceToCreateClubScreen}>
                <FontAwesomeIcon icon={faPenToSquare} color='white' size={24} />
            </TopRightButtonPressable>
        )
    }

    const SearchBarViewStyle = {
        borderColor: 'rgba(255,255,255,0.3)',
        borderWidth: 1.4,
        marginTop: 10,
        paddingLeft: 10,
        paddingTop: 2,
        paddingBottom: 2,
        paddingRight: 4,
        backgroundColor: '#121212',
        borderRadius: 6,
        justifyContent: 'center',
        width: '100%',    
    }

    const SearchBar = () => {
        const [searchText, setSearchText] = useState('');
        const updateCount = useRef(0);

        const advanceToSearchScreen = () => navigation.push('SearchScreen', { initialSearchType: 'Chats' });

        const updateSearchResults = async () => {
            const annotatedResults = (searchText === '') 
                ? [] 
                : await searchPublicClubs({ 
                    authSession,
                    page: 0,
                    reqUserSub: reelayDBUser?.sub, 
                    searchText: searchText 
                }
            );    
            console.log('annotated results: ', annotatedResults);
            searchResultsRef.current = annotatedResults ?? [];
            searchUpdateCountRef.current = searchUpdateCountRef.current + 1;
        }

        useEffect(() => {
            const curUpdateCount = updateCount.current;
            setTimeout(() => {
                if (curUpdateCount !== updateCount.current) return;
                updateSearchResults();
            }, 200);
        }, [searchText]);

        return (
            <Pressable onPress={advanceToSearchScreen}>
                <SearchField 
                    backgroundColor="#232425"
                    border={false}
                    style={SearchBarViewStyle}
                    updateSearchText={setSearchText}
                    placeholderText={`Search for chats`}
                    searchText={searchText}
                />
                <SearchFieldOverlay onPress={advanceToSearchScreen} />
            </Pressable>
        );
    }

    if (currentAppLoadStage < 4) {
        return (
            <RefreshView>
                <ActivityIndicator />
            </RefreshView>
        );
    }

    const SearchlessContent = () => {
        return (
            <View>
                <DiscoverClubs navigation={navigation} refreshCounter={refreshCounter} />
                { (myClubs?.length > 0) && <AllMyClubs /> }
                { (myClubs?.length === 0) && <EmptyClubs /> }
            </View>
        )
    }

    const TopBar = () => {
        return (
            <TopBarView>
                <HeaderText>{'chats'}</HeaderText>
                <TopBarButtonView>
                    <NewClubButton />
                </TopBarButtonView>
            </TopBarView>
        );
    }

    return (
		<MyClubsScreenView>
            <TopBar />
            <ScrollView 
                contentContainerStyle={{ paddingBottom: 100 }} 
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                <SearchBar />
                <SearchlessContent />
            </ScrollView>
            <BottomGradient bottomOffset={bottomOffset} colors={["transparent", "#0d0d0d"]} locations={[0.08, 1]} />
		</MyClubsScreenView>
	);
};
