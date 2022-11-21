import React, { Fragment, useEffect, useRef } from 'react';
import { Dimensions, FlatList, Pressable, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/native';
import TitlePoster from '../global/TitlePoster';

import { fetchPopularMovies, fetchPopularSeries } from '../../api/TMDbApi';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddToWatchlistButton from '../watchlist/AddToWatchlistButton';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const GRID_SIDE_MARGIN = 12;
const GRID_WIDTH = width - (2 * GRID_SIDE_MARGIN);
const MAX_SUGGESTION_PAGE = 9; // multiple of 3 gives us a full bottom row

const POSTER_HALF_MARGIN = 4;
const POSTER_ROW_LENGTH = 3;
const POSTER_WIDTH = (GRID_WIDTH / POSTER_ROW_LENGTH) - (2 * POSTER_HALF_MARGIN);
const POSTER_HEIGHT_WITH_MARGIN = (POSTER_WIDTH * 1.5) + (2 * POSTER_HALF_MARGIN);

const PosterContainer = styled(Pressable)`
    align-items: center;
    margin: ${POSTER_HALF_MARGIN}px;
    height: ${POSTER_WIDTH * 1.5}px;
    width: ${POSTER_WIDTH}px;
`
const PosterGridContainer = styled(SafeAreaView)`
    display: flex;
    flex: 1;
    justify-content: center;
    margin-left: ${GRID_SIDE_MARGIN}px;
    margin-right: ${GRID_SIDE_MARGIN}px;
    margin-bottom: 60px;
    min-height: ${POSTER_HEIGHT_WITH_MARGIN}px;
    width: ${GRID_WIDTH}px;
`

export default SuggestedTitlesGrid = ({ 
    navigation, 
    selectedType, 
    source='search',
    clubID=null,
    topicID=null,
}) => {
    const dispatch = useDispatch();
    const bottomOffset = useSafeAreaInsets().bottom;
    const scrollRef = useRef(null);
    const suggestedMovieResults = useSelector(state => state.suggestedMovieResults);
    const suggestedSeriesResults = useSelector(state => state.suggestedSeriesResults);

    const suggestedTitles = (selectedType === 'TV') 
        ? suggestedSeriesResults?.titles 
        : suggestedMovieResults?.titles;

    const extendSuggestedTitles = async () => {
        if (!['Film', 'TV'].includes(selectedType)) return;
        const { titles, nextPage } = (selectedType === 'TV') 
            ? suggestedSeriesResults 
            : suggestedMovieResults;

        if (nextPage > MAX_SUGGESTION_PAGE) return;

        switch (selectedType) {
            case 'Film':
                const nextMovieTitles = await fetchPopularMovies(nextPage);
                const nextSuggestedMovieResults = {
                    titles: [...titles, ...nextMovieTitles],
                    nextPage: nextPage + 1,
                }
                dispatch({ type: 'setSuggestedMovieResults', payload: nextSuggestedMovieResults });
                return;
            case 'TV':
                const nextSeriesTitles = await fetchPopularSeries(nextPage);
                const nextSuggestedSeriesResults = {
                    titles: [...titles, ...nextSeriesTitles],
                    nextPage: nextPage + 1,
                }
                dispatch({ type: 'setSuggestedSeriesResults', payload: nextSuggestedSeriesResults });
                return;
            default:
                return;
        }
    }
    
    const renderTitlePoster = ({ item, index }) => {
        const titleObj = item;
        const advanceToTitleScreen = () => navigation.push('TitleDetailScreen', { titleObj });
        const advanceToSelectVenue = () => navigation.push('VenueSelectScreen', { titleObj, clubID, topicID });
        const onPress = (source === 'search') ? advanceToTitleScreen : advanceToSelectVenue;
        return (
            <PosterContainer onPress={onPress}>
                <TitlePoster title={titleObj} width={POSTER_WIDTH} />
            </PosterContainer>
        );
    }

    const getItemLayout = (item, index) => {
        return {
            length: POSTER_HEIGHT_WITH_MARGIN,
            offset: index * POSTER_HEIGHT_WITH_MARGIN,
            index,
        }
    }

    useEffect(() => {
        if (scrollRef.current && suggestedTitles?.length > 0) {
            scrollRef.current.scrollToIndex({ animated: false, index: 0 });
        }
    }, [selectedType]);

    return (
        <PosterGridContainer bottomOffset={bottomOffset}>
            <FlatList
                data={suggestedTitles}
                estimatedItemSize={POSTER_HEIGHT_WITH_MARGIN}
                getItemLayout={getItemLayout}
                keyExtractor={titleObj => titleObj?.id}
                numColumns={POSTER_ROW_LENGTH}
                ref={scrollRef}
                renderItem={renderTitlePoster}
                onEndReached={extendSuggestedTitles}
            />
        </PosterGridContainer>
    );
}
