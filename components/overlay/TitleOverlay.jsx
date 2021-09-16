import React, { useContext } from 'react';
import { Dimensions, SafeAreaView, ScrollView, View, Text } from 'react-native';
import { Button } from 'react-native-elements';

import Poster from '../home/Poster';
import { VenueIcon } from '../utils/VenueIcon';
import { VisibilityContext} from '../../context/VisibilityContext';
import YoutubeVideoEmbed from '../utils/YouTubeVideoEmbed';
import styled from 'styled-components/native';

const VenueLabel = ({ venue }) => {
    const VenueContainer = styled(View)`
        align-items: center;
        flex-direction: row;
        justify-content: center;
        margin-top: 5px;
        margin-bottom: 5px;
        right: 10px;
        width: 120px;
    `
    const VenueText = styled(Text)`
        font-size: 14px;
        font-family: System;
        font-weight: 600;
        color: white;
    `
    let textToDisplay = 'Seen on ';
    if (venue === 'theaters') textToDisplay = 'Seen in theaters ';
    if (venue === 'festivals') textToDisplay = 'Seen at a festival ';
    if (venue === 'other') textToDisplay = 'Seen at another venue ';

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

    const TitleOverlayContainer = styled(SafeAreaView)`
        width: 100%;
        height: 100%;
        justify-content: flex-start;
        align-items: center;
        z-index: 3;
    `
    const TitleOverlayTrailerContainer = styled(View)`
        width: 100%;
        height: ${TRAILER_HEIGHT}px;
        margin-left: 10px;
        margin-top: 20px;
    `
    const visibilityContext = useContext(VisibilityContext);
    const reelay = visibilityContext.overlayData?.reelay;

    const actors = reelay.overlayInfo?.displayActors;
    const director = reelay.overlayInfo?.director;
    const directorName = (director && director.name) ? 'Dir. ' + director.name : '';
    const releaseYear = ' (' + reelay.releaseYear + ')';
    const title = reelay.title;
    const venueMarked = (reelay.venue && reelay.venue.length);

    const Overview = () => {
        const OverviewContainer = styled(View)`
            width: 100%;
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
            padding: 10px;
            margin-bottom: 20px;
            width: 100%;
        `
        return (
            <OverviewContainer>
                <OverviewTextContainer>
                    <OverviewText>{reelay.overlayInfo?.overview}</OverviewText>
                </OverviewTextContainer>
            </OverviewContainer>    
        );
    }

    const Header = () => {
        const ActorText = styled(Text)`
            font-size: 16px;
            font-family: System;
            font-weight: 300;
            color: white;
            margin-top: 10px;
        `
        const DirectorText = styled(Text)`
            font-size: 16px;
            font-family: System;
            font-weight: 300;
            color: white;
            margin-top: 10px;
        `
        const HeaderRowContainer = styled(View)`
            padding: 20px;
            width: 65%;
        `
        const PosterContainer = styled(View)`
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
        const TitleOverlayHeader = styled(View)`
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
        `
        const TitleText = styled(Text)`
            font-size: 24px;
            font-family: System;
            color: white;
        `
        return (
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
        );
    }

    const ReturnButton = () => {
        const ReturnButtonContainer = styled(View)`
            align-items: center;
            height: 40px;
            margin: 10px;
            margin-bottom: 80px;
            width: 100%;
        `
        return (
            <ReturnButtonContainer>
                <Button onPress={() => visibilityContext.setOverlayVisible(false)}
                    buttonStyle={{ borderColor: 'white', width: '100%' }}
                    titleStyle={{ color: 'white' }}
                    title='Return' type='outline' />
            </ReturnButtonContainer>
        );
    }

    return (
        <TitleOverlayContainer>
            <Header />
            {reelay.overlayInfo?.trailerURI && 
                <TitleOverlayTrailerContainer>
                    <YoutubeVideoEmbed youtubeVideoID={reelay.overlayInfo.trailerURI} height={TRAILER_HEIGHT} />
                </TitleOverlayTrailerContainer>
            }
            <Overview />
            <ReturnButton />
        </TitleOverlayContainer>
    )
};