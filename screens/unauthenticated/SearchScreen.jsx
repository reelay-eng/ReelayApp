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
import { logAmplitudeEventProd } from "../../components/utils/EventLogger";

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
import { showErrorToast, showMessageToast } from "../../components/utils/toasts";
import { async } from "validate.js";
import { createList, getLists, updateMoviesList } from "../../api/ListsApi";

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
export default SearchTitleScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const addToWatchlist = true;
    const addCustomWatchlist = true;
    const ListData = route?.params?.ListData ?? {};
    const fromListAdd = route?.params?.fromListAdd ?? false;
    const fromListUpdate = route?.params?.fromListUpdate ?? false;
    const initialSearchType = 'Film';
    const Redirect = route?.params?.Redirect ?? 0;
    const [listLoading, setListLoading] = useState(false);

    const myWatchlistItems = useSelector(state => state.myWatchlistItems);
    const myWatchlistRecs = useSelector(state => state.myWatchlistRecs);
    const addCustomProfile = useSelector(state => state.addCustomProfile);

    const goBack = () => { navigation.goBack(); }

    const callMultiple = async() =>{
        if(addCustomProfile.length < 2){
            showErrorToast('Ruh roh! You need to select atleast two titles.');
            return false;
        }
        console.log(addCustomProfile)
       const addcusto = await addToMyCustomlist({
            reqUserSub: reelayDBUser?.sub,
            titleData: addCustomProfile
        });
        console.log("addcusto",addcusto)
        const getItems = await getCustomItems(reelayDBUser?.sub);
        dispatch({ type: 'setCustomWatchData', payload: getItems });
        dispatch({ type: 'setAddCustomProfile', payload: [] });
        navigation.navigate('SelectMovieScreen')
        dispatch({ type: 'setOpenAddTitle', payload: false });
    }

    const getListss = async() =>{
        dispatch({ type: 'setListData', payload: [] });
        const GetListData = await getLists({reqUserSub:reelayDBUser?.sub});
        dispatch({ type: 'setListData', payload: GetListData });
    }

    const addMoviesWithTopic = async() => {
        setListLoading(true)
        let List = ListData;
        List["array"] = addCustomProfile;

        const publishResult = await createList(List);
        console.log('publishResult',publishResult);
         if (!publishResult || publishResult?.error) {
                showErrorToast('Something went wrong! Could not create topic');
                setListLoading(false);
            } else {
                await getListss();
                showMessageToast('List created');
                navigation.pop(2) 
                setListLoading(false);
                dispatch({ type: 'setAddCustomProfile', payload: [] });
                logAmplitudeEventProd('createdLists', {
                    title: List.listName,
                    description: List.description,
                    creatorName: reelayDBUser?.username,
                });

            }
    }

    const updateMoviesWithTopic = async() => {
        // setListLoading(true)

        setListLoading(true)
        let array =  addCustomProfile.map(obj => ({ ...obj, listId: ListData?.id }))
        let postBody = {array}
        // console.log("updateMoviesList",postBody)
        // return;
        const publishResult = await updateMoviesList(reelayDBUser?.sub, postBody);
         if (!publishResult || publishResult?.error) {
                showErrorToast('Something went wrong! Could not create topic');
                setListLoading(false);
            } else {
                showMessageToast('List Updated');
                navigation.pop() 
                setListLoading(false);
                dispatch({ type: 'setAddCustomProfile', payload: [] });
                logAmplitudeEventProd('updatedLists', {
                    title: ListData.listName,
                    description: ListData.description,
                    creatorName: reelayDBUser?.username,
                });

            }
    }

    const skipp = async() =>{
        // navigation.replace('HomeScreen')  
        navigation.reset({
            index: 0,
            routes: [{name: 'HomeScreen'}],
          }) 
    }

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });


    return (
		<SearchScreenView>
			<HeaderView>
                {fromListAdd || fromListUpdate ? <BackButtonPressable onPress={goBack}>
                    <Icon type="ionicon" name="arrow-back-outline" color="white" size={24} />
				</BackButtonPressable>:null}
				 <HeaderText>{""}</HeaderText> 
                 {!fromListAdd && !fromListUpdate ? <Pressable  style={{position:"absolute",right:30}} onPress={addCustomProfile?.length !== 0 ?callMultiple:skipp}>
					<SkipText>{addCustomProfile?.length !== 0 ? "Done":"Skip"}</SkipText>
				</Pressable>:
                (listLoading?<ActivityIndicator style={{position:"absolute",right:30}} size={"small"} color={"#fff"}/>:
                <Pressable  style={{position:"absolute",right:30}} onPress={()=> fromListUpdate ? updateMoviesWithTopic():addMoviesWithTopic()}>
                <SkipText>{"Done"}</SkipText>
            </Pressable>)}
			</HeaderView>
            <SearchBarWithResults navigation={navigation} initialSearchType={initialSearchType} addToWatchlist={addToWatchlist} addCustomWatchlist={addCustomWatchlist} fromListAdd={fromListAdd} ListData={ListData} fromListUpdate={fromListUpdate} />
		</SearchScreenView>
	);
};

