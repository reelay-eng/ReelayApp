import React, { useState } from 'react';
import { Dimensions, Pressable, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import TitlePoster from '../global/TitlePoster';
import MarkSeenButton from './MarkSeenButton';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import WatchlistItemDotMenu from './WatchlistItemDotMenu';
 
const { height, width } = Dimensions.get('window');
const CARD_SIDE_MARGIN = 6;
const WATCHLIST_CARD_WIDTH = (width / 3) - (CARD_SIDE_MARGIN * 2);

const DotMenuPressable = styled(TouchableOpacity)`
    align-items: center;
    justify-content: center;
    padding: 6px;
    position: absolute;
    right: 4px;
    top: 4px;
`
const MarkSeenRow = styled(View)`
    flex-direction: row;
    justify-content: flex-end;
    margin-top: 6px;
    margin-bottom: 6px;
    width: 100%;
`
const WatchlistCardView = styled(Pressable)`
    border-radius: 12px;
    margin: ${CARD_SIDE_MARGIN}px;
    width: ${WATCHLIST_CARD_WIDTH}px;
`

export default WatchlistItemCard = ({ navigation, watchlistItem }) => {
    const advanceToTitleDetailScreen = () => navigation.push('TitleDetailScreen', { titleObj: watchlistItem.title });
    const [markedSeen, setMarkedSeen] = useState(watchlistItem?.hasSeenTitle);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const closeDrawer = () => setDrawerVisible(false);

    const DotMenuButton = () => {
        return (
            <DotMenuPressable onPress={() => setDrawerVisible(true)}>
                <FontAwesomeIcon icon={faEllipsis} color='white' size={20} />
            </DotMenuPressable>
        );
    }

    const MarkSeen = () => {
        return (
            <MarkSeenRow>
                <MarkSeenButton 
                    markedSeen={markedSeen} 
                    setMarkedSeen={setMarkedSeen} 
                    showText={true} 
                    size={36}
                    titleObj={watchlistItem?.title} 
                />
            </MarkSeenRow>
        );
    }

    return (
        <WatchlistCardView onPress={advanceToTitleDetailScreen}>
            <TitlePoster title={watchlistItem.title} width={WATCHLIST_CARD_WIDTH} />
            <DotMenuButton />
            <MarkSeen />
            { drawerVisible && (
                <WatchlistItemDotMenu 
                    closeDrawer={closeDrawer} 
                    navigation={navigation} 
                    watchlistItem={watchlistItem}
                />
            )}
        </WatchlistCardView>
    );
}