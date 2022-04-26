import React, { useContext, useEffect, useRef, useState } from 'react';
import { SafeAreaView, View, Pressable, Text } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useDispatch } from "react-redux";

import { BaseHeader, HeaderWithBackButton } from '../../components/global/Headers';
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
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
`;
const SelectorBarContainer = styled(View)`
	width: 90%;
	height: 40px;
`;
const TopBarContainer = styled(View)`
	display: flex;
	align-items: center;
	width: 100%;
	margin-bottom: 8px;
`;

// color is ReelayColors.reelayGreen at reduced opacity
const TopicTitleContainer = styled(View)`
    background-color: rgba(4, 189, 108, 0.65);
    border-radius: 40px;
    margin-top: -8px;
    margin-bottom: 24px;
    padding-top: 12px;
    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: 10px;
    width: 90%;
`
const TopicTitleText = styled(ReelayText.H6)`
    color: white;
    display: flex;
    flex-direction: row;
    font-size: 14px;
    line-height: 16px;
`
export default SelectTitleScreen = ({ navigation, route }) => {
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchType, setSearchType] = useState('Film');

    const topic = route?.params?.topic;
    const updateCounter = useRef(0);

    const { reelayDBUser } = useContext(AuthContext);
	const dispatch = useDispatch();

    if (reelayDBUser?.username === 'be_our_guest') {
        return <JustShowMeSignupPage navigation={navigation} headerText={'Make a Reelay'} />
    }

    const TopicLabel = () => {
        return (
            <TopicTitleContainer>
                <TopicTitleText numberOfLines={2}>{'Topic: '}{topic?.title}</TopicTitleText>
            </TopicTitleContainer>
        );
    }

    const updateSearch = async (newSearchText, searchType, counter) => {
        if (!newSearchText || newSearchText === undefined || newSearchText === '') {
            setSearchResults([]);
            return;
        }

        try {
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
        if (!topic){
            dispatch({ type: 'setTabBarVisible', payload: true }); 
        }
    })

    useEffect(() => {
        logAmplitudeEventProd('openSelectTitleScreen', { searchText, searchType });
    }, [searchText, searchType]);

    useEffect(() => {
        updateCounter.current += 1;
        updateSearch(searchText, searchType, updateCounter.current);
    }, [searchText, searchType]);

    return (
		<SafeAreaView style={{ backgroundColor: "black", height: "100%", width: "100%" }}>
			<TopBarContainer>
                { !topic && <BaseHeader text={"Create a reelay"} /> }
                { topic && <HeaderWithBackButton navigation={navigation} text={"Add a reelay"} /> }
                { topic && <TopicLabel /> }
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
                topicID={topic?.id}
			/>
		</SafeAreaView>
	);
};