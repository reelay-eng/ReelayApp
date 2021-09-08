import React, { useContext } from 'react';
import { Dimensions, SafeAreaView, View, Text } from 'react-native';

import Poster from '../home/Poster';
import { VisibilityContext} from '../../context/VisibilityContext';

import VenueIcon from '../utils/VenueIcon';
import YoutubeVideoEmbed from '../utils/YouTubeVideoEmbed';
import styled from 'styled-components/native';

const VenueLabel = ({ venue }) => {
    const VenueContainer = styled(View)`
        align-items: center;
        flex-direction: row;
        justify-content: center;
        margin-top: 10px;
        width: 120px;
    `
    const VenueText = styled(Text)`
        font-size: 14px;
        font-family: System;
        font-weight: 600;
        color: white;
    `
    const textToDisplay = 'Seen on ';
    return (
        <VenueContainer>
            <VenueText>{textToDisplay}</VenueText>
            <VenueIcon venue={venue} size={24} />
        </VenueContainer>
    );
}


export default TitleOverlay = ({ navigation }) => {

    const { height, width } = Dimensions.get('window');
    const TRAILER_HEIGHT = height * 0.3;

    const ActorText = styled(Text)`
        font-size: 15px;
        font-family: System;
        font-weight: 300;
        color: white;
        margin-top: 10px;
    `
    const DirectorText = styled(Text)`
        font-size: 15px;
        font-family: System;
        font-weight: 300;
        color: white;
        margin-top: 10px;
    `
    const HeaderRowContainer = styled(View)`
        width: 65%;
        padding: 20px;
    `
    const OverviewText = styled(Text)`
        font-size: 14px;
        font-family: System;
        font-weight: 400;
        color: white;
        margin-bottom: 10px;
        margin-top: 10px;
    `
    const OverviewTextContainer = styled(Text)`
        height: 100%;
        width: 100%;
        margin: 10px;
    `
    const PosterContainer = styled(View)`
        position: absolute;
        top: 10px;
        right: 10px;
        width: 30%;
        align-items: flex-end;
    ` 
    const TaglineText = styled(Text)`
        font-size: 15px;
        font-family: System;
        font-weight: 300;
        color: white;
        margin-bottom: 10px;
        margin-top: 10px;
    `
    const TitleOverlayContainer = styled(SafeAreaView)`
        position: absolute;
        width: 100%;
        height: 100%;
        justify-content: flex-start;
        align-items: center;
    `
    const TitleOverlayHeader = styled(View)`
        flex: 1;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
    `
    const TitleOverlayTrailerContainer = styled(View)`
        width: 100%;
        height: ${TRAILER_HEIGHT}px;
        margin-left: 10px;
    `
    const TitleOverlayBottomContainer = styled(View)`
        flex: 1;
        width: 100%;
    `
    const TitleText = styled(Text)`
        font-size: 24px;
        font-family: System;
        color: white;
    `

    const visibilityContext = useContext(VisibilityContext);
    const reelay = visibilityContext.overlayData?.reelay;

    const actors = reelay.overlayInfo?.displayActors;
    const director = reelay.overlayInfo?.director;
    const directorName = (director && director.name) ? 'Dir. ' + director.name : '';
    const releaseYear = ' (' + reelay.releaseYear + ')';
    const title = reelay.title;
    const venueMarked = (reelay.venue && reelay.venue.length);

    console.log('venue marked: ', venueMarked, reelay.venue);

    return (
        <TitleOverlayContainer>
            <TitleOverlayHeader>
                <HeaderRowContainer>
                    <TitleText>{title}{releaseYear}</TitleText>
                    <TaglineText>{reelay.overlayInfo?.tagline}</TaglineText>
                    <DirectorText>{directorName}</DirectorText>
                    { actors.map((actor, index) => {
                        return <ActorText key={index}>{actor.name}</ActorText>
                    })}
                </HeaderRowContainer>
                <PosterContainer>
                    <Poster reelay={reelay} showTitle={false} />
                    { venueMarked && <VenueLabel venue={reelay.venue} size={20} /> }
                </PosterContainer>
            </TitleOverlayHeader>
            {reelay.overlayInfo?.trailerURI && 
                <TitleOverlayTrailerContainer>
                    <YoutubeVideoEmbed youtubeVideoID={reelay.overlayInfo.trailerURI} height={TRAILER_HEIGHT} />
                </TitleOverlayTrailerContainer>
            }
            <TitleOverlayBottomContainer>
                <OverviewTextContainer>
                    <OverviewText>{reelay.overlayInfo?.overview}</OverviewText>
                </OverviewTextContainer>
            </TitleOverlayBottomContainer>
        </TitleOverlayContainer>
    )
};