import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, RefreshControl, SafeAreaView, ScrollView, FlatList, Animated, Fragment, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import JustShowMeSignupPage from '../../components/global/JustShowMeSignupPage';

// Logging
import { logAmplitudeEventProd } from "../../components/utils/EventLogger";

// API
import {
    getFollowers,
    getFollowing,
    getReelsByCreator,
    getStacksByCreator,
    getStreamingSubscriptions,
} from '../../api/ReelayDBApi';
import { getCustomItems, getWatchlistItems, getWatchlistRecs } from '../../api/WatchlistApi';
import { getAllMyNotifications } from '../../api/NotificationsApi';

// Components
import ProfilePosterGrid from '../../components/profile/ProfilePosterGrid';
import ProfileTopBar from '../../components/profile/ProfileTopBar';
import EditProfile from "../../components/profile/EditProfile";
import ProfileHeaderAndInfo from '../../components/profile/ProfileHeaderAndInfo';
import * as ReelayText from '../../components/global/Text';
import TopicsCarousel from '../../components/topics/TopicsCarousel';

// Context
import { AuthContext } from "../../context/AuthContext";
import { useDispatch, useSelector } from 'react-redux';

// Styling
import styled from 'styled-components/native';
import { useFocusEffect } from '@react-navigation/native';
import ReelayColors from '../../constants/ReelayColors';
import WatchlistItemCard from '../../components/watchlist/WatchlistItemCard';
import WatchlistItemCardProfile from '../../components/watchlist/WatchlistItemCardProfile';
import ListItemCard from '../../components/lists/ListItemCard';
import { TabView, SceneMap } from 'react-native-tab-view';
import PagerView from 'react-native-pager-view';
import { async } from 'validate.js';
import ProfileAddShareBar from '../../components/profile/ProfileAddShareBar';
import { getLists } from '../../api/ListsApi';
import { firebaseCrashlyticsLog, firebaseCrashlyticsError } from '../../components/utils/EventLogger';
const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

const { width, height } = Dimensions.get('window');
const REC_TITLE_CUTOFF_INDEX = 9;

const EditProfileButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    border-color: white;
    border-radius: 20px;
    border-width: 1px;
    height: 40px;
    justify-content: center;
    margin: 6px;
    margin-top: 8px;
    margin-bottom: 8px;
    width: ${width / 2.3}px;
`
const EditProfileButtonPressable1 = styled(TouchableOpacity)`
    align-items: center;
    border-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    border-width: 1px;
    height: 40px;
    justify-content: center;
    margin: 6px;
    margin-top: 8px;
    margin-bottom: 8px;
    width: ${width / 2.3}px;
`
const EditProfileText = styled(ReelayText.Overline)`
    color: white;
`
const EditProfileText1 = styled(ReelayText.Overline)`
color: ${ReelayColors.reelayBlue};
`
const MyWatchlistPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    height: 40px;
    justify-content: center;
    margin: 16px;
    margin-top: 8px;
    margin-bottom: 8px;
    width: ${width - 32}px;
`
const MyWatchlistText = styled(ReelayText.Overline)`
    color: white;
`
const ProfileScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const ProfileScrollView = styled(View)`
    flex:1;
`
const RefreshView = styled(ProfileScreenContainer)`
    align-items: center;
    justify-content: center;
`
const Spacer = styled(View)`
    height: 12px;
`

const FilterPressable = styled(TouchableOpacity)`
    align-items: center;
    border-width: ${props => props.isSelected ? 1 : 0};
    border-color:#fff;
    border-radius: 8px;
    justify-content: center;
    margin-right: 8px;
    padding: 6px;
`
const FilterRowView = styled(View)`
    align-items: center;
    justify-content: center;
    flex-direction: row;
    padding: 10px;
    padding-top:0px;
    width: 100%;
`
const FilterText = styled(ReelayText.CaptionEmphasized)`
    color: white;
`

