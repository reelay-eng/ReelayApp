import React, { useContext, useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, View } from 'react-native';
import ClubSearchResultItem from './ClubSearchResultItem';

import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatList } from 'react-native-gesture-handler';
import { searchPublicClubs } from '../../api/ClubsApi';
import { AuthContext } from '../../context/AuthContext';
import { useSelector } from 'react-redux';

const ScreenContainer = styled(Pressable)`
    display: flex;
    flex: 1;
    padding-bottom: ${props => props.bottomOffset}px;
    width: 100%;
`

export default ClubSearchResults = ({ 
    navigation, 
    searchResults,
    searchText, 
    source, 
}) => {
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);
    const bottomOffset = useSafeAreaInsets().bottom + 16;
    const curPage = useRef(0);
    const [displayResults, setDisplayResults] = useState(searchResults);

    const onEndReached = async () => {
        curPage.current += 1;
        const nextSearchResults = await searchPublicClubs({
            authSession,
            page: curPage.current,
            reqUserSub: reelayDBUser?.sub,
            searchText,
        })
        setDisplayResults([...displayResults, ...nextSearchResults]);
    }

    const renderSearchResult = ({ item, index }) => {
        const result = item;
        return (
            <ClubSearchResultItem 
                key={result?.id}
                navigation={navigation} 
                result={result} 
                source={source} 
            />
        );
    }

    return (
        <ScreenContainer onPress={Keyboard.dismiss} bottomOffset={bottomOffset}>
            { (displayResults?.length > 0) &&
                <FlatList
                    data={displayResults}
                    renderItem={renderSearchResult}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.9}
                />
            }
        </ScreenContainer>
    );
}