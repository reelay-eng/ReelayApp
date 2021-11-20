import React, { useContext } from 'react';
import { Dimensions, SafeAreaView, ScrollView, View, Text } from 'react-native';
import { Button } from 'react-native-elements';

import Poster from '../home/Poster';
import { VenueIcon } from '../utils/VenueIcon';
import { FeedContext} from '../../context/FeedContext';
import YoutubeVideoEmbed from '../utils/YouTubeVideoEmbed';
import styled from 'styled-components/native';

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
    const { overlayData, setOverlayVisible, setTabBarVisible } = useContext(FeedContext);
    const title = overlayData?.title;

    const actors = title?.displayActors;
    const director = title?.director;
    const directorName = (director && director.name) ? 'Director: ' + director.name : '';
    const releaseYear = ' (' + title?.releaseYear + ')';

    const Overview = () => {
        const OverviewContainer = styled(View)`
            width: 100%;
        `
        const OverviewText = styled(Text)`
            font-size: 16px;
            font-family: System;
            font-weight: 400;
            color: #eeeeee;
            margin-bottom: 10px;
            margin-top: 10px;
        `
        const OverviewTextContainer = styled(Text)`
            padding: 10px 20px 10px 20px;
            margin-bottom: 20px;
            width: 100%;
        `
        return (
            <OverviewContainer>
                <OverviewTextContainer>
                    <OverviewText>{title.overview}</OverviewText>
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
            font-size: 18px;
            font-family: System;
            font-weight: 300;
            color: white;
            margin-bottom: 10px;
            margin-top: 10px;
        `
        const Divider = styled(View)`
            border-bottom-color: #2e2e2e;
            border-bottom-width: 1px;
            width: 100%;
            margin-top: 2px;
            margin-bottom: 2px;
        `
        const TitleOverlayHeader = styled(View)`
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
        `
        const TitleText = styled(Text)`
            font-size: 26px;
            font-family: System;
            color: white;
        `
        return (
            <TitleOverlayHeader>
                <HeaderRowContainer>
                    <TitleText>{title.display}{releaseYear}</TitleText>
                    <TaglineText>{title.tagline}</TaglineText>
                    <Divider />
                    <DirectorText>{directorName}</DirectorText>
                    <ActorText>
                        Starring: {actors.map(actor => actor.name).join(", ")} 
                    </ActorText>
                </HeaderRowContainer>
                <PosterContainer>
                    <Poster title={title} />
                </PosterContainer>
            </TitleOverlayHeader>
        );
    }

    const ReturnButton = () => {
        const ReturnButtonContainer = styled(View)`
            align-items: center;
            height: 40px;
            margin: 10px;
            margin-top: 20px;
            margin-bottom: 80px;
            width: 100%;
        `
        return (
            <ReturnButtonContainer>
                <Button onPress={
                    () => {
                        setOverlayVisible(false);
                        setTabBarVisible(true);
                    }
                }
                    buttonStyle={{ borderColor: 'white', width: '100%', borderRadius: '5px' }}
                    titleStyle={{ color: 'white' }}
                    title='Go Back' type='outline' />
            </ReturnButtonContainer>
        );
    }

    return (
        <TitleOverlayContainer>
            <Header />
            { title.trailerURI && 
                <TitleOverlayTrailerContainer>
                    <YoutubeVideoEmbed youtubeVideoID={title.trailerURI} height={TRAILER_HEIGHT} />
                </TitleOverlayTrailerContainer>
            }
            <Overview />
            <ReturnButton />
        </TitleOverlayContainer>
    )
};