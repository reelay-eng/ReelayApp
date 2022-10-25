import React, { useContext, useEffect, useRef, useState } from 'react';
import { SafeAreaView, View, Pressable, Text, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useDispatch } from "react-redux";
import { Icon } from 'react-native-elements';

import { HeaderWithBackButton } from '../../components/global/Headers';
import * as ReelayText from '../../components/global/Text';
import SearchField from '../../components/create-reelay/SearchField';
import TitleSearchResults from '../../components/search/TitleSearchResults';
import { ToggleSelector } from '../../components/global/Buttons';

import styled from 'styled-components/native';
import { searchTitles } from '../../api/ReelayDBApi';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import JustShowMeSignupPage from '../../components/global/JustShowMeSignupPage';
import { useFocusEffect } from '@react-navigation/native';
import SuggestedTitlesGrid from '../../components/search/SuggestedTitlesGrid';
import { TopicsBannerIconSVG } from '../../components/global/SVGs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyTitleObject } from '../../api/TMDbApi';

const { width } = Dimensions.get('window');

const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    margin-top: 8px;
    font-size: 24px;
    line-height: 24px;
    text-align: left;
`
const SearchBarContainer = styled(View)`
	align-items: center;
	justify-content: center;
    padding-left: 3px;
    padding-right: 3px;
    width: 100%;
`;
const SelectorBarContainer = styled(View)`
	height: 40px;
    margin-bottom: 8px;
    padding-left: 12px;
    padding-right: 12px;
    width: 100%;
`;
const TopBarContainer = styled(View)`
    margin-bottom: 12px;
    padding-right: 12px;
	width: 100%;
`

const TopicSkipText = styled(ReelayText.H6Emphasized)`
    color: black;
    font-size: 14px;
`
const TopicSkipPressable = styled(TouchableOpacity)`
    background-color: #rgba(255,255,255,0.9);
    border-radius: 20px;
    padding: 4px 20px 4px 20px
    position: absolute;
    top: 4px;
    right: 10px;
`

const TopicTitleContainer = styled(View)`
    align-items: center;
    background-color: #421C79;
    border-radius: 0px;
    flex-direction: row;
    margin-top: 4px;
    margin-bottom: 4px;
    padding-top: 12px;
    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: 12px;
    width:100%;
`
const TopicTitleText = styled(ReelayText.H6)`
    color: white;
    display: flex;
    flex-direction: row;
    font-size: 14px;
    line-height: 18px;
    margin-left: 16px;
    margin-right: 16px;
`
export default SelectTitleScreen = ({ navigation, route }) => {
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchType, setSearchType] = useState('Film');
    const searchTextEmpty = (!searchText || searchText === undefined || searchText === '');

    /**
     * Topic obj requires two elements only: { id, title }
     */

    const clubID = route?.params?.clubID;
    const topic = route?.params?.topic;
    const updateCounter = useRef(0);

    const { reelayDBUser } = useContext(AuthContext);
	const dispatch = useDispatch();

    if (reelayDBUser?.username === 'be_our_guest') {
        return <JustShowMeSignupPage navigation={navigation} headerText={'Make a Reelay'} />
    }

    const TopicSkipButton = () => {
        const topOffset = useSafeAreaInsets().top;

        const skipToCameraScreen = () => {
            navigation.push('ReelayCameraScreen', { 
                titleObj: EmptyTitleObject, 
                venue: '', 
                topicID: topic?.id, 
                clubID,
            });    
        };
        return (
            <TopicSkipPressable onPress={skipToCameraScreen} topOffset={topOffset}>
                <TopicSkipText>{'Skip'}</TopicSkipText>
            </TopicSkipPressable>
        )
    }

    const TopicLabel = () => {
        return (
            <TopicTitleContainer>
                <TopicsBannerIconSVG />
                <TopicTitleText numberOfLines={2}>{topic?.title}</TopicTitleText>
            </TopicTitleContainer>
        );
    }

    const updateSearch = async (newSearchText, searchType, counter) => {
        if (!newSearchText || newSearchText === undefined || newSearchText === '') {
            setSearchResults([]);
            return;
        }

        try {
            setLoading(true);
            if (searchType === 'Film') {
                const annotatedResults = await searchTitles(newSearchText, false);
                if (counter === updateCounter.current) {
                    setSearchResults(annotatedResults);
                }
            } else {
                const annotatedResults = await searchTitles(newSearchText, true);
                if (counter === updateCounter.current) {
                    setSearchResults(annotatedResults);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    useFocusEffect(() => {
        if (!topic) {
            dispatch({ type: 'setTabBarVisible', payload: true }); 
        }
    })

    useEffect(() => {
        logAmplitudeEventProd('openSelectTitleScreen', { searchText, searchType });
    }, []);

    useEffect(() => {
        updateCounter.current += 1;
        const nextUpdateCounter = updateCounter.current;
        setTimeout(() => {
            updateSearch(searchText, searchType, nextUpdateCounter);
        }, 200);
    }, [searchText, searchType]);

    useEffect(() => {
        setLoading(false);
    }, [searchResults]);

    return (
		<SafeAreaView style={{ backgroundColor: "black", alignItems: 'center', height: "100%", width: "100%" }}>
			<TopBarContainer>
                { !topic && <HeaderWithBackButton navigation={navigation} text={"what did you see?"} /> }
                { topic && <HeaderWithBackButton navigation={navigation} text={"add a reelay"} /> }
                { topic && <TopicLabel /> }
                { topic && <TopicSkipButton /> }
			</TopBarContainer>
            <SelectorBarContainer>
                <ToggleSelector
                    options={["Film", "TV"]}
                    selectedOption={searchType}
                    onSelect={(type) => {
                        setSearchType(type);
                    }}
                />
            </SelectorBarContainer>
            <SearchBarContainer>
				<SearchField
					searchText={searchText}
                    updateSearchText={setSearchText}
                    borderRadius={4}
					placeholderText={(searchType === 'TV') ? "Search TV shows..." : "Search films..."}
				/>
			</SearchBarContainer>
            { loading && <ActivityIndicator /> }
            { !loading && searchTextEmpty && (
                <SuggestedTitlesGrid
                    navigation={navigation}
                    selectedType={searchType}
                    source='create'
                    clubID={clubID ?? null}
                    topicID={topic?.id ?? null}
                />
            )}
            { !loading && !searchTextEmpty && (
                <TitleSearchResults
                    navigation={navigation}
                    searchResults={searchResults}
                    searchText={searchText}
                    isSeries={(searchType === 'TV')}
                    source={"create"}
                    clubID={clubID ?? null}
                    topicID={topic?.id ?? null}
                />
            )}
		</SafeAreaView>
	);
};