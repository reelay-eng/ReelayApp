import React, { useEffect, useRef } from 'react';
import { Dimensions, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/native';
import TitlePoster from '../global/TitlePoster';

import { fetchPopularMovies, fetchPopularSeries } from '../../api/TMDbApi';

const { width } = Dimensions.get('window');

const GRID_SIDE_MARGIN = 16;
const GRID_WIDTH = width - (2 * GRID_SIDE_MARGIN);
const MAX_SUGGESTION_PAGE = 9; // multiple of 3 gives us a full bottom row

const POSTER_HALF_MARGIN = 4;
const POSTER_ROW_LENGTH = 3;
const POSTER_WIDTH = (GRID_WIDTH / POSTER_ROW_LENGTH) - (2 * POSTER_HALF_MARGIN);
const POSTER_HEIGHT_WITH_MARGIN = (POSTER_WIDTH * 1.5) + (2 * POSTER_HALF_MARGIN);

const PosterContainer = styled(View)`
    align-items: center;
    margin: ${POSTER_HALF_MARGIN}px;
`
const PosterGridContainer = styled(View)`
    justify-content: center;
    margin-top: 4px;
    margin-left: ${GRID_SIDE_MARGIN}px;
    margin-right: ${GRID_SIDE_MARGIN}px;
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

    const getItemLayout = (item, index) => {
        return {
            length: POSTER_HEIGHT_WITH_MARGIN,
            offset: POSTER_HEIGHT_WITH_MARGIN * index,
            index,
        }
    }
    
    const renderTitlePoster = ({ item, index }) => {
        const titleObj = item;
        const advanceToTitleScreen = () => navigation.push('TitleDetailScreen', { titleObj });
        const advanceToSelectVenue = () => navigation.push('VenueSelectScreen', { titleObj, clubID, topicID });
        const onPress = (source === 'search') ? advanceToTitleScreen : advanceToSelectVenue;
        return (
            <PosterContainer key={titleObj?.id}>
                <TitlePoster title={titleObj} onPress={onPress} width={POSTER_WIDTH} />
            </PosterContainer>
        );
    }

    useEffect(() => {
        if (scrollRef.current && suggestedTitles?.length > 0) {
            scrollRef.current.scrollToIndex({ animated: false, index: 0 });
        }
    }, [selectedType]);

    return (
            <PosterGridContainer>
                <FlatList
                    numColumns={POSTER_ROW_LENGTH}
                    data={suggestedTitles}
                    ref={scrollRef}
                    renderItem={renderTitlePoster}
                    getItemLayout={getItemLayout}
                    contentContainerStyle={{ paddingBottom: 260 }}
                    onEndReached={extendSuggestedTitles}
                />
            </PosterGridContainer>
    );
}
