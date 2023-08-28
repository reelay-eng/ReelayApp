import React, { Fragment } from 'react';
import { Dimensions, Image, Pressable, View } from 'react-native';
import StarRating from '../global/StarRating';
import styled from 'styled-components/native';
import TitlePoster from '../global/TitlePoster';
import { LinearGradient } from "expo-linear-gradient";
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../global/Text';
import { FlashList } from '@shopify/flash-list';
import { firebaseCrashlyticsLog, firebaseCrashlyticsError } from '../utils/EventLogger';

const { width } = Dimensions.get('window');

const GRID_SIDE_MARGIN = 16;
const GRID_WIDTH = width - (2 * GRID_SIDE_MARGIN);

const POSTER_HALF_MARGIN = 4;
const POSTER_ROW_LENGTH = 3;
const CARD_SIDE_MARGIN = 6;
const POSTER_WIDTH = (width / 3) - (CARD_SIDE_MARGIN * 2)// (GRID_WIDTH / POSTER_ROW_LENGTH) - (2 * POSTER_HALF_MARGIN);
const POSTER_HEIGHT = 1.5 * POSTER_WIDTH;


const MAX_EMOJI_BADGE_COUNT = 3;
const WATCHLIST_CARD_WIDTH = (width / 3) - (CARD_SIDE_MARGIN * 2);
const BADGE_SIZE = (WATCHLIST_CARD_WIDTH / MAX_EMOJI_BADGE_COUNT) - 4;
const EMOJI_SIZE = BADGE_SIZE - 16;

const HeaderContainer = styled(View)`
    flex-direction: row;
    margin-left: -${GRID_SIDE_MARGIN / 2}px;
    margin-bottom: 16px;
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
const PosterGradient = styled(LinearGradient)`
    border-radius: 6px;
    height: ${POSTER_HEIGHT / 2}px;
    opacity: 0.85;
    position: absolute;
    top: ${POSTER_HEIGHT / 2}px;
    width: ${POSTER_WIDTH}px;
`
const PosterGridView = styled(View)`
    min-height: ${POSTER_HEIGHT}px;
    margin-top: 4px;
    margin-left: ${GRID_SIDE_MARGIN}px;
    margin-right: ${GRID_SIDE_MARGIN}px;
    width: ${GRID_WIDTH}px;
`
const StarRatingContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    bottom: 8px;
    position: absolute;
    z-index: 5;
`
export default ProfilePosterGrid = ({ creatorStacks, navigation, profile = 0 }) => {
    try {
        firebaseCrashlyticsLog('Profile poster grid screen');
        if (!creatorStacks.length) {
            return <View />;
        }

        const SectionHeader = () => {
            return (
                <HeaderContainer>
                    <HeaderText>{'Reelays'}</HeaderText>
                </HeaderContainer>
            );
        }

        const StarRatingLine = ({ rating }) => {
            return (
                <StarRatingContainer>
                    <StarRating
                        disabled={true}
                        rating={rating}
                        starSize={10}
                        starStyle={{ paddingRight: 2 }}
                    />
                </StarRatingContainer>
            );
        }

        const renderPoster = ({ item, index }) => {
            const stack = item;
            const starRating = (stack[0].starRating ?? 0) + (stack[0].starRatingAddHalf ? 0.5 : 0);

            const viewProfileFeed = () => {
                navigation.push('ProfileFeedScreen', {
                    initialFeedPos: index,
                    stackList: creatorStacks,
                });
            }

            return (
                <PosterContainer key={stack[0].title.id}>
                    <TitlePoster title={stack[0].title} onPress={viewProfileFeed} width={POSTER_WIDTH} />
                    {starRating > 0 && (
                        <Fragment>
                            <PosterGradient colors={["transparent", ReelayColors.reelayBlack]} />
                            <StarRatingLine rating={starRating} />
                        </Fragment>
                    )}
                </PosterContainer>
            );

        }

        return (
            <PosterGridView>
                {profile !== 1 &&
                    <SectionHeader />}
                <FlashList
                    data={creatorStacks}
                    // estimatedItemSize={POSTER_HEIGHT}
                    keyExtractor={stack => String(stack[0]?.sub)}
                    numColumns={POSTER_ROW_LENGTH}
                    renderItem={renderPoster}
                    showsVerticalScrollIndicator={false}
                />
            </PosterGridView>
        );
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
}