const SearchBarWithResults = ({ navigation, initialSearchType, addToWatchlist, addCustomWatchlist, fromListAdd, ListData, fromListUpdate }) => {
    const dispatch = useDispatch();
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const myFollowing = useSelector(state => state.myFollowing);
    const isGuestUser = (reelayDBUser?.username === 'be_our_guest');
    const allSearchOptions =  ['Film', 'TV']
    const tabOptions = addToWatchlist || addCustomWatchlist
    ? ['Film', 'TV'] 
        : allSearchOptions;

    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedType, setSelectedType] = useState(initialSearchType);

    const searchTextEmpty = (!searchText || searchText === undefined || searchText === '');
    const showSuggestions = searchTextEmpty;
    const updateCounter = useRef(0);

    useEffect(() => {
        updateCounter.current += 1;
        const nextUpdateCounter = updateCounter.current;
        setTimeout(() => {
            updateSearch(searchText, selectedType, nextUpdateCounter);
        }, 200);
    }, [searchText, selectedType]);

    useEffect(() => {
        setLoading(false);
    }, [searchResults]);



    const updateSearch = async (newSearchText, searchType, counter) => {
        if (searchTextEmpty) {            
            setSearchResults([]);
            return;
        }

        try {
            setLoading(true);
            let annotatedResults = await searchBothTitles(newSearchText);
            

            if (updateCounter.current === counter) {
                setSearchResults(annotatedResults);
                logAmplitudeEventProd('searchBothTVandMovie', {
                    username: reelayDBUser?.sub,
                    searchText: newSearchText,
                    searchType: searchType,
                    source: 'search',
                });        
            }
        } catch (error) {
            console.log(error);
        }
    };

    const updateSearchText = async (newSearchText) => {
        if (newSearchText !== searchText) {
            setSearchText(newSearchText);
        }
    }


    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });

    const SearchResults = () => {
        return (
            <Fragment>
                    <TitleSearchResults
                        navigation={navigation}
                        searchResults={searchResults}
                        searchText={searchText}
                        isSeries={(selectedType === 'TV')}
                        source={"search"}
                        addCustomWatchlist={addCustomWatchlist}
                    />
                
            </Fragment>
        );
    }

    return (
        <React.Fragment>
            <HeaderTextLight>{fromListAdd || fromListUpdate ? "Choose titles you love":"Choose 2 titles you love"}</HeaderTextLight> 
            {/* <TopBar /> */}
            <SearchBarView>
                <SearchField
                    backgroundColor="#232425"
                    border={false}
                    borderRadius={4}
                    searchText={searchText}
                    updateSearchText={updateSearchText}
                    placeholderText={`Search Movies & TV `}
                />
            </SearchBarView>
            { !loading && !showSuggestions && <SearchResults /> }
            { !loading && showSuggestions && (
                <TrendingTitlesGrid 
                    navigation={navigation} 
                    selectedType={selectedType}
                    source='search'
                    addCustomWatchlist={addCustomWatchlist}
                /> 
            )}
            { loading && <ActivityIndicator /> }
        </React.Fragment>
    )
}
