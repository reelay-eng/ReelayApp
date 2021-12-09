import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, View, Pressable, Text } from 'react-native';

import BackButton from '../../components/utils/BackButton';
import SearchField from '../../components/create-reelay/SearchField';
import FollowResults from '../../components/profile/Follow/FollowResults';

import { ActionButton, PassiveButton } from '../../components/global/Buttons';
import styled from 'styled-components/native';

const TopBarContainer = styled(View)`
    width: 100%;
    display: flex;
    flex-direction: row;
`;
const SearchScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`;
const SelectorBarContainer = styled(View)`
    width: 75%;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    position: relative;
`;
const BackButtonContainer = styled(View)`
    position: relative;
    width: 15%;
    min-width: 30px;
    z-index: 3;
`;

export default MyFollowScreen = ({ navigation, route }) => {
    const { initFollowType, followers, following } = route.params;
    const [searchText, setSearchText] = useState('');

    const allSearchResults = (initFollowType === 'Followers') ? followers : following;
    const [searchResults, setSearchResults] = useState(allSearchResults);
    const [selectedFollowType, setSelectedFollowType] = useState(initFollowType);
    const updateCounter = useRef(0);

    const searchPlaceholderText = `Search ${selectedFollowType}`;

    useEffect(() => {
        updateCounter.current += 1;
        updateSearch(searchText, updateCounter.current);
    }, [searchText, selectedFollowType]);

    const updateSearch = async (newSearchText, counter) => {
        if (!newSearchText || newSearchText === undefined || newSearchText === '') {
            setSearchResults(allSearchResults);
            return;
        }

        try {
            const results = (selectedFollowType === 'Followers') ? followers : following;
            if (updateCounter.current === counter) {
                setSearchResults(results);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const updateSearchText = async (newSearchText) => {
        if (newSearchText !== searchText) {
            setSearchText(newSearchText);
        }
    };

    const SearchTypeSelector = ({ followType }) => {
        const selected = (selectedFollowType === followType);

        const SelectorContainer = styled(View)`
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            height: 36px;
            flex: 0.3;
        `;

        const onPress = () => {
            setSelectedFollowType(followType);
        }

        return (
            <SelectorContainer>
                {selected && (
                    <ActionButton onPress={onPress}
                        text={followType}
                        fontSize='18px'
                        borderRadius='15px' />
                )}
                {!selected && (
                    <PassiveButton onPress={onPress}
                        text={followType}
                        fontSize='18px'
                        borderRadius='15px'
                    />
                )}
            </SelectorContainer>
        );
    };

    return (
        <SearchScreenContainer>
            <TopBarContainer>
                <BackButtonContainer>
                    <BackButton navigation={navigation} />
                </BackButtonContainer>
                <SelectorBarContainer>
                    <SearchTypeSelector followType='Followers' />
                    <SearchTypeSelector followType='Following' />
                </SelectorBarContainer>
            </TopBarContainer>
            <SearchField
                searchText={searchText}
                updateSearchText={updateSearchText}
                placeholderText={searchPlaceholderText}
            />
            <FollowResults
                navigation={navigation}
                searchResults={searchResults}
                followType={selectedFollowType}
            />
        </SearchScreenContainer>
    );
};
