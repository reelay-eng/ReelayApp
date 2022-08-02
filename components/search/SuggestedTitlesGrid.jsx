import React, { useRef } from 'react';
import { Dimensions, View } from 'react-native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import styled from 'styled-components/native';
import TitlePoster from '../global/TitlePoster';

const { width } = Dimensions.get('window');

const GRID_SIDE_MARGIN = 16;
const GRID_WIDTH = width - (2 * GRID_SIDE_MARGIN);

const POSTER_HALF_MARGIN = 4;
const POSTER_ROW_LENGTH = 3;
const POSTER_WIDTH = (GRID_WIDTH / POSTER_ROW_LENGTH) - (2 * POSTER_HALF_MARGIN);
const POSTER_HEIGHT_WITH_MARGIN = (POSTER_WIDTH * 1.5);

const ROW_COUNT = 3;
const POSTER_INDEX_CUTOFF = ROW_COUNT * POSTER_ROW_LENGTH;

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

export default SuggestedTitlesGrid = ({ navigation, suggestedTitles, extendSuggestedTitles }) => {
    // const inDisplayRange = (titleObj, index) => index < POSTER_INDEX_CUTOFF;
    // const displaySuggestedTitles = suggestedTitles.filter(inDisplayRange);
    const curPage = useRef(0);

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
        return (
            <PosterContainer key={titleObj?.id}>
                <TitlePoster title={titleObj} onPress={advanceToTitleScreen} width={POSTER_WIDTH} />
            </PosterContainer>
        );
    }

    return (
            <PosterGridContainer>
                <FlatList
                    numColumns={POSTER_ROW_LENGTH}
                    data={suggestedTitles}
                    renderItem={renderTitlePoster}
                    getItemLayout={getItemLayout}
                    contentContainerStyle={{ paddingBottom: 260 }}
                    onEndReached={extendSuggestedTitles}
                />
            </PosterGridContainer>
    );
}
