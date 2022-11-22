import React, { useState, useRef, useLayoutEffect } from "react"
import {
	Image,
    ImageBackground,
	View,
    Dimensions,
    ScrollView, 
    TouchableOpacity,
} from "react-native";

import { AnimatedText } from "../../components/global/Text";
import * as ReelayText from "../../components/global/Text";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from "react-redux";

import styled from "styled-components"
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video } from 'expo-av'

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import P1 from "../../assets/images/Onboarding/Posters/P1.png"
import P2 from "../../assets/images/Onboarding/Posters/P2.png"
import P3 from "../../assets/images/Onboarding/Posters/P3.png"
import P4 from "../../assets/images/Onboarding/Posters/P4.png"
import P5 from "../../assets/images/Onboarding/Posters/P5.png"

const AutoPlayReelays = [
    "https://di92fpd9s7eko.cloudfront.net/public/reelayvid-09cad7f0-3838-465a-b33e-78a6662e8797-1663606398746.mp4", 
    "https://di92fpd9s7eko.cloudfront.net/public/reelayvid-c4bc0193-346b-4731-a9bb-508c6ca86324-1652107830662.mp4",
    "https://di92fpd9s7eko.cloudfront.net/public/reelayvid-a5addf82-69d6-4451-a6fe-f0ae4583294b-1655095439429.mp4",
    "https://di92fpd9s7eko.cloudfront.net/public/reelayvid-3d302546-d078-455e-a0aa-559a976aac6b-1657398858236.mp4",
    "https://di92fpd9s7eko.cloudfront.net/public/reelayvid-7e30c085-1539-43ae-aa99-536aaa439990-1643612341197.mp4"
].map(url => { return { uri: url } });

import { LinearGradient } from "expo-linear-gradient";
import { animate, animateCustom } from "../../hooks/animations";
import { faBookmark } from "@fortawesome/free-regular-svg-icons";
import ReelayColors from "../../constants/ReelayColors";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const IPHONE_13_PRO_DEVICE_HEIGHT = 844;

const ScaleSize = (value) => {
    return value * (windowHeight / IPHONE_13_PRO_DEVICE_HEIGHT);
}

const REELAY_WIDTH = ScaleSize(176);
const REELAY_HEIGHT = ScaleSize(263);

const Container = styled(View)`
	width: 100%;
	height: 100%;
`;

const TutorialScreen = ({ navigation }) => {
    return (
        <Container>
            <Tutorial navigation={navigation} />
        </Container>
    )
}

const VerticalScrollContainer = styled(ScrollView)`
    width: 100%;
    height: 100%;
    flex-direction: column;
`

const PostersContainer = styled(View)`
    padding-left: 16px;
    padding-top: 70px;
`

const HorizontalReelaysContainer = styled(ScrollView)`
    display: flex;
    flex-direction: row;
`

const PosterImage = styled(Image)`
    width: ${REELAY_WIDTH}px;
    height: ${REELAY_HEIGHT}px;
    margin-bottom: 9px;
    border-radius: 16px;
`

const PosterFake = styled(View)`
    width: ${REELAY_WIDTH}px;
    height: ${REELAY_HEIGHT}px;
    margin-bottom: 9px;
    border-radius: ${ScaleSize(16)}px;
`

const MutedVideoPlayer = ({ source }) => {
    return (
        <Video
            style={{
                width: REELAY_WIDTH,
                height: REELAY_HEIGHT,
                marginBottom: 9,
                borderRadius: 16,
                marginLeft: 5,
            }}
            posterSource={P4}
            isLooping
            isMuted={true}
            rate={1.0}
            resizeMode='cover'
            shouldPlay={true}
            source={source}
            useNativeControls={false}
            volume={1.0}
        />
    );
}

const HorizontalReelayList = ({ scrollRef, sources, scrollEnabled, onScrollRight }) => {
    const onScroll = (e) => {
        let paddingToRight = 100;
        paddingToRight += e.nativeEvent.layoutMeasurement.width;
        if(e.nativeEvent.contentOffset.x >= e.nativeEvent.contentSize.width - paddingToRight) {
          if (scrollEnabled) onScrollRight();
        }
    }

    return (
        <HorizontalReelaysContainer ref={scrollRef} horizontal={true} scrollEnabled={scrollEnabled} onScroll={onScroll} scrollEventThrottle={1}>
            {sources.map((source, index) => 
                (index === 0) 
                ? <PosterImage key={index} source={source} /> 
                    : (index > AutoPlayReelays.length) 
                ? <PosterFake key={index} />
                    : <MutedVideoPlayer key={index} source={source} /> )}
        </HorizontalReelaysContainer>
    )
}

