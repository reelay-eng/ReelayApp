import React, { useContext, useEffect, useRef, useState } from 'react';
import { SafeAreaView, View, Pressable, Text } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';

import {BaseHeader } from '../../components/global/Headers';
import SearchField from '../../components/create-reelay/SearchField';
import TitleSearchResults from '../../components/search/TitleSearchResults';
import { ActionButton, PassiveButton, ToggleSelector } from '../../components/global/Buttons';

import styled from 'styled-components/native';
import { searchTitles } from '../../api/ReelayDBApi';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import JustShowMeSignupPage from '../../components/global/JustShowMeSignupPage';

const TopBarContainer = styled(View)`
	display: flex;
	align-items: center;
	width: 100%;
	margin-bottom: 8px;
`;
const SelectorBarContainer = styled(View)`
	width: 90%;
	height: 40px;
`;
const SearchBarContainer = styled(View)`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
`;

export default SelectTitleScreen = ({ navigation }) => {
    
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchType, setSearchType] = useState('Film');
    const updateCounter = useRef(0);

    const { reelayDBUser } = useContext(AuthContext);
    const { setTabBarVisible } = useContext(FeedContext);

    useEffect(() => {
        setTabBarVisible(true);
    }, []);

    useEffect(() => {
        logAmplitudeEventProd('openSelectTitleScreen', {
            searchText,
            searchType,
            });
    }, [searchText, searchType]);

    if (reelayDBUser?.username === 'be_our_guest') {
        return <JustShowMeSignupPage navigation={navigation} />
    }

    const updateSearch = async (newSearchText, searchType, counter) => {
        if (!newSearchText || newSearchText === undefined || newSearchText === '') {
            setSearchResults([]);
            return;
        }

        try {
            if (searchType === 'Film') {
                annotatedResults = await searchTitles(newSearchText, false);
                if (counter === updateCounter.current) {
                    setSearchResults(annotatedResults);
                }
            } else {
                annotatedResults = await searchTitles(newSearchText, true);
                if (counter === updateCounter.current) {
                    setSearchResults(annotatedResults);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        updateCounter.current += 1;
        updateSearch(searchText, searchType, updateCounter.current);
    }, [searchText, searchType]);

    useEffect(() => {
    }, [searchResults])

    return (
		<SafeAreaView style={{ backgroundColor: "black", height: "100%", width: "100%" }}>
			<TopBarContainer>
                <BaseHeader text={"Create"} />
				<SelectorBarContainer>
					<ToggleSelector
						options={["Film", "TV"]}
						selectedOption={searchType}
						onSelect={(type) => {
							setSearchType(type);
						}}
					/>
				</SelectorBarContainer>
			</TopBarContainer>
			<SearchBarContainer>
				<SearchField
					searchText={searchText}
                    updateSearchText={setSearchText}
                    borderRadius={4}
					placeholderText="What did you see?"
				/>
			</SearchBarContainer>
			<TitleSearchResults
				navigation={navigation}
				searchResults={searchResults}
				source={"create"}
			/>
		</SafeAreaView>
	);
};