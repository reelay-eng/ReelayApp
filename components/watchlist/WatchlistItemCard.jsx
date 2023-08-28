import React, { memo, useEffect, useState } from 'react';
import { Dimensions, Pressable, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import TitlePoster from '../global/TitlePoster';
import MarkSeenButton from './MarkSeenButton';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { logAmplitudeEventProd, firebaseCrashlyticsLog, firebaseCrashlyticsError } from '../utils/EventLogger';
import WatchlistItemDotMenu from './WatchlistItemDotMenu';
import MarkedSeenModal from './MarkedSeenModal';
import * as ReelayText from '../global/Text';
import { useSelector } from 'react-redux';
import ReelayColors from '../../constants/ReelayColors';
import { LinearGradient } from 'expo-linear-gradient';

const { height, width } = Dimensions.get('window');
const CARD_SIDE_MARGIN = 6;
const MAX_EMOJI_BADGE_COUNT = 3;
const WATCHLIST_CARD_WIDTH = (width / 3) - (CARD_SIDE_MARGIN * 2);
const BADGE_SIZE = (WATCHLIST_CARD_WIDTH / MAX_EMOJI_BADGE_COUNT) - 4;
const EMOJI_SIZE = BADGE_SIZE - 16;

const DotMenuGradient = styled(LinearGradient)`
    height: 48px;
    position: absolute;
    width: 100%;
`
const DotMenuPressable = styled(TouchableOpacity)`
    align-items: center;
    justify-content: flex-end;
    height: 32px;
    flex-direction: row;
    position: absolute;
    top: 0px;
    width: 100%;
    z-index: 150;
`
const EmojiBadgeRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    height: 40px;
    justify-content: center;
    margin-top: 6px;
    width: 100%;
`
const EmojiBadgeView = styled(View)`
    align-items: center;
    background-color: #1f1f1f;
    border-color: 4px;
    border-radius: 8px;
    justify-content: center;
    height: ${BADGE_SIZE}px;
    margin: 3px;
    width: ${BADGE_SIZE}px;
`
const EmojiBadgeText = styled(ReelayText.H6)`
    text-align: center;
    font-size: ${EMOJI_SIZE}px;
    line-height: ${EMOJI_SIZE + 6}px;
    width: 100%;
`
const MarkSeenRow = styled(View)`
    flex-direction: row;
    justify-content: flex-end;
    margin-top: 6px;
    margin-bottom: 6px;
    width: 100%;
`
const Spacer = styled(View)`
    width: 8px;
`
const WatchlistCardView = styled(Pressable)`
    border-radius: 12px;
    margin: ${CARD_SIDE_MARGIN}px;
    width: ${WATCHLIST_CARD_WIDTH}px;
`

const WatchlistItemCard = ({ navigation, onMoveToFront, onRemoveItem, watchlistItem, Redirect }) => {
    try {
        firebaseCrashlyticsLog('WatchList Item Card');
        const matchWatchlistItem = item => item?.id === watchlistItem?.id;
        const getWatchlistItem = state => state.myWatchlistItems.find(matchWatchlistItem);
        const nextWatchlistItem = useSelector(getWatchlistItem);

        const advanceToTitleDetailScreen = () => navigation.push('TitleDetailScreen', {
            titleObj: watchlistItem.title,
            fromWatchlist: true,
            Redirect: Redirect
        });

        const [drawerVisible, setDrawerVisible] = useState(false);
        const [showMarkedSeenModal, setShowMarkedSeenModal] = useState(false);
        const closeDrawer = () => setDrawerVisible(false);

        const getDisplayEmojis = (reactEmojis = watchlistItem?.reactEmojis) => {
            const displayEmojis = [];
            for (let ii = 0; ii < reactEmojis.length; ii += 2) {
                const emoji = reactEmojis.charAt(ii) + reactEmojis.charAt(ii + 1);
                displayEmojis.push(emoji);
            }
            return displayEmojis;
        }

        const [displayEmojis, setDisplayEmojis] = useState(getDisplayEmojis());
        const showReactEmojis = displayEmojis?.length > 0;

        const onMarkedSeen = () => {
            setShowMarkedSeenModal(true);
        }

        useEffect(() => {
            setDisplayEmojis(getDisplayEmojis(nextWatchlistItem?.reactEmojis));
        }, [nextWatchlistItem]);

        const DotMenuButton = () => {
            return (
                <DotMenuPressable activeOpacity={0.7} onPress={() => setDrawerVisible(true)}>
                    <DotMenuGradient colors={['transparent', ReelayColors.reelayBlack]} start={{ x: 0, y: 1 }} end={{ x: 0, y: -0.5 }} />
                    <FontAwesomeIcon icon={faEllipsis} color='white' size={20} />
                    <Spacer />
                </DotMenuPressable>
            );
        }

        const EmojiBadgeRow = () => {
            const renderEmojiBadge = (emoji) => {
                return (
                    <EmojiBadgeView key={emoji}>
                        <EmojiBadgeText>{emoji}</EmojiBadgeText>
                    </EmojiBadgeView>
                );
            }

            return (
                <EmojiBadgeRowView>
                    {displayEmojis.map(renderEmojiBadge)}
                </EmojiBadgeRowView>
            )
        }

        const MarkSeen = () => {
            return (
                <MarkSeenRow>
                    <MarkSeenButton
                        onMarkedSeen={onMarkedSeen}
                        showText={true}
                        size={36}
                        watchlistItem={watchlistItem}
                    />
                </MarkSeenRow>
            );
        }

        return (
            <WatchlistCardView onPress={advanceToTitleDetailScreen}>
                <TitlePoster title={watchlistItem.title} width={WATCHLIST_CARD_WIDTH} />
                <DotMenuButton />
                {showReactEmojis && <EmojiBadgeRow />}
                {!showReactEmojis && <MarkSeen />}
                {drawerVisible && (
                    <WatchlistItemDotMenu
                        closeDrawer={closeDrawer}
                        navigation={navigation}
                        onMoveToFront={onMoveToFront}
                        onRemoveItem={onRemoveItem}
                        watchlistItem={watchlistItem}
                    />
                )}
                {showMarkedSeenModal && (
                    <MarkedSeenModal
                        closeModal={() => setShowMarkedSeenModal(false)}
                        navigation={navigation}
                        setCardDisplayEmojis={setDisplayEmojis}
                        watchlistItem={watchlistItem}
                    />
                )}
            </WatchlistCardView>
        );
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
}

export default memo(WatchlistItemCard, (prevProps, nextProps) => true);