const TopOpacityGradient = styled(LinearGradient)`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: ${windowHeight / 2}px;
    pointer-events: none;
`

const BottomOpacityGradient = styled(LinearGradient)`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: ${windowHeight / 3}px;
`

const ContentContainer = styled(Container)`
    width: 100%;
    position: absolute;
`   

const HeaderAligner = styled(View)`
    width: 100%;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
`

const TutorialHeaderTextStyle = {
    width: '80%',
    fontFamily: 'Outfit-SemiBold',
    color: 'white',
    fontSize: ScaleSize(38),
    lineHeight: ScaleSize(44),
    fontWeight: '600',
    textAlign: 'center'
}

const TutorialHeader = ({ children }) => {
    return (
        <HeaderAligner>
            <AnimatedText style={TutorialHeaderTextStyle}>
                {children}
            </AnimatedText>
        </HeaderAligner>
    )
}

const FooterAligner = styled(View)`
    width: 100%;
    height: 100%;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const FooterContent = styled(View)`
    margin-top: 40px;
    width: 80%;
    height: 80px;
    display: flex;
    align-items: center;
`

const TutorialFooterTextStyle = {
    color: 'white',
    fontFamily: 'Outfit-Regular',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
}

const TutorialFooter = ({ children, arrow=null }) => {
    const showIcon = (arrow !== null)
    const isRight = arrow === 'right'

    return (
        <FooterAligner>
            <FooterContent style={{flexDirection: isRight ? 'row' : 'column', justifyContent: isRight ? 'center' : 'space-evenly'}}>
                <AnimatedText style={[ TutorialFooterTextStyle, { marginRight: isRight ? 10 : 0 } ]}>
                    {children}
                </AnimatedText>
                { showIcon && <FontAwesomeIcon icon={isRight ? faChevronRight : faChevronDown} size={16} color='white' /> }
            </FooterContent>
        </FooterAligner>
    )
}

const AddToWatchlistContainer = styled(View)`
    position: absolute;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
`
const AddToWatchlistButtonPressable = styled(View)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 22px;
    height: 44px;
    justify-content: center;
    width: 44px;
`
const WatchlistPosterBackground = styled(ImageBackground)`
    width: ${REELAY_WIDTH * 0.6}px;
    height: ${REELAY_HEIGHT * 0.6}px;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
`

const WatchlistPoster = ({ source, onPress, children, pressDisabled }) => {
    return (
        <TouchableOpacity activeOpacity={0.7} onPress={onPress} disabled={pressDisabled} style={{width: 'auto', height: 'auto', bottom: '10%', overflow: 'hidden', borderRadius: 12}}>
            <WatchlistPosterBackground source={source}>
                {children}
            </WatchlistPosterBackground>
        </TouchableOpacity>
    )
}

const FinishButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: white;
    border-radius: 24px;
    flex-direction: row;
    justify-content: center;
    opacity: 1;
    border: solid 1px gray;
    height: 48px;
    width: ${windowWidth - 32}px;
`
const FinishButtonOuterContainer = styled(View)`
    align-items: center;
    margin-top: 20px;
    width: 100%;
    margin-bottom: ${props => props.bottomOffset ?? 0}px;
`
const FinishButtonText = styled(ReelayText.Subtitle2)`
    font-family: Outfit-Regular;
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    text-align: center;
    letter-spacing: 1px;
    text-transform: uppercase;
