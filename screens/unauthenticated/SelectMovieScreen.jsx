import React, { useContext, useEffect, useState, useRef, Fragment } from "react";
import { ActivityIndicator, Dimensions, SafeAreaView, View, TouchableOpacity } from "react-native";
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
import { useFocusEffect } from "@react-navigation/native";
import { addToMyCustomlist, getCustomItems } from "../../api/WatchlistApi";
import TrendingTitlesGrid from "../../components/search/TrendingTitlesGrid";
import { Icon } from "react-native-elements";
import { Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import WatchlistItemCardProfile from "../../components/watchlist/WatchlistItemCardProfile";
import { ScrollView } from "react-native-gesture-handler";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faShare } from "@fortawesome/free-solid-svg-icons";

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
    width:100%;
`
const ListUserText = styled(ReelayText.H6)`
    text-align: left;
    color:#fff;
    width:100%;
`
export default SelectMovieScreen = ({ navigation, route }) => {
    try {
        firebaseCrashlyticsLog('Select movie screen');
        const dispatch = useDispatch();
        const { reelayDBUser } = useContext(AuthContext);
        const addToWatchlist = true;
        const addCustomWatchlist = true;
        const listData = route?.params?.listData ?? {};
        const fromList = route?.params?.fromList ?? false;
        const initialSearchType = 'Film';
        const Redirect = route?.params?.Redirect ?? 0;
        const addCustomProfile = useSelector(state => state.addCustomProfile);

        const skipp = async () => {
            // navigation.replace('HomeScreen')   
            navigation.reset({
                index: 0,
                routes: [{ name: 'HomeScreen' }],
            })
        }

        const AddMovie = () => {
            navigation.navigate("SearchTitleScreen", { ListData: listData, fromListUpdate: true })

        }
        const goBack = () => { navigation.goBack(); }

        useFocusEffect(() => {
            dispatch({ type: 'setTabBarVisible', payload: false });
        });
        return (
            <SearchScreenView>
                <HeaderView>
                    <BackButtonPressable onPress={goBack}>
                        <Icon type="ionicon" name="arrow-back-outline" color="white" size={24} />
                    </BackButtonPressable>
                    <HeaderText>{""}</HeaderText>
                    <Pressable onPress={() => fromList ? AddMovie() : skipp()} style={{ position: "absolute", right: 30 }}>
                        <SkipText>{fromList ? "Add Movies" : "Skip"}</SkipText>
                    </Pressable>
                </HeaderView>
                {/* <HeaderSkipBack onPressOverride={goBack} onSkip={skipp} navigation={navigation} text='' /> */}
                <SearchBarWithResults navigation={navigation} initialSearchType={initialSearchType} addToWatchlist={addToWatchlist} addCustomWatchlist={addCustomWatchlist} fromList={fromList} listData={listData} />
            </SearchScreenView>
        );
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
};

const SearchBarWithResults = ({ navigation, initialSearchType, addToWatchlist, addCustomWatchlist, fromList, listData }) => {
    try {
        firebaseCrashlyticsLog('Select movie search bar with results');
        const dispatch = useDispatch();
        const authSession = useSelector(state => state.authSession);
        const { reelayDBUser } = useContext(AuthContext);
        const [loading, setLoading] = useState(false);
        const trendingMovieResults = useSelector(state => state.trendingMovieResults);
        const customWatchData = useSelector(state => state.customWatchData);


        return (
            <React.Fragment>
                {!fromList ? <HeaderTextLight>{"Lets record your first reelay.\n Choose a title to review"}</HeaderTextLight> :
                    <ListTextView>
                        <View style={{}}>
                            <ListTitleText numberOfLines={2}>{listData?.listName}</ListTitleText>
                            <ListUserText>by {listData?.creatorName}</ListUserText>
                        </View>
                        <FontAwesomeIcon icon={faShare} color='white' size={24} />
                    </ListTextView>}
                <ScrollView style={{}}>

                    {!fromList && <HomeWatchlistCardView >
                        <HomeWatchlistCardFill />
                        <HomeWatchlistCardGradient colors={['rgba(255,255,255,0.65)', 'rgba(255,255,255,0)']} />
                        <FanOfPosters titles={trendingMovieResults.map(item => item)} trending={true} />
                    </HomeWatchlistCardView>}
                    <View style={{ flexDirection: "row", flexWrap: 'wrap' }}>

                        {customWatchData?.map((item, ind) =>
                            <WatchlistItemCardProfile
                                key={ind}
                                navigation={navigation}
                                watchlistItem={item}
                                Redirect={true}
                                fromWatchlist={false}
                                customData={true}
                            />)}
                    </View>
                </ScrollView>
                {loading && <ActivityIndicator />}
            </React.Fragment>
        )
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
}
