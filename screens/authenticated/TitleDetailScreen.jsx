import React, { useContext, useEffect, useState } from 'react';
import { 
    ActivityIndicator, 
    Dimensions, 
    Image,
    Pressable, 
    SafeAreaView, 
    ScrollView, 
    Text, 
    View,
} from 'react-native';
import { Button } from 'react-native-elements';

import Poster from '../../components/home/Poster';
import YoutubeVideoEmbed from '../../components/utils/YouTubeVideoEmbed';
import styled from 'styled-components/native';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { getMostRecentReelaysByTitle, getVideoURIObject } from '../../api/ReelayDBApi';

export default TitleDetailScreen = ({ navigation, route }) => {

    const { height, width } = Dimensions.get('window');
    const TRAILER_HEIGHT = height * 0.3;

    const ScrollBox = styled(ScrollView)`
        top: 44px;
        width: 100%;
    `
    const TitleOverlayContainer = styled(View)`
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
    const [topReelays, setTopReelays] = useState([]);
    const { titleObj } = route.params;

    const actors = titleObj?.displayActors;
    const director = titleObj?.director;
    const directorName = (director && director.name) ? 'Director: ' + director.name : '';

    const tmdbTitleID = titleObj.id;
    
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
        const OverviewTextContainer = styled(View)`
            padding: 10px 20px 10px 20px;
            margin-bottom: 20px;
            width: 100%;
        `
        return (
            <OverviewContainer>
                <OverviewTextContainer>
                    <OverviewText>{titleObj.overview}</OverviewText>
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
                    <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                    }}>
                        <TitleText>{`${titleObj.display} (${titleObj.releaseYear})`}</TitleText>
                    </View>
                    <TaglineText>{titleObj.tagline}</TaglineText>
                    <Divider />
                    <DirectorText>{directorName}</DirectorText>
                    <ActorText>
                        Starring: {actors.map(actor => actor.name).join(", ")} 
                    </ActorText>
                </HeaderRowContainer>
                <PosterContainer>
                    <Poster title={{...titleObj, posterURI: titleObj.posterURI }} />
                </PosterContainer>
            </TitleOverlayHeader>
        );
    }

    const ReturnButton = () => {
        const ReturnButtonContainer = styled(View)`
            align-items: center;
            height: 40px;
            margin-top: 20px;
            margin-bottom: 200px;
            width: 100%;
        `
        return (
            <ReturnButtonContainer>
                <Button onPress={() => navigation.pop()}
                    buttonStyle={{ borderColor: 'white', width: '100%', borderRadius: '5px' }}
                    titleStyle={{ color: 'white' }}
                    title='Go Back' type='outline' />
            </ReturnButtonContainer>
        );
    }

    const ReelayThumbnail = ({ reelay, index }) => {
        const ThumbnailContainer = styled(View)`
            border-color: white;
            border-width: 1px;
            border-radius: 8px;
            justify-content: center;
            margin: 4px;
            height: 122px;
            width: 82px;
        `
        const ThumbnailImage = styled(Image)`
            border-radius: 8px;
            height: 120px;
            width: 80px;
        `
        const CreatorName = styled(Text)`
            font-family: System;
            font-size: 16px;
            color: white;
        `
        
        const [loading, setLoading] = useState(true);
        const [thumbnailURI, setThumbnailURI] = useState('');

        const generateThumbnail = async () => {
            try {
                const { uri } = await VideoThumbnails.getThumbnailAsync(reelay.content.videoURI);
                setThumbnailURI(uri);
                setLoading(false);
            } catch (error) {
                console.warn(error);
            }
        };

        useEffect(() => {
            generateThumbnail();
        }, []);

        const goToReelay = async () => {
            navigation.push('TitleFeedScreen', {
                initialStackPos: index,
                fixedStackList: [topReelays],
            });
        }

        return (
            <Pressable key={reelay.id} onPress={goToReelay}>
                <ThumbnailContainer>
                    { loading && <ActivityIndicator /> }
                    { !loading && 
                        <ThumbnailImage source={{ uri: thumbnailURI }} />
                    }
                </ThumbnailContainer>
            </Pressable>
        );
    }

    const TopReelays = () => {
        const TopReelaysContainer = styled(View)`
            width: 100%;
        `
        const ThumbnailScrollContainer = styled(View)`
            align-items: center;
            flex-direction: row;
            justify-content: center;
            height: 140px;
            width: 100%;
        `
        const TopReelaysHeader = styled(Text)`
            margin: 10px;
            font-family: System;
            font-size: 20px;
            font-weight: 600;
            color: white;
        `
        return (
            <TopReelaysContainer>
                <TopReelaysHeader>{`Popular Reelays (${topReelays.length})`}</TopReelaysHeader>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    <ThumbnailScrollContainer>
                        { topReelays.length && topReelays.map((reelay, index) => {
                            return <ReelayThumbnail key={reelay.id} reelay={reelay} index={index} />;
                        })}
                    </ThumbnailScrollContainer>
                </ScrollView>
            </TopReelaysContainer>
        );
    }

    const fetchTopReelays = async () => {
        const nextTopReelays = await getMostRecentReelaysByTitle(tmdbTitleID);
        if (nextTopReelays?.length) {
            setTopReelays(nextTopReelays);
        }
    }

    useEffect(() => {
        fetchTopReelays();
    }, []);

    return (
        <ScrollBox showsVerticalScrollIndicator={false}>
            <TitleOverlayContainer>
                <Header />
                { (topReelays.length > 0) && 
                    <TopReelays />
                }
                { titleObj.trailerURI && 
                    <TitleOverlayTrailerContainer>
                        <YoutubeVideoEmbed youtubeVideoID={titleObj.trailerURI} height={TRAILER_HEIGHT} />
                    </TitleOverlayTrailerContainer>
                }
                <Overview /> 
                <ReturnButton />
            </TitleOverlayContainer>
        </ScrollBox>
    )
};