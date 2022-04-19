import React from 'react';
import { Dimensions, Image, Pressable, View } from 'react-native';
import StarRating from 'react-native-star-rating';
import styled from 'styled-components/native';
import TitlePoster from '../global/TitlePoster';

const { width } = Dimensions.get('window');

const GRID_SIDE_MARGIN = 16;
const GRID_WIDTH = width - (2 * GRID_SIDE_MARGIN);

const POSTER_HALF_MARGIN = 8;
const POSTER_ROW_LENGTH = 4;
const POSTER_WIDTH = GRID_WIDTH / POSTER_ROW_LENGTH - 2 * POSTER_HALF_MARGIN;
const POSTER_HEIGHT = 1.5 * POSTER_WIDTH;

const PosterContainer = styled(View)`
    align-items: center;
    margin: ${POSTER_HALF_MARGIN}px;
`
const PosterGridContainer = styled(View)`
    align-self: center;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    width: ${GRID_WIDTH}px;
`
const PosterImage = styled(Image)`
    border-radius: ${POSTER_HALF_MARGIN}px;
    height: ${POSTER_HEIGHT}px;
    width: ${POSTER_WIDTH}px;
`
const StarRatingContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    bottom: 8px;
    position: absolute;
`
const InvisiblePosterContainer = styled(View)`
    height: ${POSTER_HEIGHT}px;
    width: ${POSTER_WIDTH}px;
    margin: ${POSTER_HALF_MARGIN}px;
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
                {/* <PosterImage source={stack[0].title.posterSource} /> */}
                <TitlePoster title={stack[0].title} onPress={viewProfileFeed} width={POSTER_WIDTH} />
                { starRating > 0 && <StarRatingLine rating={starRating} /> }
            </PosterContainer>
        );
    }

    return (
        <PosterGridContainer>
            { creatorStacks.map(renderStack) }
            <AfterImage />
            <AfterImage />
            <AfterImage />
        </PosterGridContainer>
    );
}
