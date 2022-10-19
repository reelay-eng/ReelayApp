import React, { useContext, useEffect, useRef, useState } from 'react';
import { SafeAreaView, View, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useDispatch } from "react-redux";

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
`;

export default SelectCorrectGuessScreen = ({ navigation, route }) => {
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchType, setSearchType] = useState('Film');
    const searchTextEmpty = (!searchText || searchText === undefined || searchText === '');

    /**
     * Topic obj requires two elements only: { id, title }
     */

    const clubID = route?.params?.clubID;
    const title = route?.params?.title;
    const updateCounter = useRef(0);

    const { reelayDBUser } = useContext(AuthContext);
	const dispatch = useDispatch();

    if (reelayDBUser?.username === 'be_our_guest') {
        return <JustShowMeSignupPage navigation={navigation} headerText={'Make a Reelay'} />
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
        dispatch({ type: 'setTabBarVisible', payload: false }); 
    })

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
               <HeaderWithBackButton navigation={navigation} text={"create guessing game"} />
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
            { !loading && !searchTextEmpty && (
                <TitleSearchResults
                    navigation={navigation}
                    searchResults={searchResults}
                    searchText={searchText}
                    isSeries={(searchType === 'TV')}
                    source={"createGuessingGame"}
                    clubID={clubID ?? null}
                    game={{ title }}
                />
            )}
		</SafeAreaView>
	);
};