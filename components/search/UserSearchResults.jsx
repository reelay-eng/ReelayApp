import React, { useRef, useState } from "react";
import { FlatList, Keyboard, Pressable, View } from "react-native";
import UserSearchResultItem from "./UserSearchResultItem";

import styled from "styled-components/native";
import { searchUsers } from "../../api/ReelayDBApi";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ROW_HEIGHT = 165;
const FollowItemContainer = styled(View)`
    border-bottom-color: #505050;
    border-bottom-width: 0.3px;
`
const ScreenContainer = styled(Pressable)`
    display: flex;
    flex: 1;
    padding-bottom: ${props => props.bottomOffset}px;
    width: 100%;
`

const UserSearchResults = ({ navigation, searchResults, searchText }) => {
    const bottomOffset = useSafeAreaInsets().bottom + 16;
    const curPage = useRef(0);
    const [displayResults, setDisplayResults] = useState(searchResults);

    const onEndReached = async () => {
        console.log('on end reached: ', curPage.current + 1);
        curPage.current += 1;
        const nextSearchResults = await searchUsers(searchText, curPage.current);
        setDisplayResults([...displayResults, ...nextSearchResults]);
    }

    const renderSearchResult = ({ item, index }) => {
        const result = item;
        return (
            <FollowItemContainer key={index}>
                <UserSearchResultItem
                    result={result}
                    navigation={navigation}
                />
            </FollowItemContainer>
          );
    }

    return (
        <ScreenContainer bottomOffset={bottomOffset} onPress={Keyboard.dismiss}>
            {displayResults.length >= 1 && (
                <FlatList
                    data={displayResults}
                    renderItem={renderSearchResult}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.9}
                />
            )}
        </ScreenContainer>
    );
};

export default UserSearchResults;
