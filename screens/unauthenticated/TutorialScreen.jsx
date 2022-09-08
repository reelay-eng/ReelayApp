import React, { useState, useEffect, useRef, useLayoutEffect } from "react"
import {
    ActivityIndicator,
	Image,
    ImageBackground,
	View,
    Dimensions,
    ScrollView, 
    SafeAreaView,
    Modal,
    TouchableOpacity,
    KeyboardAvoidingView,
    Pressable
} from "react-native";

import { AnimatedText } from "../../components/global/Text";
import * as ReelayText from "../../components/global/Text";
import { Icon } from "react-native-elements";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from "react-redux";

import styled from "styled-components"
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video } from 'expo-av'

import { AddToClubsIconSVG } from '../../components/global/SVGs';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import HouseOfTheDragon from "../../assets/images/Onboarding/Posters/P1.png"
import Minions from "../../assets/images/Onboarding/Posters/P2.png"
import StrangerThings from "../../assets/images/Onboarding/Posters/P3.png"
import IronMan2 from "../../assets/images/Onboarding/Posters/P4.png"
import SpiderMan from "../../assets/images/Onboarding/Posters/P5.png"

import HorrorPodcast from "../../assets/images/Onboarding/ClubDrawer/80sHorrorPodcast.png";
import A24FanClub from "../../assets/images/Onboarding/ClubDrawer/A24FanClub.png";
import MyWatchlist from "../../assets/images/Onboarding/ClubDrawer/MyWatchlist.png";
import SecretFamilyGroup from "../../assets/images/Onboarding/ClubDrawer/SecretFamilyGroup.png";

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

const ClubRowContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    display: flex;
    flex: 1;
`
const ClubNameText = styled(ReelayText.Subtitle1Emphasized)`
    color: white;
`
const DrawerContainer = styled(View)`
    background-color: #1a1a1a;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    margin-top: auto;
    max-height: 60%;
    padding-bottom: ${props => props.bottomOffset}px;
    width: 100%;
`
const ModalContainer = styled(View)`
    position: absolute;
`
const RowContainer = styled(Pressable)`
    align-items: center;
    background-color: ${(props) => props.backgroundColor};
    flex-direction: row;
    padding: 6px;
    padding-left: 20px;
    padding-right: 20px;
    border-bottom-color: #505050;
    border-bottom-width: 0.3px;    
`
const ClubsContainer = styled(View)`
    margin-bottom: 10px;
    align-items: center;
`
const ProfileImage = styled(Image)`
    border-color: white;
    border-radius: ${(props) => props.size/2}px;
    border-width: ${(props) => (props.border) ? 1 : 0}px;
    height: ${(props) => props.size}px;
    width: ${(props) => props.size}px;
`

const AddTitleButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${props => props.disabled ? ReelayColors.reelayBlack : ReelayColors.reelayBlue};
    border-radius: 24px;
    flex-direction: row;
    justify-content: center;
    opacity: ${props => props.disabled ? "0.8" : "1"};
    border: ${props => props.disabled ? "solid 1px gray" : "none"};
    height: 48px;
    width: ${windowWidth - 32}px;
`
const AddTitleButtonOuterContainer = styled(View)`
    align-items: center;
    margin-top: 20px;
    width: 100%;
`
const AddTitleButtonText = styled(ReelayText.Subtitle2)`
    color: white;
    margin-left: 4px;
`

const AddTitleButton = ({ bottomOffset, onPress, disabled }) => {
    return (
        <AddTitleButtonOuterContainer bottomOffset={bottomOffset}>
            <AddTitleButtonContainer onPress={onPress} disabled={disabled}>
                <React.Fragment>
                    <Icon type='ionicon' name='bookmark' size={16} color='white' />                 
                    <AddTitleButtonText>{'Add title to continue'}</AddTitleButtonText>   
                </React.Fragment>
            </AddTitleButtonContainer>
        </AddTitleButtonOuterContainer>
    );
}

const CheckmarkIconContainer = styled(View)`
align-items: center;
justify-content: center;
height: 30px;
width: 30px;
`
const ProfilePictureContainer = styled(View)`
    margin-top: 6px;
    margin-bottom: 6px;
    margin-right: 10px;
`

const ClubRow = ({ name, image, anySelected, setAnySelected }) => {
    const [selected, setSelected] = useState(false);

    const onPress = () => {
        if (!selected && !anySelected) setAnySelected(true);
        setSelected(prev => !prev);
    }

    return (
        <RowContainer 
            backgroundColor={selected ? ReelayColors.reelayBlue : "#1a1a1a"} 
            onPress={onPress}>
            <ClubRowContainer>
                <ProfilePictureContainer>
                    <ProfileImage 
                        border={true}
                        size={32}
                        source={image}
                        PlaceholderContent={<ActivityIndicator />}
                    />
                </ProfilePictureContainer>
                <ClubNameText>{name}</ClubNameText>
            </ClubRowContainer>
            { selected && (
                <CheckmarkIconContainer>
                    <Icon type='ionicon' name={"checkmark-done"} size={30} color="white" />
                </CheckmarkIconContainer>                        
            )}
            { !selected && (
                <CheckmarkIconContainer>
                    <AddToClubsIconSVG size={30} />
                </CheckmarkIconContainer>
            )}

        </RowContainer>
    )
}

const HeaderContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding: 20px;
    padding-bottom: 10px;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 20px;
`

const Header = () => {
    return (
        <HeaderContainer>
            <HeaderText>
                My Clubs
            </HeaderText>
        </HeaderContainer>
    )
}

const AddToClubDrawer = ({ drawerIsOpen, onFinish }) => {
    const bottomOffset = useSafeAreaInsets().bottom;
    const [anySelected, setAnySelected] = useState(false);

    const ClubItems = [
        { name: "My Watchlist", image: MyWatchlist },
        { name: "Secret Family Group", image: SecretFamilyGroup },
        { name: "A24 Fan Club", image: A24FanClub },
        { name: "The 80s Horror Podcast", image: HorrorPodcast },
    ]

    return (
        <ModalContainer>
            <Modal animationType='slide' transparent={true} visible={drawerIsOpen}>
                <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <DrawerContainer bottomOffset={bottomOffset}>
                    <Header />
                    <ClubsContainer>
                        { ClubItems.map(( { name, image }, index) => (
                            <ClubRow name={name} image={image} key={index} anySelected={anySelected} setAnySelected={setAnySelected}/>
                        ))}
                    </ClubsContainer>
                    <AddTitleButton disabled={!anySelected} bottomOffset={bottomOffset} onPress={onFinish}/>
                </DrawerContainer>
                </KeyboardAvoidingView>
            </Modal>
        </ModalContainer>
    )
}

const AddToWatchlistContainer = styled(View)`
    position: absolute;
    width: 100%;
    height: 100%;
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

const Tutorial = ({ navigation }) => {
    const dispatch = useDispatch();

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

    const handleFinishedOnboarding = () => {
        setDrawerIsOpen(false);
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
                    <AddToClubDrawer drawerIsOpen={drawerIsOpen} setDrawerIsOpen={setDrawerIsOpen} onFinish={handleFinishedOnboarding}/>
                    
                </AddToWatchlistContainer>
            )}
            
        </>
    )
}

export default TutorialScreen;