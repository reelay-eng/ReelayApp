import React, { useContext, useEffect, useState, useRef } from 'react';
import { 
    ActivityIndicator, 
    Dimensions, 
    Image,
    Pressable, 
    SafeAreaView, 
    ScrollView, 
    Text, 
    View,
    StyleSheet
} from 'react-native';
import { Button } from 'react-native-elements';
import {FeedContext} from '../../context/FeedContext';
import { getPosterURL, getLogoURL, fetchMovieProviders } from '../../api/TMDbApi';
import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { getMostRecentReelaysByTitle } from '../../api/ReelayDBApi';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from 'react-native-elements';

import { ActionButton, PassiveButton, RedPlusButton } from '../../components/global/Buttons';
import { DirectorBadge, ActorBadge } from '../../components/global/Badges';

const Spacer = styled(View)`
    height: ${props => props.height}px;
`

export default TitleDetailScreen = ({ navigation, route }) => {

    // Screen-wide dimension handling
    const { height, width } = Dimensions.get('window');
    const TRAILER_HEIGHT = height * 0.3;

    // Tab bar visibility
    const { setTabBarVisible } = useContext(FeedContext);
    useEffect(() => {
        setTabBarVisible(false);
        return () => { setTabBarVisible(true) }
    }, []);

    // Parse Title Object
    const { titleObj } = route.params;
    const actors = titleObj?.displayActors;
    const director = titleObj?.director?.name;
    const overview = titleObj?.overview;
    const tmdbTitleID = titleObj?.id;
    const trailerURI = titleObj?.trailerURI
    const genres = titleObj?.genres;

    const ScrollBox = styled(ScrollView)`
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: #0d0d0d
    `

    return (
        <ScrollBox showsVerticalScrollIndicator={false}>
            <PosterWithTrailer 
                navigation={navigation}
                height={height*0.7} 
                posterURI={titleObj?.posterURI} 
                title={titleObj?.display}
                tmdbTitleID={tmdbTitleID}
                trailerURI={trailerURI}
                TRAILER_HEIGHT={TRAILER_HEIGHT}
                genres={genres}/>
            <PopularReelaysRow navigation={navigation} titleID={tmdbTitleID} />
            <MovieInformation 
                director={director}
                actors={actors} 
                description={overview}/>
            <Spacer height={20} />
            <ReturnButton navigation={navigation} />
        </ScrollBox>
    )
};

