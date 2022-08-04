import React, { Fragment } from 'react';
import { Dimensions, Image, Pressable, View } from 'react-native';
import StarRating from 'react-native-star-rating';
import styled from 'styled-components/native';
import TitlePoster from '../global/TitlePoster';
import { LinearGradient } from "expo-linear-gradient";
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../global/Text';

const { width } = Dimensions.get('window');

const GRID_SIDE_MARGIN = 16;
const GRID_WIDTH = width - (2 * GRID_SIDE_MARGIN);

const POSTER_HALF_MARGIN = 4;
const POSTER_ROW_LENGTH = 4;
const POSTER_WIDTH = (GRID_WIDTH / POSTER_ROW_LENGTH) - (2 * POSTER_HALF_MARGIN);
const POSTER_HEIGHT = 1.5 * POSTER_WIDTH;

const HeaderContainer = styled(View)`
    align-items: flex-end;
    flex-direction: row;
    margin-left: 8px;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    margin-left: 12px;
`
const InvisiblePosterContainer = styled(View)`
    height: ${POSTER_HEIGHT}px;
    width: ${POSTER_WIDTH}px;
    margin: ${POSTER_HALF_MARGIN}px;
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
const StarRatingContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    bottom: 8px;
    position: absolute;
`
export default ProfilePosterGrid = ({ creatorStacks, navigation }) => {
    if (!creatorStacks.length) {
        return <View />;
    }

    const AfterImage = () => {
        // afterimages are invisible views that keep the grid aligned. 
        // it's a hacky solution for now
        return (
            <InvisiblePosterContainer />
        );
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
					emptyStarColor={'#c4c4c4'}
					maxStars={5}
					fullStarColor={'white'}
					halfStarEnabled={true}
					rating={rating}
					starSize={10}
					starStyle={{ paddingRight: 2 }}
				/>
			</StarRatingContainer>
		);
	}

    const renderStack = (stack, index) => {
        const viewProfileFeed = () => {
            navigation.push('ProfileFeedScreen', { 
                initialFeedPos: index, 
                stackList: creatorStacks, 
            });
        }

        const starRating = (stack[0].starRating ?? 0) + (stack[0].starRatingAddHalf ? 0.5 : 0);

        return (
            <PosterContainer key={stack[0].title.id}>
                <TitlePoster title={stack[0].title} onPress={viewProfileFeed} width={POSTER_WIDTH} />
                { starRating > 0 && (
                <>
                    <LinearGradient
                        colors={["transparent", ReelayColors.reelayBlack]}
                        style={{
                            opacity: 0.85,
                            width: POSTER_WIDTH,
                            height: POSTER_HEIGHT/2,
                            borderRadius: 6,
                            position: 'absolute',
                            top: POSTER_HEIGHT/2,
                        }}
                    />
                    <StarRatingLine rating={starRating} />
                </>) }
            </PosterContainer>
        );
    }

    return (
        <Fragment>
            <SectionHeader />
            <PosterGridContainer>
                { creatorStacks.map(renderStack) }
                <AfterImage />
                <AfterImage />
                <AfterImage />
            </PosterGridContainer>
        </Fragment>
    );
}
