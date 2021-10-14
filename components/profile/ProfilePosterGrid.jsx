import React from 'react';
import { Dimensions, Image, Pressable, View } from 'react-native';
import { getPosterURL } from '../../api/TMDbApi';
import styled from 'styled-components/native';

const { width } = Dimensions.get('window');

export default ProfilePosterGrid = ({ creatorStacks, navigation }) => {

    const PosterGridContainer = styled(View)`
        align-items: flex-start;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-start;
        margin: 16px;
        width: ${width - 32}px;
    `
    if (!creatorStacks.length) {
        return <View />;
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
        </PosterGridContainer>
    );
}
