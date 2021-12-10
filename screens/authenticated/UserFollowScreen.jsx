import React, { useEffect, useState, useRef, useContext } from 'react';
import { SafeAreaView, View, Pressable, Text } from 'react-native';

import BackButton from '../../components/utils/BackButton';
import SearchField from '../../components/create-reelay/SearchField';
import FollowResults from '../../components/profile/Follow/FollowResults';

import { AuthContext } from '../../context/AuthContext';

import { ActionButton, PassiveButton } from '../../components/global/Buttons';
import styled from 'styled-components/native';
import { getFollowers, getFollowing } from '../../api/ReelayDBApi';

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
                        borderRadius='15px' 
                    />
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
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        </SearchScreenContainer>
    );
};