const PosterWithTrailer = ({navigation, height, posterURI, title, tmdbTitleID, trailerURI, TRAILER_HEIGHT, genres}) => {
    const PosterContainer = styled(View)`
        height: ${height}px;
        width: 100%;
    `;

    const posterURL = getPosterURL(posterURI);
    const PosterWithOverlay = ({posterURL}) => {
        const PosterImage = styled(Image)`
            height: 100%;
            width: 100%;
            position: absolute;
        `
        const PosterOverlay = styled(View)`
            height: 100%;
            width: 100%;
            background-color: ${props => props.color};
            opacity: ${props => props.opacity};
            position: absolute;
        `
        const s = StyleSheet.create({
            gradient: {
                flex: 1,
                opacity: 0.6,
            },
            toblack: {
                flex: 1,
                opacity: 0.7
            }
        })
        return (
            <>
                <PosterImage source={{uri: posterURL}} />
                <PosterOverlay color={ReelayColors.reelayBlack} opacity={0.6}/>
                <LinearGradient colors={["#0d0026", "#82036d"]} start={[0, 1]} end={[1, 0]} style={s.gradient}/>
            </>
        )
    }

    const PosterTagline = () => {
        const [topProviderLogo, setTopProviderLogo] = useState('');
        const componentMounted = useRef(true);
        useEffect(() => {
            (async () => {
                var p = await fetchMovieProviders(tmdbTitleID);
                if (!p || !p.US) return;
                p = p.US; // change this for when we want multi country support
                if (p.rent?.length > 0 && componentMounted.current) setTopProviderLogo(p.rent[0].logo_path);
            })();
            return () => {
                componentMounted.current = false;
            };
        }, [])

        const TaglineContainer = styled(View)`
            width: 90%;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            margin-bottom: 30px;
        `
        // in case we want to have multiple provider images

        const ProviderImagesContainer = styled(View)` 
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
        `
        const ProviderImage = styled(Image)`
            width: 30px;
            height: 30px;
            border-width: 1px;
            border-color: #ffffff;
            border-radius: 15px;
            margin-left: 3px;
        `
        const TaglineTextContainer = styled(View)`
            margin-left: 7px;
            display: flex;
            align-items: center;
            justify-content: center;
        `
        const TaglineText = styled(Text)`
            color: #FFFFFF;
            opacity: 0.6;
            font-size: 24px;
        `


        return (
            <TaglineContainer>
                <ProviderImagesContainer>
                { topProviderLogo.length > 0 && <ProviderImage source={{uri: getLogoURL(topProviderLogo)}}/> }
                </ProviderImagesContainer>
                <TaglineTextContainer>
                    <TaglineText>{genres.map(e => e.name).join(', ')}</TaglineText>
                </TaglineTextContainer>
            </TaglineContainer>
        )
    }

    const PosterInfoContainer = styled(View)`
        position: absolute;
        left: 8%;
        bottom: 5%;
        width: 84%;
        display: flex;
        flex-direction: column;
    `

    const PosterTitleContainer = styled(View)`
        width: 90%;
    `
    const PosterTitle = styled(Text)`
        position: relative;
        font-size: 55px;
        font-weight: bold;
        color: white;
        margin-bottom: 10px;
    `

    const ButtonContainer = styled(View)`
        width: 100%;
        height: 60px;
    `

    const BackButtonContainer = styled(Pressable)`
        position: absolute;
        margin-top: 60px;
        margin-left: 30px;
    `

    return (
        <PosterContainer>
            <PosterWithOverlay posterURL={posterURL} />
            <BackButtonContainer onPress={() => navigation.goBack()}>
                <Icon type='ionicon' name={'chevron-back-outline'} color={'white'} size={30} />
            </BackButtonContainer>
            <PosterInfoContainer>
                <PosterTitleContainer>
                    <PosterTitle>{title}</PosterTitle>
                </PosterTitleContainer>
                <PosterTagline />
                { trailerURI && 
                    <ButtonContainer>
                        <ActionButton text={'Watch Trailer'} onPress={() => {navigation.push('TitleTrailerScreen', {TRAILER_HEIGHT: TRAILER_HEIGHT, trailerURI: trailerURI})}} fontSize={'24px'} />
                    </ButtonContainer>
                }
            </PosterInfoContainer>
        </PosterContainer>
    )
}



























const ReturnButton = ({navigation}) => {
    const ReturnButtonContainer = styled(View)`
        display: flex;
        align-self: center;
        height: 60px;
        margin-top: 20px;
        margin-bottom: 100px;
        width: 84%;
    `
    return (
        <ReturnButtonContainer>
            <ActionButton 
                onPress={() => navigation.pop()} 
                text="Back to Reelay" 
                fontSize='24px'
                color='red'
            />
        </ReturnButtonContainer>
    );
}