`

const FinishButton = ({ bottomOffset, onPress }) => {
    return (
        <FinishButtonOuterContainer bottomOffset={bottomOffset}>
            <FinishButtonContainer onPress={onPress} >
                <React.Fragment>             
                    <FinishButtonText>{'FINISH'}</FinishButtonText>   
                </React.Fragment>
            </FinishButtonContainer>
        </FinishButtonOuterContainer>
    );
}

const Tutorial = ({ navigation }) => {
    const dispatch = useDispatch();
    const [BigText, setBigText] = useState("On Reelay we talk about movies and TV shows.")
    const [SmallText, setSmallText] = useState("Scroll down")
    const verticalScrollRef = useRef();
    const [hasScrolledDown, setHasScrolledDown] = useState(false);
    const horizontalScrollRef = useRef();
    const [hasScrolledRight, setHasScrolledRight] = useState(false);
    const [drawerIsOpen, setDrawerIsOpen] = useState(false);
    const [addedToWatchlist, setAddedToWatchlist] = useState(false);

    const bottomOffset = useSafeAreaInsets().bottom + 20;

    useLayoutEffect(() => {
        animate(1000);
    }, [])

    const onScrollVertical = (e) => {
        let paddingToBottom = 150;
        paddingToBottom += e.nativeEvent.layoutMeasurement.height;
        if(e.nativeEvent.contentOffset.y >= e.nativeEvent.contentSize.height - paddingToBottom) {
          if (!hasScrolledDown) ScrollDown();
        }
    }

    const ScrollDown = () => {
        animateCustom({
            create: {
                duration: 1000,
                property: "opacity",
                type: "linear"
            },
            delete: {
                duration: 1000,
                property: "opacity",
                type: "linear"  
            }
        });
        setBigText("Scroll sideways to get more takes on the same title.");
        setSmallText("Scroll Right");
        setHasScrolledDown(true);
        verticalScrollRef.current.scrollTo({ y: 660 })
    }

    const ScrollRight = () => {
        setBigText("Add a title to your watchlist from any reelay.");
        setSmallText("");
        animateCustom({
            create: {
                duration: 1000,
                property: "opacity",
                type: "linear"
            },
            delete: {
                duration: 1000,
                property: "opacity",
                type: "linear"  
            }
        });
        setHasScrolledRight(true);
        horizontalScrollRef.current.scrollTo({ x: 1100})
    }

    const handleFinishedOnboarding = () => {
        AsyncStorage.setItem('isReturningUser', '1');
		dispatch({ type: 'setIsReturningUser', payload: true });
		navigation.navigate('SignedOutScreen');
    }


    return (
        <>
            <VerticalScrollContainer
                decelerationRate={0}
                onScroll={onScrollVertical}
                scrollEventThrottle={1}
                bounces={false}
                scrollEnabled={!hasScrolledDown}
                ref={verticalScrollRef}
            >
                <PostersContainer>
                    { hasScrolledRight ? <PosterFake /> : <PosterImage source={P1} /> }
                    { hasScrolledRight ? <PosterFake /> : <PosterImage source={P2} /> }
                    { hasScrolledRight ? <PosterFake /> : <PosterImage source={P3} /> }
                    <HorizontalReelayList scrollRef={horizontalScrollRef} onScrollRight={ScrollRight} sources={[P4, ...AutoPlayReelays, ""]} scrollEnabled={!hasScrolledRight} />
                    { hasScrolledRight ? <PosterFake /> : <PosterImage source={P5} /> }
                </PostersContainer>
            </VerticalScrollContainer>
            <ContentContainer pointerEvents="none">
                <TopOpacityGradient colors={["#000000", "transparent"]}>
                    <TutorialHeader>{BigText}</TutorialHeader>
                </TopOpacityGradient>
                <BottomOpacityGradient colors={["transparent", "#000000"]}>
                    <TutorialFooter arrow={hasScrolledDown ? (hasScrolledRight ? null : 'right') : 'down'}>{SmallText}</TutorialFooter>
                </BottomOpacityGradient>
            </ContentContainer>
            { hasScrolledRight && (
                <AddToWatchlistContainer>
                    <WatchlistPoster source={P4}>
                        <View style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: 'black', opacity: 0.4, borderRadius: 10}} />
                        <View style={{transform: [
                            { scale: 1.2 }
                        ]}}>
                            <AddToWatchlistButtonPressable>
                                <FontAwesomeIcon icon={faBookmark} color='white' size={22} />
                            </AddToWatchlistButtonPressable>
                        </View>
                    </WatchlistPoster>
                </AddToWatchlistContainer>
            )}
            { hasScrolledRight && <FinishButton bottomOffset={bottomOffset} onPress={handleFinishedOnboarding} /> }
            
        </>
    )
}

export default TutorialScreen;