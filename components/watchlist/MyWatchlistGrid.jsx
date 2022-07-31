import React, { Fragment } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import styled from 'styled-components/native';
import TitlePoster from '../global/TitlePoster';
import * as ReelayText from '../global/Text';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faListCheck } from '@fortawesome/free-solid-svg-icons';

const { width } = Dimensions.get('window');

const GRID_SIDE_MARGIN = 16;
const GRID_WIDTH = width - (2 * GRID_SIDE_MARGIN);

const POSTER_HALF_MARGIN = 4;
const POSTER_ROW_LENGTH = 4;
const POSTER_WIDTH = (GRID_WIDTH / POSTER_ROW_LENGTH) - (2 * POSTER_HALF_MARGIN);
const POSTER_HEIGHT = 1.5 * POSTER_WIDTH;

const ROW_COUNT = 3;
const POSTER_INDEX_CUTOFF = ROW_COUNT * POSTER_ROW_LENGTH;

const HeaderContainer = styled(View)`
    align-items: flex-end;
    flex-direction: row;
    margin-left: 8px;
    margin-top: 20px;
    margin-bottom: 8px;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    margin-left: 12px;
`
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
const SeeMyWatchlistPressable = styled(TouchableOpacity)`
    align-items: center;
    border-color: white;
    border-radius: 20px;
    border-width: 1px;
    height: 40px;
    justify-content: center;
    margin: 16px;
    margin-top: 8px;
    margin-bottom: 8px;
    width: ${width - 32}px;
`
const SeeMyWatchlistText = styled(ReelayText.Body2)`
    color: white;
`
const Spacer = styled(View)`
    height: 6px;
`

export default MyWatchlistGrid = ({ navigation }) => {
    const advanceToWatchlistScreen = () => navigation.push('WatchlistScreen');
    const myCreatorStacks = useSelector(state => state.myCreatorStacks);
    const myWatchlistItems = useSelector(state => state.myWatchlistItems);

    const SectionHeader = () => {
        return (
            <HeaderContainer>
                <HeaderText>{'My Watchlist'}</HeaderText>
            </HeaderContainer>
        );
    }

    const SeeMyWatchlistButton = () => {
        return (
            <SeeMyWatchlistPressable onPress={advanceToWatchlistScreen}>
                <SeeMyWatchlistText>{'See my watchlist'}</SeeMyWatchlistText>
            </SeeMyWatchlistPressable>
        );
    }

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
    const byHasSeen = (watchlistItem0, watchlistItem1) => {
        if (watchlistItem0.hasSeenTitle) return 1;
        if (watchlistItem1.hasSeenTitle) return -1;
        return 0;
    }

    const inDisplayRange = (watchlistItem, index) => index < POSTER_INDEX_CUTOFF;
    const displayWatchlistItems = myUnreelayedWatchlistItems.sort(byHasSeen).filter(inDisplayRange);
    
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
        <Fragment>
            <SectionHeader />
            <PosterGridContainer>
                { displayWatchlistItems.map(renderTitlePoster) }
            </PosterGridContainer>
            <Spacer />
            <SeeMyWatchlistButton />
        </Fragment>
    );
}
