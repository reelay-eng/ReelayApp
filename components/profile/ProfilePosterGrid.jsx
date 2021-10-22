import React from 'react';
import { Dimensions, Image, Pressable, View } from 'react-native';
import { getPosterURL } from '../../api/TMDbApi';
import styled from 'styled-components/native';

const { width } = Dimensions.get('window');

export default ProfilePosterGrid = ({ creatorStacks, navigation }) => {

    const PosterGridContainer = styled(View)`
        align-self: center;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        width: ${width - 32}px;
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
            height: 108px;
            width: 72px;
            margin: 8px;
        `
        return (
            <InvisiblePosterContainer />
        );
    }

    const renderStack = (stack, index) => {
        const PosterContainer = styled(Pressable)`
            margin: 8px;
        `
        const PosterImage = styled(Image)`
            border-color: white;
            border-radius: 8px;
            border-width: 1px;
            height: 108px;
            width: 72px;
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
