import React from 'react';
import { Dimensions, Image, Pressable, View } from 'react-native';
import { useSelector } from 'react-redux';
import styled from 'styled-components/native';
import TitlePoster from '../global/TitlePoster';

const { width } = Dimensions.get('window');

const GRID_SIDE_MARGIN = 16;
const GRID_WIDTH = width - (2 * GRID_SIDE_MARGIN);

const POSTER_HALF_MARGIN = 4;
const POSTER_ROW_LENGTH = 4;
const POSTER_WIDTH = (GRID_WIDTH / POSTER_ROW_LENGTH) - (2 * POSTER_HALF_MARGIN);
const POSTER_HEIGHT = 1.5 * POSTER_WIDTH;

const PosterContainer = styled(View)`
    align-items: center;
    margin: ${POSTER_HALF_MARGIN}px;
`
const PosterGridContainer = styled(View)`
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 4px;
    margin-left: ${GRID_SIDE_MARGIN}px;
    margin-right: ${GRID_SIDE_MARGIN}px;
    width: ${GRID_WIDTH}px;
`
export default MyWatchlistGrid = ({ navigation }) => {
    const myCreatorStacks = useSelector(state => state.myCreatorStacks);
    const myWatchlistItems = useSelector(state => state.myWatchlistItems);

    const hasNotReelayedTitle = (watchlistItem) => {
        const foundReelay = myCreatorStacks.find((reelayStack) => {
            const tmdbTitleID = reelayStack[0]?.title?.id;
            const titleType = reelayStack[0]?.title?.titleType;
            return (tmdbTitleID === watchlistItem.title?.id 
                && titleType === watchlistItem.title?.titleType);
        });
        return !foundReelay;
    }

    const myUnreelayedWatchlistItems = myWatchlistItems.filter(hasNotReelayedTitle);

    // display unseen titles first in watchlist
    const byHasSeen = (a, b) => {
        if (a.hasSeenTitle) return 1;
        if (b.hasSeenTitle) return -1;
        return 0;
    }
    
    const sortedWatchlistItems = myUnreelayedWatchlistItems.sort(byHasSeen);
    
    const renderTitlePoster = (item, index) => {
        const title = item?.title;
        const advanceToTitleScreen = () => navigation.push('TitleDetailScreen', { titleObj: title });
        return (
            <PosterContainer key={title.id}>
                <TitlePoster title={title} onPress={advanceToTitleScreen} width={POSTER_WIDTH} />
            </PosterContainer>
        );
    }

    return (
        <PosterGridContainer>
            { sortedWatchlistItems.map(renderTitlePoster) }
        </PosterGridContainer>
    );
}