const PopularReelaysRow = ({navigation, titleID}) => {
    const [topReelays, setTopReelays] = useState([]);
    const componentMounted = useRef(true);

    const fetchTopReelays = async () => {
        const nextTopReelays = await getMostRecentReelaysByTitle(titleID);
        if (nextTopReelays?.length && componentMounted.current) {
            setTopReelays(nextTopReelays);
        }
    }

    useEffect(() => {
        fetchTopReelays();
        return () => componentMounted.current = false;
    }, []);

    const goToReelay = (index) => {
        if (topReelays.length === 0) return;
        navigation.push('TitleFeedScreen', {
            initialStackPos: index,
            fixedStackList: [topReelays],
        });
    }

    const ReelayThumbnail = ({ reelay, index }) => {
        const ThumbnailContainer = styled(View)`
            border-color: #7c7c7c;
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

        return (
            <Pressable key={reelay.id} onPress={() => {goToReelay(index)}}>
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
            margin-top: 20px;
            width: 95%;
            left: 5%;
        `
        const ThumbnailScrollContainer = styled(View)`
            align-items: center;
            flex-direction: row;
            justify-content: flex-start;
            height: 140px;
            width: 100%;
        `
        const TopReelaysHeader = styled(Text)`
            margin: 10px;
            font-family: System;
            font-size: 28px;
            font-weight: 600;
            color: white;
        `
        const PlusReelayThumbnail = () => {
            const Container = styled(View)`
                margin: 4px;
                height: 122px;
                width: 82px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            `
            const PlusIconContainer = styled(View)`
                width: 65px;
                height: 65px;
            `

            return (
                <Container>
                    <PlusIconContainer>
                        <RedPlusButton onPress={() => console.log('Push a screen that takes user to CREATE A REELAY for that movie')} />
                    </PlusIconContainer>
                </Container>
            )
        }


        return (
            <TopReelaysContainer>
                <TopReelaysHeader>{`Top Reviews`}</TopReelaysHeader>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    <ThumbnailScrollContainer>
                        <PlusReelayThumbnail />
                        { topReelays.length > 0 && topReelays.map((reelay, index) => {
                            return <ReelayThumbnail key={reelay.id} reelay={reelay} index={index} />;
                        })}
                    </ThumbnailScrollContainer>
                </ScrollView>
            </TopReelaysContainer>
        );
    }

    const Container = styled(View)`
        width: 100%;
    `
    const ButtonContainer = styled(View)`
        margin-top: 10px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    `
    const ButtonSizer = styled(View)`
        width: 84%;
        height: 60px;
    `
    return (
        <Container>
            <TopReelays />
            <ButtonContainer>
                <ButtonSizer>
                    <PassiveButton text={"See all"} fontSize={'28px'} onPress={() => {goToReelay(0)}} />
                </ButtonSizer>
            </ButtonContainer>
        </Container>
    )
};

const MovieInformation = ({description, director, actors}) => {

    const MIExternalContainer = styled(View)`
        margin-right: 4%;
        margin-left: 4%;
        border-radius: 20px;
        background-color: #2C2C2C;
    `

    const MIInternalContainer = styled(View)`
        display: flex;
        flex-direction: column;
        margin: 20px;
    `

    const HeadingText = styled(Text)`
        font-family: System;
        font-size: 28px;
        font-weight: 600;
        color: white;
    `

    const DescriptionCollapsible = ({description}) => {
        const [descriptionIsCut, setDescriptionIsCut] = useState(true);
        const [moreShouldBeVisible, setMoreShouldBeVisible] = useState(true);
        useEffect(() => {
            if (description.length < 133) setMoreShouldBeVisible(false);
        }, [])

        const DescriptionText = styled(Text)`
            font-family: System;
            font-size: 24px;
            color: white;
            opacity: 0.7;
            line-height: 31px;
            letter-spacing: 0.38px;
        `
        const MoreButton = styled(Pressable)`
            margin-top: -3px;
        `
        const MoreText = styled(Text)`
            font-family: System;
            font-size: 24px;
            color: #ECBBDA;
            opacity: 0.9;
            line-height: 31px;
        `

        return (
            <Text>
                <DescriptionText>
                    {descriptionIsCut?(description.length >= 133 ? description.substring(0, 133) + '...  ' : description + '  '):description + '  '}
                </DescriptionText>
                {
                    moreShouldBeVisible && 
                    <MoreButton onPress={() => setDescriptionIsCut(!descriptionIsCut)}>
                        <MoreText>{descriptionIsCut?'More':'Less'}</MoreText>
                    </MoreButton>
                }
            </Text>
        )
    }

    const BadgeWrapper = styled(View)`
        align-self: flex-start;
        margin-top: 10px;
    `

    const ActorBadgesContainer = styled(View)`
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    `


    return (
        <MIExternalContainer>
            <MIInternalContainer>

                <HeadingText>Description</HeadingText>
                <Spacer height={15} />
                <DescriptionCollapsible description={description} />
                <Spacer height={40} />
                {
                    director && 
                    <>
                        <HeadingText>Director</HeadingText>
                        <BadgeWrapper>
                            <DirectorBadge text={director}/>
                        </BadgeWrapper>
                    </>
                }
                <Spacer height={40} />

                {
                    actors?.length > 0 && 
                    <>
                    <HeadingText>Cast</HeadingText>
                    <ActorBadgesContainer>
                        {actors.map(e => (
                            <BadgeWrapper key={e.name}>
                                <ActorBadge text={e.name} />
                            </BadgeWrapper>
                        ))}
                    </ActorBadgesContainer>
                    <Spacer height={20} />
                    </>
                }
            </MIInternalContainer>
        </MIExternalContainer>
    )

}