import React, { useState, useEffect, useRef, useLayoutEffect } from "react"
import {
	Image,
    ImageBackground,
	View,
    Dimensions,
    ScrollView, 
    SafeAreaView,
    TouchableOpacity
} from "react-native";

import { AnimatedText } from "../../components/global/Text";

import styled from "styled-components"

import { Video } from 'expo-av'

import { AddToClubsIconSVG } from '../../components/global/SVGs';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import HouseOfTheDragon from "../../assets/images/Onboarding/Posters/P1.png"
import Minions from "../../assets/images/Onboarding/Posters/P2.png"
import StrangerThings from "../../assets/images/Onboarding/Posters/P3.png"
import IronMan2 from "../../assets/images/Onboarding/Posters/P4.png"
import SpiderMan from "../../assets/images/Onboarding/Posters/P5.png"

import PressThisArrow from "../../assets/images/Onboarding/PressThisArrow.png";

const AutoPlayReelays = [
    "https://di92fpd9s7eko.cloudfront.net/public/reelayvid-4bfcc6be-862e-465a-b7a8-319d9aa13848-1660834785614.mp4", 
    "https://di92fpd9s7eko.cloudfront.net/public/reelayvid-c4bc0193-346b-4731-a9bb-508c6ca86324-1643926225077.mp4",
    "https://di92fpd9s7eko.cloudfront.net/public/reelayvid-a5addf82-69d6-4451-a6fe-f0ae4583294b-1655095439429.mp4",
    "https://di92fpd9s7eko.cloudfront.net/public/reelayvid-3d302546-d078-455e-a0aa-559a976aac6b-1657398858236.mp4",
    "https://di92fpd9s7eko.cloudfront.net/public/reelayvid-7e30c085-1539-43ae-aa99-536aaa439990-1643612341197.mp4"
].map(url => { return { uri: url } });

import { LinearGradient } from "expo-linear-gradient";
import { animate, animateCustom } from "../../hooks/animations";

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

const SafeAreaContainer = styled(SafeAreaView)`
    width: 100%;
    height: 100%;
`

const IntroScreen = ({ navigation }) => {
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
            posterSource={IronMan2}
            isLooping
            isMuted={true}
            rate={1.0}
            resizeMode='cover'
            // shouldDuckAndroid={true}
            shouldPlay={true}
            source={source}
            // staysActiveInBackground={false}
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
    fontWeight: 600,
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
    border: solid 1px purple;
    justify-content: center;
    align-items: center;
`

const ArrowContainer = styled(View)`
    position: absolute;
    height: 38%;
    left: 40%;
    bottom: 20%;
`

const Arrow = styled(Image)`
    height: 100%;
`

const WatchlistPoster = styled(ImageBackground)`
    width: ${REELAY_WIDTH * 0.6}px;
    height: ${REELAY_HEIGHT * 0.6}px;
    border-radius: 12px;
    bottom: 10%;
    justify-content: center;
    align-items: center;
`




const Tutorial = () => {

    const [BigText, setBigText] = useState("On Reelay we talk about movies and TV shows.")
    const [SmallText, setSmallText] = useState("Scroll down")

    const verticalScrollRef = useRef();
    const [hasScrolledDown, setHasScrolledDown] = useState(false);

    const horizontalScrollRef = useRef();
    const [hasScrolledRight, setHasScrolledRight] = useState(false);

    const [drawerIsOpen, setDrawerIsOpen] = useState(false);

    useLayoutEffect(() => {
        animate(1000);
    }, [])

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
        setBigText("Scroll sideways to get more opinions on the same title.");
        setSmallText("Scroll Right");
        setHasScrolledDown(true);
        verticalScrollRef.current.scrollTo({ y: 660 })
    }

    const ScrollRight = () => {
        setBigText("Add titles to your watchlist or to a club.");
        setSmallText("Press this icon");
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

    const OpenAddToWatchlistDrawer = () => {
        setSmallText("");
        setDrawerIsOpen(true);
    }


    return (
        <>
            <VerticalScrollContainer
                decelerationRate={0}
                onScrollBeginDrag={ScrollDown}
                bounces={false}
                scrollEnabled={!hasScrolledDown}
                ref={verticalScrollRef}
            >
                <PostersContainer>
                    { hasScrolledRight ? <PosterFake /> : <PosterImage source={HouseOfTheDragon} /> }
                    { hasScrolledRight ? <PosterFake /> : <PosterImage source={Minions} /> }
                    { hasScrolledRight ? <PosterFake /> : <PosterImage source={StrangerThings} /> }
                    <HorizontalReelayList scrollRef={horizontalScrollRef} onScrollRight={ScrollRight} sources={[IronMan2, ...AutoPlayReelays, ""]} scrollEnabled={!hasScrolledRight} />
                    { hasScrolledRight ? <PosterFake /> : <PosterImage source={SpiderMan} /> }
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
                    <WatchlistPoster source={IronMan2}>
                        <View style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: 'black', opacity: 0.4, borderRadius: 10}} />
                        <TouchableOpacity style={{transform: [
                            { scale: 1.2 }
                        ]}} onPress={OpenAddToWatchlistDrawer}>
                            <AddToClubsIconSVG width={46} height={33}/>
                        </TouchableOpacity>
                    </WatchlistPoster>
                    { !drawerIsOpen && 
                        <ArrowContainer>
                            <Arrow source={PressThisArrow} resizeMode={"contain"}/>
                        </ArrowContainer>
                    }
                    
                </AddToWatchlistContainer>
            )}
            
        </>
    )
}

export default IntroScreen;