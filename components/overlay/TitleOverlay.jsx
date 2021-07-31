import React, { useContext, useState } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { Text } from 'react-native-elements';

import Poster from '../view-reelay/Poster';
import { fetchMovieTrailer, getDirector } from '../../api/TMDbApi';
import { VisibilityContext} from '../../context/VisibilityContext';
import styled from 'styled-components/native';
import YoutubeVideoEmbed from '../utils/YouTubeVideoEmbed';

export default TitleOverlay = ({ navigation }) => {

    const { height, width } = Dimensions.get('window');
    const TRAILER_HEIGHT = height * 0.3;

    const HeaderRowContainer = styled(View)`
        width: 70%;
        padding: 20px;
    `
    const TitleOverlayContainer = styled(View)`
        position: absolute;
        width: 100%;
        height: 100%;
    `
    const TitleOverlayHeader = styled(View)`
        flex-direction: row;
        width: 100%;
        height: 30%;
    `
    const TitleOverlayTrailerContainer = styled(View)`
        width: 100%;
        height: ${TRAILER_HEIGHT}px;
    `
    const PosterContainer = styled(View)`
        position: absolute;
        left: ${width * 0.7}px;
        margin-top: 15px;
        width: 30%;
        align-items: flex-end;
    ` 
    const TitleText = styled(Text)`
        font-size: 24px;
        font-family: System;
        color: white;
    `
    const TaglineText = styled(Text)`
        font-size: 15px;
        font-family: System;
        font-weight: 300;
        color: white;
        margin-bottom: 10px;
    `
    const DirectorText = styled(Text)`
        font-size: 15px;
        font-family: System;
        font-weight: 300;
        color: white;
    `

    const visibilityContext = useContext(VisibilityContext);
    const titleObject = visibilityContext.overlayData?.titleObject;
    const director = getDirector(titleObject);
    const directorName = (director && director.name) ? 'Dir. ' + director.name : '';

    return (
        <TitleOverlayContainer>
            <TitleOverlayHeader>
                <HeaderRowContainer>
                    <TitleText>{titleObject.title}{titleObject.year}</TitleText>
                    <TaglineText>{titleObject.tagline}</TaglineText>
                    <DirectorText>{directorName}</DirectorText>

                </HeaderRowContainer>
                <PosterContainer>
                    <Poster titleObject={titleObject} showTitle={false} />
                </PosterContainer>
            </TitleOverlayHeader>
            {titleObject.trailerURI && 
                <TitleOverlayTrailerContainer>
                    <YoutubeVideoEmbed youtubeVideoID={titleObject.trailerURI} height={TRAILER_HEIGHT} />
                </TitleOverlayTrailerContainer>
            }
        </TitleOverlayContainer>
    )
};