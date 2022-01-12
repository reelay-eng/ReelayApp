import React from 'react';
import { Dimensions, Image, Pressable, View } from 'react-native';
import { getPosterURL } from '../../api/TMDbApi';
import styled from 'styled-components/native';

const { width } = Dimensions.get('window');

export default ProfilePosterGrid = ({ creatorStacks, navigation }) => {

    const GRID_SIDE_MARGIN = 16;
    const GRID_WIDTH = width - (2 * GRID_SIDE_MARGIN);

    const POSTER_HALF_MARGIN = 8;
    const POSTER_ROW_LENGTH = 4;
    const POSTER_WIDTH = GRID_WIDTH / POSTER_ROW_LENGTH - 2 * POSTER_HALF_MARGIN;
    const POSTER_HEIGHT = 1.5 * POSTER_WIDTH;

    const PosterGridContainer = styled(View)`
        align-self: center;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        width: ${GRID_WIDTH}px;
    `
    const PosterGridOuterContainer = styled(View)`
        flex-direction: row;
    `
    if (!creatorStacks.length) {
        return <View />;
    }

    const AfterImage = () => {
        // afterimages are invisible views that keep the grid aligned. 
        // it's a hacky solution for now
        const InvisiblePosterContainer = styled(View)`
            height: ${POSTER_HEIGHT}px;
            width: ${POSTER_WIDTH}px;
            margin: ${POSTER_HALF_MARGIN}px;
        `
        return (
            <InvisiblePosterContainer />
        );
    }

    const renderStack = (stack, index) => {
        const PosterContainer = styled(Pressable)`
        margin: ${POSTER_HALF_MARGIN}px;
        `
        const PosterImage = styled(Image)`
            border-radius: ${POSTER_HALF_MARGIN}px;
            height: ${POSTER_HEIGHT}px;
            width: ${POSTER_WIDTH}px;
        `
        const posterURI = stack[0].title.posterURI;
        const posterURL = getPosterURL(posterURI);

        const viewProfileFeed = () => {
            navigation.push('ProfileFeedScreen', { 
                initialFeedPos: index, 
                stackList: creatorStacks, 
            });
        }

        return (
            <PosterContainer key={posterURI} onPress={viewProfileFeed}>
                <PosterImage source={{ uri: posterURL }} />
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
