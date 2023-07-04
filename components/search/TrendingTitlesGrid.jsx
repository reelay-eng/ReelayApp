import React, { Fragment, useContext, useEffect, useRef,useState } from 'react';
import { Alert, Dimensions, FlatList, Linking, Pressable, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/native';
import TitlePoster from '../global/TitlePoster';
import * as ReelayText from "../global/Text";

import { fetchPopularMovies, fetchPopularSeries } from '../../api/TMDbApi';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import ReelayColors from '../../constants/ReelayColors';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import FanOfPosters from '../watchlist/FanOfPosters';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const GRID_SIDE_MARGIN = 12;
const GRID_WIDTH = width - (2 * GRID_SIDE_MARGIN);
const MAX_SUGGESTION_PAGE = 9; // multiple of 3 gives us a full bottom row

const POSTER_HALF_MARGIN = 4;
const POSTER_ROW_LENGTH = 3;
const POSTER_WIDTH = (GRID_WIDTH / POSTER_ROW_LENGTH) - (2 * POSTER_HALF_MARGIN);
const POSTER_HEIGHT_WITH_MARGIN = (POSTER_WIDTH * 1.5) + (2 * POSTER_HALF_MARGIN);

const PosterContainer = styled(Pressable)`
    align-items: center;
    margin: ${POSTER_HALF_MARGIN}px;
    height: ${POSTER_WIDTH * 1.5}px;
    width: ${POSTER_WIDTH}px;
`
const PosterGridContainer = styled(SafeAreaView)`
    display: flex;
    flex: 1;
    justify-content: center;
    margin-left: ${GRID_SIDE_MARGIN}px;
    margin-right: ${GRID_SIDE_MARGIN}px;
    margin-bottom: 0px;
    min-height: ${POSTER_HEIGHT_WITH_MARGIN}px;
    width: ${GRID_WIDTH}px;
`

const MarkedSeenCircle = styled(View)`
    background-color: ${props => props.markedSeen ? 'white' : 'transparent'};
    border-radius: ${props => props.size}px;
    height: ${props => props.size}px;
    position: absolute;
    right: 6px;
    width: ${props => props.size}px;
`
const MarkSeenButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    flex-direction: row;
    padding-left: 4px;
    margin-top:-45px;
    z-index:9999;
`
const MarkSeenText = styled(ReelayText.CaptionEmphasized)`
    color: #86878B;
    font-size: 16px;
    padding-right: 6px;
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
    left: 3px;
    margin-top: 8px;
    margin-bottom: 16px;
    width: ${width - 32}px;
`

export default SuggestedTitlesGrid = ({ 
    navigation, 
    selectedType, 
    source='search',
    clubID=null,
    topicID=null,
    size=30,
    addCustomWatchlist
}) => {
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const bottomOffset = useSafeAreaInsets().bottom;
    const scrollRef = useRef(null);
    const scrollRefWatch = useRef(null);
    const suggestedMovieResults = useSelector(state => state.suggestedMovieResults);
    const trendingMovieResults = useSelector(state => state.trendingMovieResults);
    const suggestedSeriesResults = useSelector(state => state.suggestedSeriesResults);
    const addCustomProfile = useSelector(state => state.addCustomProfile);
    const [markedSeen, setmarkedSeen] = useState(false);
    const [movielist, setmovielist] = useState([]);


    const myWatchlistItemsRedux = useSelector(state => state.myWatchlistItems);
    const myWatchlistItems =  myWatchlistItemsRedux;
    const hasAcceptedRec = (watchlistItem) => watchlistItem?.hasAcceptedRec ?? true;
    const [displayItems, setDisplayItems] = useState(myWatchlistItems.filter(hasAcceptedRec));


    // const suggestedTitles = trendingMovieResults?.titles 
    const MarkSeen = ({item}) => {
       const markeddata = () => {
        const Item = {
            reqUserSub: reelayDBUser?.sub,
            reqUsername: reelayDBUser?.username,
            tmdbTitleID: item?.id,
            titleType: item?.titleType,
        }
        // let abc = movielist?.find(items=> items.tmdbTitleID !== item.id)
        // if(movielist?.length == 0){
        //     setmovielist(movielist => [...movielist,Item]);
        // }
        let abbc = addCustomProfile;
        if(addCustomProfile?.find(items=> items.tmdbTitleID == item.id)){
            // setmovielist(movielist.filter(items=> items.tmdbTitleID !== item.id));
            console.log(abbc.filter(items=> items.tmdbTitleID !== item.id))
            dispatch({ type: 'setAddCustomProfile', payload: abbc.filter(items=> items.tmdbTitleID !== item.id) });
        }else {
            // abbc.push(Item)
            console.log("abbc",abbc)
            // dispatch({ type: 'setAddCustomProfile', payload: abbc});
            // setmovielist(movielist => [...movielist,Item]);
            dispatch({ type: 'setAddCustomProfile', payload: [...addCustomProfile,Item] });
        } 
        }


        return (
                 <MarkSeenButtonContainer onPress={()=>markeddata()}>
                <MarkedSeenCircle markedSeen={markedSeen} size={size - 8} />
                {addCustomProfile?.find(items=> items.tmdbTitleID == item.id) ?
                <Icon type='ionicon' name='checkmark-circle' color={ReelayColors.reelayGreen} size={size} />:
                <Icon type='ionicon' name='ellipse-outline' color={"white"} size={size} /> }
                {/* { markedSeen && <Icon type='ionicon' name='checkmark-circle' color={ReelayColors.reelayGreen} size={size} />}
                { !markedSeen && <Icon type='ionicon' name='ellipse-outline' color={'white'} size={size} />} */}
            </MarkSeenButtonContainer>
        );
    }
    
    const renderTitlePoster = ({ item, index }) => {
        const titleObj = item;
        const venue = "";
        const advanceToTitleScreen = () => navigation.push('TitleDetailScreen', { titleObj });
        // const advanceToSelectVenue = () => navigation.push('VenueSelectScreen', { titleObj, clubID, topicID });
        const onPress = (source === 'search') ? advanceToTitleScreen : () => advancetoCameraScreen(titleObj);

        return (
            <PosterContainer >
                <TitlePoster title={titleObj} width={POSTER_WIDTH} />
               {addCustomWatchlist ? <MarkSeen item={item}/> :null}
            </PosterContainer>
        );
    }

    const renderTitlePosterWatchlis = ({ item, index }) => {
        const titleObj = item?.title;
        const venue = "";
        const advanceToTitleScreen = () => navigation.push('TitleDetailScreen', { titleObj });
        // const advanceToSelectVenue = () => navigation.push('VenueSelectScreen', { titleObj, clubID, topicID });
        const onPress = (source === 'search') ? advanceToTitleScreen : () => advancetoCameraScreen(titleObj);

        return (
            <PosterContainer >
                <TitlePoster title={titleObj} width={POSTER_WIDTH} />
               {addCustomWatchlist ? <MarkSeen item={item?.title}/> :null}
            </PosterContainer>
        );
    }

    const getCameraPermissions = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        return (status === "granted");
    }

    const getMicPermissions = async () => {
        const { status } = await Camera.requestMicrophonePermissionsAsync();
        return (status === "granted");
    }

    const advancetoCameraScreen = async(titleObj) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const hasCameraPermissions = await getCameraPermissions();
        const hasMicPermissions = await getMicPermissions();
        const venue = "";
        if (hasCameraPermissions && hasMicPermissions) {
            navigation.push('ReelayCameraScreen', { titleObj, venue, topicID, clubID });    
            logAmplitudeEventProd('selectVenue', { venue });
        } else {
            alertCameraAccess();
        }
    }
    const alertCameraAccess = async () => {
        Alert.alert(
            "Please allow camera access",
            "To make a reelay, please enable camera and microphone permissions in your phone settings",
            [
              {
                text: "Cancel",
                style: "cancel"
              },
              { text: "Update camera settings", onPress: () => Linking.openSettings() }
            ]
        );        
    }

    const getItemLayout = (item, index) => {
        return {
            length: POSTER_HEIGHT_WITH_MARGIN,
            offset: index * POSTER_HEIGHT_WITH_MARGIN,
            index,
        }
    }

    const MyWatchlistAdd = () =>{
        return (
            <PosterGridContainer bottomOffset={bottomOffset}>
            <FlatList
                data={displayItems}
                ListHeaderComponent={
                <>
                    <TrendingText>My Watchlish Movies & Shows</TrendingText>
                </>}
                estimatedItemSize={POSTER_HEIGHT_WITH_MARGIN}
                getItemLayout={getItemLayout}
                keyExtractor={titleObj => titleObj?.id}
                numColumns={POSTER_ROW_LENGTH}
                ref={scrollRefWatch}
                renderItem={renderTitlePosterWatchlis}
            />
        </PosterGridContainer>
            )
    }

    useEffect(() => {
        // if (scrollRef.current && suggestedTitles?.length > 0) {
        //     scrollRef.current.scrollToIndex({ animated: false, index: 0 });
        // }
        // console.log("suggestedTitles",JSON.stringify(trendingMovieResults[0]))
    }, [selectedType]);

    return (
        <PosterGridContainer bottomOffset={bottomOffset}>
            <FlatList
                data={trendingMovieResults}
                ListHeaderComponent={
                <>

                    <HomeWatchlistCardView >
                        <HomeWatchlistCardFill />
                        <HomeWatchlistCardGradient colors={['rgba(255,255,255,0.65)', 'rgba(255,255,255,0)']} />
                        <FanOfPosters titles={trendingMovieResults.map(item => item)} trending={true}/>
                    </HomeWatchlistCardView>
                    <MyWatchlistAdd/>
                    <TrendingText>Trending Movies & TV Shows</TrendingText>
                </>}
                estimatedItemSize={POSTER_HEIGHT_WITH_MARGIN}
                getItemLayout={getItemLayout}
                keyExtractor={titleObj => titleObj?.id}
                numColumns={POSTER_ROW_LENGTH}
                ref={scrollRef}
                renderItem={renderTitlePoster}
            />
        </PosterGridContainer>
    );
}
