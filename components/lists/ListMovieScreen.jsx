import React, { useContext, useEffect, useState, useRef, Fragment } from "react";
import { ActivityIndicator, Dimensions, SafeAreaView, View, TouchableOpacity, Share } from "react-native";
import { useDispatch, useSelector } from "react-redux";

// Components
import { HeaderSkipBack, HeaderWithBackButton } from '../../components/global/Headers'
import SearchField from "../../components/create-reelay/SearchField";
import TitleSearchResults from "../../components/search/TitleSearchResults";
import UserSearchResults from "../../components/search/UserSearchResults";
import { ToggleSelector } from '../../components/global/Buttons';
import ClubSearchResults from "../../components/search/ClubSearchResults";
import SuggestedTitlesGrid from "../../components/search/SuggestedTitlesGrid";
import * as ReelayText from "../../components/global/Text";

// Context
import { AuthContext } from "../../context/AuthContext";

// Logging
import { firebaseCrashlyticsError, firebaseCrashlyticsLog, logAmplitudeEventProd } from "../../components/utils/EventLogger";

// API
import { searchBothTitles, searchTitles, searchUsers } from "../../api/ReelayDBApi";
import { searchPublicClubs } from "../../api/ClubsApi";

// Styling
import styled from "styled-components/native";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { addToMyCustomlist, getCustomItems } from "../../api/WatchlistApi";
import TrendingTitlesGrid from "../../components/search/TrendingTitlesGrid";
import { Icon } from "react-native-elements";
import { Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import WatchlistItemCardProfile from "../../components/watchlist/WatchlistItemCardProfile";
import { ScrollView } from "react-native-gesture-handler";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faEdit, faPencil, faShare } from "@fortawesome/free-solid-svg-icons";
import { fetchOrCreateListLink, getListMovies } from "../../api/ListsApi";
import { showErrorToast } from "../utils/toasts";
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

const SearchScreenView = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const SelectorBarView = styled(View)`
    height: 40px;
    width: ${width - 24}px;
`
const SearchBarView = styled(View)`
    align-items: center;
    justify-content: center;
    padding-left: 2px;
    padding-right: 2px;
    width: 100%;
`
const TopBarView = styled(View)`
    align-items: center;
    margin-bottom: 12px;
    width: 100%;
`
const HeaderTextLight = styled(ReelayText.H5Bold)`
	color: white;
	font-size: 24px;
	line-height: 24px;
	margin-top: 2px;
	text-align: center;
`

const BackButtonPressable = styled(TouchableOpacity)`
	margin-top: -6px;
	margin-bottom: -6px;
	padding: 6px;
`
const HeaderView = styled(View)`
	align-items: center;
	flex-direction: row;
	margin-top: 6px;
	margin-left: 12px;
	margin-bottom: 12px;
	width: 100%;
`
const HeaderText = styled(ReelayText.H5Bold)`
	color: white;
	font-size: 24px;
	line-height: 24px;
	margin-top: 2px;
	text-align: left;
`


const SkipText = styled(ReelayText.Subtitle1Emphasized)`
	color: white;
`

const TrendingText = styled(ReelayText.Subtitle2)`
	color: white;
    margin:3px;
`
const HomeWatchlistCardFill = styled(View)`
    background-color: #1A8BF2;
    border-radius: 12px;
    height: 100%;
    opacity: 0.2;
    position: absolute;
    width: 100%;
`
const HomeWatchlistCardGradient = styled(LinearGradient)`
    border-radius: 12px;
    height: 100%;
    opacity: 0.2;
    position: absolute;
    width: 100%;
`
const HomeWatchlistCardView = styled(TouchableOpacity)`
    align-items: center;
    border-radius: 12px;
    height: 220px;
    justify-content: center;
    left: 13px;
    margin-top: 18px;
    margin-bottom: 16px;
    width: ${width - 32}px;
`

