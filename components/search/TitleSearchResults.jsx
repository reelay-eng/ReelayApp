import React, { useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, View } from 'react-native';
import TitleSearchResultItem from './TitleSearchResultItem';

import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { searchTitles } from '../../api/ReelayDBApi';
import { FlatList } from 'react-native-gesture-handler';

const ScreenContainer = styled(Pressable)`
    display: flex;
    flex: 1;
    padding-bottom: ${props => props.bottomOffset}px;
    width: 100%;
`

export default TitleSearchResults = ({ 
    clubID, 
    isSeries,
    navigation, 
    onGuessTitle = () => {},
    searchResults,
    searchText, 
    source, 
    topicID,
    addCustomWatchlist = false
}) => {
    const bottomOffset = useSafeAreaInsets().bottom + 16;
    const curPage = useRef(0);
    const [displayResults, setDisplayResults] = useState(searchResults);

    const onEndReached = async () => {
        curPage.current += 1;
        const nextSearchResults = await searchTitles(searchText, isSeries, curPage.current);
        setDisplayResults([...displayResults, ...nextSearchResults]);
    }

    const renderSearchResult = ({ item, index }) => {
        const result = item;
        return (
            <TitleSearchResultItem 
                key={result?.id}
                navigation={navigation} 
                onGuessTitle={onGuessTitle}
                result={result} 
                source={source} 
                clubID={clubID}
                topicID={topicID}
                addCustomWatchlist={addCustomWatchlist}
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