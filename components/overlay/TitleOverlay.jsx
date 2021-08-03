import React, { useContext } from 'react';
import { Dimensions, SafeAreaView, View } from 'react-native';
import { Text } from 'react-native-elements';

import Poster from '../view-reelay/Poster';
import { getDirector, getDisplayActors } from '../../api/TMDbApi';
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
    const TitleOverlayContainer = styled(SafeAreaView)`
        position: absolute;
        width: 100%;
        height: 100%;
        justify-content: flex-start;
    `
    const TitleOverlayHeader = styled(View)`
        flex: 1;
        flex-direction: row;
        width: 100%;
    `
    const TitleOverlayTrailerContainer = styled(View)`
        flex: 1;
        width: 100%;
        height: ${TRAILER_HEIGHT}px;
    `
    const TitleOverlayBottomContainer = styled(View)`
        flex: 1;
        width: 100%;
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
        margin-top: 10px;
    `
    const DirectorText = styled(Text)`
        font-size: 15px;
        font-family: System;
        font-weight: 300;
        color: white;
        margin-top: 10px;
    `
    const ActorText = styled(Text)`
        font-size: 15px;
        font-family: System;
        font-weight: 300;
        color: white;
        margin-top: 10px;
    `
    const OverviewTextContainer = styled(Text)`
        height: 100%;
        width: 100%;
        margin: 10px;
    `
    const OverviewText = styled(Text)`
        font-size: 14px;
        font-family: System;
        font-weight: 400;
        color: white;
        margin-bottom: 10px;
        margin-top: 10px;
    `

    const visibilityContext = useContext(VisibilityContext);
    const titleObject = visibilityContext.overlayData?.titleObject;
    const director = getDirector(titleObject);
    const directorName = (director && director.name) ? 'Dir. ' + director.name : '';
    const actors = getDisplayActors(titleObject);

    console.log(titleObject.title);

    return (
        <TitleOverlayContainer>
            <TitleOverlayHeader>
                <HeaderRowContainer>
                    <TitleText>{titleObject.title}{titleObject.year}</TitleText>
                    <TaglineText>{titleObject.tagline}</TaglineText>
                    <DirectorText>{directorName}</DirectorText>
                    { actors.map((actor, index) => {
                        return <ActorText key={index}>{actor.name}</ActorText>
                    })}
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
            <TitleOverlayBottomContainer>
                <OverviewTextContainer>
                    <OverviewText>{titleObject.overview}</OverviewText>
                </OverviewTextContainer>
            </TitleOverlayBottomContainer>
        </TitleOverlayContainer>
    )
};