const ListTextView = styled(View)`
    flex-direction:row;
    justify-content:space-between;
    margin:10px;
    margin-bottom:20px;
`

const ListTitleText = styled(ReelayText.H5Bold)`
    text-align: left;
    color:#fff;
`
const ListUserText = styled(ReelayText.H6)`
    text-align: left;
    color:#fff;
    width:100%;
`
const REELAY_WEB_PREFIX = Constants.manifest.extra.reelayWebListUrl;

export default ListMovieScreen = ({ navigation, route }) => {
    try {
        firebaseCrashlyticsLog('List movie screen')
        const dispatch = useDispatch();
        const { reelayDBUser } = useContext(AuthContext);
        const addToWatchlist = true;
        const addCustomWatchlist = true;
        const listData = route?.params?.listData ?? {};
        const fromList = route?.params?.fromList ?? false;
        const fromDeeplink = route?.params?.fromDeeplink ?? false;
        const initialSearchType = 'Film';
        const Redirect = route?.params?.Redirect ?? 0;
        const addCustomProfile = useSelector(state => state.addCustomProfile);
        const [loading, setLoading] = useState(true);
        const [listMovies, setlistMovies] = useState([]);
        const isFocused = useIsFocused();
        const [customLink, setCustomLink] = useState("");

        const skipp = async () => {
            // navigation.replace('HomeScreen')   
            navigation.reset({
                index: 0,
                routes: [{ name: 'HomeScreen' }],
            })
        }

        const AddMovie = () => {
            if (listMovies && listMovies?.length !== 0) {
                dispatch({ type: 'setAddCustomProfile', payload: listMovies });
            }
            navigation.navigate("SearchTitleScreen", { ListData: listData, fromListUpdate: true })

        }
        const goBack = () => { navigation.goBack(); }

        useFocusEffect(() => {
            dispatch({ type: 'setTabBarVisible', payload: false });
        });

        useEffect(() => {
            getMovies();
        }, [isFocused])


        useEffect(() => {
            const fetchCustomLink = async () => {
                const customlink = await fetchOrCreateListLink({
                    listId: listData?.id,
                    listName: listData?.listName,
                    description: listData?.description ? listData?.description : "",
                    creatorSub: reelayDBUser?.sub,
                    creatorName: reelayDBUser?.username,
                });
                console.log("fetchCustomLink", customlink)
                setCustomLink(customlink);
            }
            fetchCustomLink();
            // dispatch({ type: 'setAddCustomProfile', payload:[] });
        }, [])


        const RightCornerButtons = () => {
            const shareProfileLink = async () => {
                try {
                    // first, create the profile link if it doesn't exist in useEffect
                    // then, copy it to clipboard:
                    if (customLink?.error) {
                        showErrorToast("There was an error creating this list link. Please try again.");
                    }
                    else {
                        // now open share out drawer
                        const url = REELAY_WEB_PREFIX + customLink?.shareCode;
                        const content = {
                            // url:url,
                            // title: `${reelayDBUser?.username} on Reelay`,
                            message: `Find ${reelayDBUser?.username}'s list on ${url}`
                        };
                        const options = {};
                        console.log("shareProfileLink", content, options)
                        const sharedAction = await Share.share(content, options);
                        if (sharedAction.action === Share.sharedAction) {
                            if (sharedAction.activityType) {
                                console.log("sharedAction", sharedAction)

                                // shared with activity type of result.activityType
                            } else {
                                // shared
                            }
                        } else if (sharedAction.action === Share.dismissedAction) {
                            console.log("sharedAction Dism", sharedAction)
                            // dismissed
                        }
                        logAmplitudeEventProd('openedShareList', {
                            username: reelayDBUser?.username,
                            title: `${listData?.id} shared list on Reelay`,
                            source: 'shareListLinkButton',
                        });
                    }
                } catch (e) {
                    console.log(e);
                    showErrorToast('Ruh roh! Couldn\'t share list link. Try again!');
                    console.log("Error in share profile link. Registered profile link: ", customLink);
                }
            }

            const ShareProfileLinkButton = () => {
                return (
                    <Pressable style={{ marginRight: 5 }} onPress={shareProfileLink}>
                        <FontAwesomeIcon icon={faShare} color='white' size={24} />
                    </Pressable>
                );
            }
            const ShareProfileEditButton = () => {
                return (
                    <Pressable style={{ marginRight: 12 }} onPress={AddMovie}>
                        <FontAwesomeIcon icon={faPencil} color='white' size={24} />
                    </Pressable>
                );
            }


            return (
                <View style={{ flexDirection: "row", }}>
                    <ShareProfileEditButton />
                    <ShareProfileLinkButton />
                </View>
            );
        }

        const getMovies = async () => {
            setlistMovies([])
            const postBody = {
                reqUserSub: reelayDBUser.sub,
                listId: listData.id,
            }
            // console.log(postBody)
            const publishResult = await getListMovies(postBody);
            setLoading(false)
            setlistMovies(publishResult)

        }
        return (
            <SearchScreenView>
                <HeaderView>
                    <BackButtonPressable onPress={goBack}>
                        <Icon type="ionicon" name="arrow-back-outline" color="white" size={24} />
                    </BackButtonPressable>
                    <HeaderText>{""}</HeaderText>
                    {!fromDeeplink && !fromList &&
                        <Pressable onPress={() => skipp()} style={{ position: "absolute", right: 30 }}>
                            <SkipText>{fromList ? "Edit Movies" : "Skip"}</SkipText>
                        </Pressable>}
                </HeaderView>
                {!fromList ? <HeaderTextLight>{"Lets record your first reelay.\n Choose a title to review"}</HeaderTextLight> :
                    <ListTextView>
                        <View style={{ width: "75%" }}>
                            <ListTitleText numberOfLines={2}>{listData?.listName}</ListTitleText>
                            <ListUserText>by {listData?.creatorName}</ListUserText>
                        </View>
                        {!fromDeeplink &&
                            <RightCornerButtons />}
                    </ListTextView>}
                {/* <HeaderSkipBack onPressOverride={goBack} onSkip={skipp} navigation={navigation} text='' /> */}
                <SearchBarWithResults navigation={navigation} initialSearchType={initialSearchType} addToWatchlist={addToWatchlist} addCustomWatchlist={addCustomWatchlist} fromList={fromList} listData={listData} loading={loading} listMovies={listMovies} />
            </SearchScreenView>
        );
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
};


const SearchBarWithResults = ({ navigation, initialSearchType, addToWatchlist, addCustomWatchlist, fromList, listData, loading, listMovies }) => {
    try {
        firebaseCrashlyticsLog('List movie screen with search results');
        const dispatch = useDispatch();
        const authSession = useSelector(state => state.authSession);
        const { reelayDBUser } = useContext(AuthContext);
        const trendingMovieResults = useSelector(state => state.trendingMovieResults);
        const customWatchData = useSelector(state => state.customWatchData);



        return (
            <React.Fragment>

                <ScrollView style={{}}>

                    {!fromList && <HomeWatchlistCardView >
                        <HomeWatchlistCardFill />
                        <HomeWatchlistCardGradient colors={['rgba(255,255,255,0.65)', 'rgba(255,255,255,0)']} />
                        <FanOfPosters titles={trendingMovieResults.map(item => item)} trending={true} />
                    </HomeWatchlistCardView>}
                    {loading && <ActivityIndicator />}
                    <View style={{ flexDirection: "row", flexWrap: 'wrap' }}>

                        {listMovies?.map((item, ind) =>
                            <WatchlistItemCardProfile
                                key={ind}
                                navigation={navigation}
                                watchlistItem={item}
                                Redirect={false}
                                fromWatchlist={false}
                                customData={true}
                            />)}
                    </View>
                </ScrollView>
            </React.Fragment>
        )
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
}