export default MyProfileScreen = ({ navigation, route }) => {
    try {
        firebaseCrashlyticsLog('Profile screen mounted');
        const authSession = useSelector(state => state.authSession);
        const [refreshing, setRefreshing] = useState(false);
        const { reelayDBUser } = useContext(AuthContext);
        const myWatchlistItemsRedux = useSelector(state => state.myWatchlistItems);
        const myWatchlistRecsRedux = useSelector(state => state.myWatchlistRecs);

        const currentAppLoadStage = useSelector(state => state.currentAppLoadStage);

        const isEditingProfile = useSelector(state => state.isEditingProfile);
        const refreshOnUpload = useSelector(state => state.refreshOnUpload);
        const myFollowers = useSelector(state => state.myFollowers);
        const myFollowing = useSelector(state => state.myFollowing);
        const myCreatorStacks = useSelector(state => state.myCreatorStacks);
        const customWatchData = useSelector(state => state.customWatchData);
        const myStreamingSubscriptions = useSelector(state => state.myStreamingSubscriptions);
        const listData = useSelector(state => state.listData);
        const dispatch = useDispatch();

        const [selectedFilters, setSelectedFilters] = useState('All');
        const [activeIndex, setActiveIndex] = useState(0);

        const myWatchlistItems = myWatchlistItemsRedux;

        const Alltitle = (watchlistItem) => watchlistItem?.hasSeenTitle && !watchlistItem?.hasSeenTitle;
        const hasAcceptedRec = (watchlistItem) => watchlistItem?.hasAcceptedRec ?? true;
        const hasNotSeenTitle = (watchlistItem) => !watchlistItem?.hasSeenTitle;
        const hasSeenTitle = (watchlistItem) => watchlistItem?.hasSeenTitle;
        const isFilm = (watchlistItem) => watchlistItem?.titleType === 'film';
        const isSeries = (watchlistItem) => watchlistItem?.titleType === 'tv';
        const Blank = (watchlistItem) => watchlistItem?.title?.runtime < 500;
        const isUnder90Mins = (watchlistItem) => {
            if (watchlistItem?.title?.runtime > 0) {
                return watchlistItem?.title?.runtime < 90;
            }
            return watchlistItem?.title?.titleType === 'tv';
        }

        const [displayItems, setDisplayItems] = useState(myWatchlistItems.filter(hasAcceptedRec));
        const displayItemsWithCutoff = displayItems.slice(0, REC_TITLE_CUTOFF_INDEX);

        const [renderCount, setRenderCount] = useState(0);
        const Redirect = route?.params?.Redirect ?? 0;

        const layout = useWindowDimensions();
        const pager = useRef(null);
        const [index, setIndex] = React.useState(0);
        const [routes] = React.useState([
            { key: 'first', title: 'First' },
            { key: 'second', title: 'Second' },
        ]);

        useFocusEffect(() => {
            dispatch({ type: 'setTabBarVisible', payload: true });
            dispatch({ type: 'setAddCustomProfile', payload: [] });

        })

        useEffect(() => {
            filtering();
        }, [selectedFilters]);

        const filtering = async () => {
            const nextDisplayItems = await getDisplayItems();
            setDisplayItems(nextDisplayItems);
        }

        useEffect(() => {
            const nextDisplayItems = myWatchlistItems.filter(hasAcceptedRec);
            if (nextDisplayItems?.length !== displayItems?.length) {
                setDisplayItems(nextDisplayItems);
            }
        }, [myWatchlistItems]);

        const getDisplayItems = () => {
            console.log(selectedFilters)

            const allFilters = (watchlistItem) => {
                if (selectedFilters == "All" && Alltitle(watchlistItem)) return false;
                if (selectedFilters == "Watched" && hasNotSeenTitle(watchlistItem)) return false;
                if (selectedFilters == "Unwatched" && hasSeenTitle(watchlistItem)) return false;
                if (selectedFilters == "Reelays" && Blank(watchlistItem)) return false;
                return true;
            }
            return myWatchlistItems?.filter(allFilters);
        }

        useEffect(() => {
            if (refreshOnUpload) {
                dispatch({ type: 'setRefreshOnUpload', payload: false })
                onRefresh();
            }
            logAmplitudeEventProd("openMyProfileScreen", {
                username: reelayDBUser?.username,
                email: reelayDBUser?.email,
            });
        }, []);

        useEffect(() => {
            if (!isEditingProfile) {
                setRenderCount(renderCount + 1);
            }
        }, [isEditingProfile]);

        if (reelayDBUser?.username === 'be_our_guest') {
            return <JustShowMeSignupPage navigation={navigation} headerText='My Reelays' />
        }

        if (!reelayDBUser) {
            return (
                <ProfileTopBar atProfileBase={true} creator={{ username: 'User not found' }}
                    navigation={navigation} />
            );
        }


        const onRefresh = async () => {
            const userSub = reelayDBUser?.sub;
            if (userSub.length) {
                console.log('Now refreshing');
                setRefreshing(true);
                try {
                    firebaseCrashlyticsLog('Profile screen reloaded');
                    const [
                        nextMyCreatorStacks,
                        nextMyReelayStacks,
                        nextMyFollowers,
                        nextMyFollowing,
                        nextMyNotifications,
                        nextMyWatchlistItems,
                        setCustomWatchData,
                        nextMyWatchlistRecs,
                        nextMyStreamingSubscriptions,
                        listata,

                    ] = await Promise.all([
                        getStacksByCreator(userSub),
                        getReelsByCreator(userSub),
                        getFollowers(userSub),
                        getFollowing(userSub),
                        getAllMyNotifications(userSub),
                        getWatchlistItems(userSub),
                        getCustomItems(userSub),
                        getWatchlistRecs({ authSession, reqUserSub: userSub, category: 'all' }),
                        getStreamingSubscriptions(userSub),
                        getLists({ reqUserSub: userSub }),
                    ]);
                    nextMyCreatorStacks.forEach((stack) => stack.sort(sortReelays));
                    nextMyCreatorStacks.sort(sortStacks);

                    dispatch({ type: 'setMyCreatorStacks', payload: nextMyCreatorStacks });
                    dispatch({ type: 'setMyReelayStacks', payload: nextMyReelayStacks });
                    dispatch({ type: 'setMyFollowers', payload: nextMyFollowers });

                    dispatch({ type: 'setMyNotifications', payload: nextMyNotifications });
                    dispatch({ type: 'setMyWatchlistItems', payload: nextMyWatchlistItems });
                    dispatch({ type: 'setMyWatchlistRecs', payload: nextMyWatchlistRecs });
                    dispatch({ type: 'setCustomWatchData', payload: setCustomWatchData });
                    dispatch({ type: 'setMyFollowing', payload: nextMyFollowing });

                    dispatch({ type: 'setMyStreamingSubscriptions', payload: nextMyStreamingSubscriptions });
                    dispatch({ type: 'setListData', payload: listata });

                    console.log('Refresh complete');
                } catch (error) {
                    console.log(error);
                    firebaseCrashlyticsError(error);
                }
                setRefreshing(false);
            }
        }

        const sortReelays = (reelay1, reelay2) => reelay2.postedDateTime - reelay1.postedDateTime;
        const sortStacks = (stack1, stack2) => stack2[0].postedDateTime - stack1[0].postedDateTime;
        const reelayCounter = (sum, nextStack) => sum + nextStack.length;
        const reelayCount = myCreatorStacks.reduce(reelayCounter, 0);
        const refreshControl = <RefreshControl tintColor={"#fff"} refreshing={refreshing} onRefresh={onRefresh} />;

        const EditProfileButton = () => {
            return (
                <View style={{ flexDirection: "row", justifyContent: "center" }}>
                    <EditProfileButtonPressable onPress={() => {
                        dispatch({ type: 'setIsEditingProfile', payload: true });
                    }}>
                        <EditProfileText>{'Edit profile'}</EditProfileText>
                    </EditProfileButtonPressable>

                    <EditProfileButtonPressable1 onPress={() => {
                        navigation.navigate("ReferShareScreen");
                    }}>
                        <EditProfileText1>{'Refer a friend'}</EditProfileText1>
                    </EditProfileButtonPressable1>
                </View>
            );
        }

        const SeeMyWatchlistButton = () => {
            const myWatchlistItems = useSelector(state => state.myWatchlistItems);
            const myWatchlistRecs = useSelector(state => state.myWatchlistRecs);
            const advanceToWatchlistScreen = () => navigation.push('WatchlistScreen', { myWatchlistItems, myWatchlistRecs, Redirect: 1 });
            return (
                <MyWatchlistPressable onPress={advanceToWatchlistScreen}>
                    <MyWatchlistText>{'See my watchlist'}</MyWatchlistText>
                </MyWatchlistPressable>
            );
        }

        if (currentAppLoadStage < 3) {
            return (
                <RefreshView>
                    <ActivityIndicator />
                </RefreshView>
            )
        }

        const FilterButton = ({ filterKey }) => {
            const isSelected = selectedFilters.includes(filterKey);

            const getOppositeKey = () => {
                if (filterKey === 'All') return 0;
                if (filterKey === 'Unwatched') return 1;
                if (filterKey === 'Watched') return 2;
                if (filterKey === 'Reelays') return 3;
                if (filterKey === 'Custom') return 4;
                return '';
            }

            const onPress = () => {
                const oppositeKey = getOppositeKey();
                if (activeIndex !== oppositeKey) {
                    setDisplayItems([]);
                    setActiveIndex(oppositeKey)
                    setSelectedFilters(filterKey);
                    pager.current?.setPage?.(oppositeKey);
                }

            }

            return (
                <FilterPressable isSelected={isSelected} onPress={onPress}>
                    <FilterText>{filterKey}</FilterText>
                </FilterPressable>
            )
        }

        const WatchlistFilters = () => {
            const filterKeys = ['All', 'Unwatched', 'Watched', 'Reelays', 'Custom']//'seen', 'unseen', 'movie', 'TV', '<90 min'];        
            return (
                <FilterRowView>
                    {filterKeys.map(key => <FilterButton key={key} filterKey={key} />)}
                </FilterRowView>
            )
        }

        const renderWatchlistItem = ({ item }) => {
            return (
                <WatchlistItemCardProfile
                    onMoveToFront={onMoveToFront}
                    onRemoveItem={onRemoveItem}
                    navigation={navigation}
                    watchlistItem={item}
                    Redirect={Redirect}
                />
            );
        }

        const onMoveToFront = (watchlistItem) => {
            // alert(JSON.stringify(watchlistItem))
            const filterWatchlistItem = (nextItem) => nextItem?.id !== watchlistItem?.id;
            // setDisplayItems([]);
            const filteredWatchlist = displayItems.filter(filterWatchlistItem);
            const nextDisplayItems = [watchlistItem, ...filteredWatchlist];
            setDisplayItems([]);
        }



        const onRemoveItem = (watchlistItem) => {
            const filterWatchlistItem = (nextItem) => nextItem?.id !== watchlistItem?.id;
            const filteredWatchlist = displayItems.filter(filterWatchlistItem);
            const nextDisplayItems = [...filteredWatchlist];
            setDisplayItems(filteredWatchlist);
        }



        const getOppositeKey = (item) => {
            if (item === 0) return 'All';
            if (item === 1) return 'Unwatched';
            if (item === 2) return 'Watched';
            if (item === 3) return 'Reelays';
            if (item === 4) return 'Custom';
            return '';
        }

        const onPressS = (item) => {
            console.log(item, activeIndex)
            if (activeIndex == item) {
                return false;
            }
            setActiveIndex(item)
            const oppositeKey = getOppositeKey(item);
            // const filterOppositeKey = (key) => key !== oppositeKey;
            setDisplayItems([]);
            setSelectedFilters(oppositeKey);
            pager.current?.setPage?.(item);
        }

        // useEffect(() => {
        //     pager.current && ;
        // }, [activeIndex]);

        const filterKeys = ['All', 'Unwatched', 'Watched', 'Reelays', 'Custom']//'seen', 'unseen', 'movie', 'TV', '<90 min'];        

        const find_dimesions = (layout) => {
            const { x, y, width, height } = layout;
            console.warn(x);
            console.warn(y);
            console.warn(width);
            console.warn(height);
        }

        return (
            <ProfileScreenContainer>
                {isEditingProfile && <EditProfile navigation={navigation} refreshProfile={onRefresh} />}
                <ProfileTopBar creator={reelayDBUser} navigation={navigation} atProfileBase={true} />
                <ProfileScrollView showsVerticalScrollIndicator={false} refreshControl={refreshControl}>
                    <ProfileHeaderAndInfo
                        navigation={navigation}
                        creator={reelayDBUser}
                        bioText={(reelayDBUser.bio) ? reelayDBUser.bio : ""}
                        websiteText={(reelayDBUser.website) ? reelayDBUser.website : ""}
                        streamingSubscriptions={myStreamingSubscriptions}
                        reelayCount={reelayCount}
                        followers={myFollowers}
                        following={myFollowing}

                    />
                    {/* <FlatList
                    ListHeaderComponent={(<WatchlistFilters />)}
                    data={displayItemsWithCutoff}
                    decelerationRate={2}
                    numColumns={3}
                    estimatedItemSize={100}
                    keyboardShouldPersistTaps="always"
                    keyExtractor={item => item.id}
                    renderItem={renderWatchlistItem}
                    showsVerticalScrollIndicator={false}
                /> */}
                    {/* <TabView
                    navigationState={{ index, routes }}
                    renderScene={SceneMap({
                        first: FirstRoute,
                        second: SecondRoute,
                      })}
                    swipeEnabled={true}
                    animationEnabled
                    onIndexChange={setIndex}
                    initialLayout={{ width: layout.width }}
                    /> */}
                    <WatchlistFilters />
                    <ProfileAddShareBar creator={reelayDBUser} displayItems={selectedFilters == "Reelays" ? reelayCount : selectedFilters == "Custom" ? customWatchData : displayItems} selectedFilters={selectedFilters} navigation={navigation} />
                    <AnimatedPagerView style={{ flex: 1 }} ref={pager}
                        layoutDirection="ltr" onPageSelected={({ nativeEvent }) => onPressS(nativeEvent.position)}
                        orientation="horizontal" scrollEnabled={true} initialPage={0}
                    >
                        {filterKeys.map((items, inde) =>
                            <ScrollView key={inde} style={{ paddingBottom: 0 }} refreshControl={refreshControl}>
                                <View style={items !== "Custom" && { flexDirection: "row", flexWrap: 'wrap', flex: 1 }}>
                                    {items == "Reelays" ?
                                        <View>
                                            <ProfilePosterGrid creatorStacks={myCreatorStacks} navigation={navigation} profile={1} />
                                        </View>
                                        : items == "Custom" ?
                                            (listData?.map((item, indx) =>
                                                <ListItemCard key={indx} navigation={navigation} listItem={item} Redirect={Redirect} />))
                                            :
                                            (displayItems && displayItems?.map((item, ind) =>
                                                <WatchlistItemCardProfile
                                                    key={ind}
                                                    onMoveToFront={onMoveToFront} onRemoveItem={onRemoveItem} navigation={navigation}
                                                    watchlistItem={item} Redirect={Redirect} fromWatchlist={false}
                                                />))}
                                </View>
                            </ScrollView>)}
                    </AnimatedPagerView>
                    {/* <EditProfileButton /> */}
                    {/* <SeeMyWatchlistButton /> */}
                    {/* <Spacer /> */}
                    {/* <TopicsCarousel 
                    creatorOnProfile={reelayDBUser} 
                    navigation={navigation} 
                    source='profile' 
                /> */}
                    {/* <Spacer /> */}
                    {/* {selectedFilters === "Reelays" ? <ProfilePosterGrid creatorStacks={myCreatorStacks} navigation={navigation} profile={1}/>:null} */}
                </ProfileScrollView>
            </ProfileScreenContainer>
        );
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
}

