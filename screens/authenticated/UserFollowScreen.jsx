import React, { useEffect, useState, useRef, useContext } from 'react';
import { SafeAreaView, View, Text } from 'react-native';

import BackButton from '../../components/utils/BackButton';
import SearchField from '../../components/create-reelay/SearchField';
import FollowResults from '../../components/profile/Follow/FollowResults';

import { AuthContext } from '../../context/AuthContext';

import { ToggleSelector } from '../../components/global/Buttons';
import styled from 'styled-components/native';
import { getFollowers, getFollowing } from '../../api/ReelayDBApi';

const BackButtonContainer = styled(View)`
    margin-right: 10px;
`
const HeaderText = styled(Text)`
    align-self: center;
    font-family: System;
    font-size: 20px;
    font-weight: 500;
    color: white;
    margin-left: 10px;
`
const SearchScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const SelectorBarContainer = styled(View)`
    margin-top: 10px;
    margin-left: 15px;
    margin-right: 15px;
`
const TopBarContainer = styled(View)`
    width: 100%;
    display: flex;
    flex-direction: row;
    margin: 10px;
`

export default UserFollowScreen = ({ navigation, route }) => {
    const { cognitoUser, myFollowers, myFollowing } = useContext(AuthContext);

    const { creator, initFollowType, initFollowers, initFollowing } = route.params;
    const [searchText, setSearchText] = useState('');
    const [userFollowers, setUserFollowers] = useState(initFollowers);
    const [userFollowing, setUserFollowing] = useState(initFollowing);
    const [refreshing, setRefreshing] = useState(false);

    const allSearchResults = (initFollowType === 'Followers') ? userFollowers : userFollowing;
    const [searchResults, setSearchResults] = useState(allSearchResults);
    const [selectedFollowType, setSelectedFollowType] = useState(initFollowType);
    const updateCounter = useRef(0);

    const headerText = `${creator.username}'s ${selectedFollowType.toLowerCase()}`
    const searchPlaceholderText = `Search ${selectedFollowType}`;

    useEffect(() => {
        updateCounter.current += 1;
        updateSearch(updateCounter.current);
    }, [
        searchText, 
        selectedFollowType, 
        userFollowers,
        userFollowing, 
    ]);

    useEffect(() => {
        // remember: these 
    }, [myFollowers, myFollowing]);

    const onRefresh = async () => {
        updateCounter.current += 1;
        setRefreshing(true);

        const followersRefresh = await getFollowers(creator.sub);
        const followingRefresh = await getFollowing(creator.sub);

        setUserFollowers(followersRefresh);
        setUserFollowing(followingRefresh);
        setRefreshing(false);
    }

    const updateSearch = async (counter) => {
        if (!searchText || searchText === undefined || searchText === '') {
            setSearchResults(allSearchResults);
        }

        try {
            if (updateCounter.current === counter) {
                const allFollowResults = (selectedFollowType === 'Followers') 
                    ? userFollowers 
                    : userFollowing;
                
                const cleanedSearchText = searchText.toLowerCase();
                const filteredFollowResults = allFollowResults.filter((nextFollowObj) => {
                    const cleanedFollowName = (selectedFollowType === 'Followers') 
                        ? nextFollowObj.followerName.toLowerCase()
                        : nextFollowObj.creatorName.toLowerCase();
                    return cleanedFollowName.indexOf(cleanedSearchText) != -1; 
                });
                setSearchResults(filteredFollowResults);
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

    return (
        <SearchScreenContainer>
            <TopBarContainer>
                <BackButtonContainer>
                    <BackButton navigation={navigation} />
                </BackButtonContainer>
                <HeaderText>{headerText}</HeaderText>
            </TopBarContainer>
            <SelectorBarContainer>
                <ToggleSelector 
                    options={[ 'Followers', 'Following' ]}
                    selectedOption={selectedFollowType}
                    setSelectedOption={setSelectedFollowType}
                />
            </SelectorBarContainer>
            <SearchField
                borderRadius={6}
                placeholderText={searchPlaceholderText}
                searchText={searchText}
                updateSearchText={updateSearchText}
            />
            <FollowResults
                navigation={navigation}
                searchResults={searchResults}
                followType={selectedFollowType}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        </SearchScreenContainer>
    );
};
