import React, { Fragment, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import JustShowMeSignupPage from '../../components/global/JustShowMeSignupPage';
import { AuthContext } from '../../context/AuthContext';

import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import styled from 'styled-components/native';
import * as ReelayText from '../../components/global/Text';
import { useDispatch, useSelector } from 'react-redux';
import { ScrollView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import ClubPicture from '../../components/global/ClubPicture';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronRight, faUsers } from '@fortawesome/free-solid-svg-icons';
import { sortByLastActivity } from '../../redux/reducers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ReelayColors from '../../constants/ReelayColors';
import Constants from 'expo-constants';
import moment from 'moment';
import EmptyClubsCard from '../../components/clubs/EmptyClubsCard';
import { ChatsIconSVG, NotificationIconSVG, SearchIconSVG } from '../../components/global/SVGs';

const CLUB_PIC_SIZE = 72;
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

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
const AddClubRowPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 16px;
    flex-direction: row;
    padding-top: 12px;
    padding-bottom: 12px;
    margin: 16px;
    margin-top: 10px;
    margin-bottom: 10px;
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
    margin: 16px;
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
const UnreadIconIndicator = styled(View)`
	background-color: ${ReelayColors.reelayBlue}
	border-radius: 5px;
	height: 10px;
	width: 10px;
	position: absolute;
    top: 0px;
	right: 0px;
`

export default MyClubsScreen = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const myClubs = useSelector(state => state.myClubs);
    const currentAppLoadStage = useSelector(state => state.currentAppLoadStage);

    const dispatch = useDispatch();
    const bottomOffset = useSafeAreaInsets().bottom;
    
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

        const AddClubRow = ({ club }) => {
            const advanceToCreateClubScreen = () => navigation.push('CreateClubScreen');
            return (
                <AddClubRowPressable onPress={advanceToCreateClubScreen}>
                    <AddClubIconView>
                        <FontAwesomeIcon icon={faUsers} color='white' size={36} />
                    </AddClubIconView>
                    <ClubRowInfoView>
                        <ClubNameText>{'Start a new chat'}</ClubNameText>
                        <ClubDescriptionText>{'Invite friends. Make group watchlists. Chat in real time.'}</ClubDescriptionText>
                    </ClubRowInfoView>
                    <ClubRowArrowView>
                        <FontAwesomeIcon icon={faChevronRight} color='white' size={18} />
                        <ClubRowArrowSpacer />
                    </ClubRowArrowView>
                </AddClubRowPressable>
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

    const EmptyClubs = () => {
        return (
            <EmptyClubsView>
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

    const NotificationButton = () => {
        const advanceToNotificationScreen = () => navigation.push('NotificationScreen');
        const myNotifications = useSelector(state => state.myNotifications);
        const hasUnreadNotifications = myNotifications.filter(({ seen }) => !seen).length > 0;

        return (
            <TopRightButtonPressable onPress={advanceToNotificationScreen}>
                <NotificationIconSVG />
                { hasUnreadNotifications && <UnreadIconIndicator /> }
            </TopRightButtonPressable>
        )
    }

    const SearchButton = () => {
        const advanceToSearchScreen = () => navigation.push('SearchScreen', { initialSearchType: 'Clubs' });
        return (
            <TopRightButtonPressable onPress={advanceToSearchScreen}>
                {/* <Icon type='ionicon' size={27} color={'white'} name='search' /> */}
                <SearchIconSVG />
            </TopRightButtonPressable>
        )
    }

    if (currentAppLoadStage < 4) {
        return (
            <RefreshView>
                <ActivityIndicator />
            </RefreshView>
        );
    }

    return (
		<MyClubsScreenView>
            <TopBarView>
                <HeaderText>{'chats'}</HeaderText>
                <TopBarButtonView>
                    <SearchButton />
                    <NotificationButton />
                </TopBarButtonView>
            </TopBarView>
            { (myClubs?.length > 0) && <AllMyClubs /> }
            { (myClubs?.length === 0) && <EmptyClubs /> }
            <BottomGradient colors={["transparent", "#0d0d0d"]} locations={[0.08, 1]} />
		</MyClubsScreenView>
	);
};
