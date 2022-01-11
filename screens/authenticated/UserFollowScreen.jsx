import React, { useEffect, useState, useRef, useContext } from 'react';
import { SafeAreaView, View, Text } from 'react-native';

import BackButton from '../../components/utils/BackButton';
import SearchField from '../../components/create-reelay/SearchField';
import FollowResults from '../../components/profile/Follow/FollowResults';
import FollowButtonDrawer from '../../components/profile/Follow/FollowButtonDrawer';

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
const SearchBarContainer = styled(View)`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
`;


export default UserFollowScreen = ({ navigation, route }) => {
    const { cognitoUser, myFollowers, myFollowing } = useContext(AuthContext);

    const { creator, initFollowType, initFollowers, initFollowing } = route.params;
    const [searchText, setSearchText] = useState('');
    const [creatorFollowers, setCreatorFollowers] = useState(initFollowers);
    const [creatorFollowing, setCreatorFollowing] = useState(initFollowing);
    const [refreshing, setRefreshing] = useState(false);

    const allSearchResults = (initFollowType === 'Followers') ? creatorFollowers : creatorFollowing;
    const [searchResults, setSearchResults] = useState(allSearchResults);
    const [selectedFollowType, setSelectedFollowType] = useState(initFollowType);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerFollowObj, setDrawerFollowObj] = useState(null);
    const updateCounter = useRef(0);

    const headerText = `${creator.username}'s ${selectedFollowType.toLowerCase()}`
    const searchPlaceholderText = `Search ${selectedFollowType}`;

    useEffect(() => {
        updateCounter.current += 1;
        updateSearch(updateCounter.current);
    }, [
        searchText, 
        selectedFollowType, 
        creatorFollowers,
        creatorFollowing, 
    ]);

    useEffect(() => {
        // remember: these 
    }, [myFollowers, myFollowing]);

    const onRefresh = async () => {
        updateCounter.current += 1;
        setRefreshing(true);

        const followersRefresh = await getFollowers(creator.sub);
        const followingRefresh = await getFollowing(creator.sub);

        setCreatorFollowers(followersRefresh);
        setCreatorFollowing(followingRefresh);
        setRefreshing(false);
    }

    const updateSearch = async (counter) => {
        if (!searchText || searchText === undefined || searchText === '') {
            setSearchResults(allSearchResults);
        }

        try {
            if (updateCounter.current === counter) {
                const allFollowResults = (selectedFollowType === 'Followers') 
                    ? creatorFollowers 
                    : creatorFollowing;
                
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
					options={["Followers", "Following"]}
					selectedOption={selectedFollowType}
					onSelect={setSelectedFollowType}
				/>
			</SelectorBarContainer>
			<SearchBarContainer>
				<SearchField
					borderRadius={4}
					placeholderText={searchPlaceholderText}
					searchText={searchText}
					updateSearchText={updateSearchText}
				/>
			</SearchBarContainer>
			<FollowResults
				followType={selectedFollowType}
				navigation={navigation}
				onRefresh={onRefresh}
				refreshing={refreshing}
				searchResults={searchResults}
				setDrawerFollowObj={setDrawerFollowObj}
				setDrawerOpen={setDrawerOpen}
			/>
			{drawerOpen && (
				<FollowButtonDrawer
					creatorFollowers={creatorFollowers}
					setCreatorFollowers={setCreatorFollowers}
					drawerOpen={drawerOpen}
					setDrawerOpen={setDrawerOpen}
					followObj={drawerFollowObj}
					followType={selectedFollowType}
					sourceScreen={"UserFollowScreen"}
				/>
			)}
		</SearchScreenContainer>
	);
};
