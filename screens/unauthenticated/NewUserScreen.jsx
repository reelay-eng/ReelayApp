import React, { useRef, useState, useContext } from "react";
import {
	Image,
	Pressable,
	View,
    ImageBackground,
    Dimensions
} from "react-native";
import { Button, BWButton } from "../../components/global/Buttons";
import ReelayColors from "../../constants/ReelayColors";
import styled from "styled-components/native";
import Carousel, { Pagination } from "react-native-snap-carousel";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';

import SplashBackground from "../../assets/images/reelay-newuser-background.png";
import ReelayLogoText from "../../assets/images/reelay-logo-text.png";
import StockPhotoGroup from "../../assets/images/Onboarding/Stock-reelay-onboarding.png";
import TrailerPhoto from "../../assets/images/Onboarding/Trailers-reelay-onboarding.png";
import * as ReelayText from '../../components/global/Text';

const Container = styled(View)`
	width: 100%;
	height: 100%;
    flex-direction: row;
`;
const CenteredContainer = styled(View)`
	width: 100%;
	height: 100%;
    justify-content: center;
    align-items: center;
`;

const ReelayBackground = styled(ImageBackground)`
	width: 100%;
	height: 50%;
    position: absolute;
    justify-content: center;
    align-items: center;
`;
const BlackContainer = styled(View)`
	width: 100%;
	height: 50%;
	background-color: black;
`;

const CarouselContainer = styled(View)`
	height: 50%;
	width: 100%;
	flex-direction: column;
	align-items: center;
`;
const HalfCarouselContainer = styled(View)`
	height: 25%;
	width: 100%;
	flex-direction: column;
	align-items: center;
`;
const CarouselTextContainer = styled(View)`
	height: 60%;
	width: 90%;
	flex-direction: column;
	align-items: center;
    margin-top: 54px;
`;
const CarouselTitle = styled(ReelayText.H4)`
    color: white;
    text-align: center;
    margin-bottom: 12px;
`
const CarouselBody = styled(ReelayText.Body2)`
    color: white;
    text-align: center;
	width: 75%;
`
const SkipNextAbsoluteContainer = styled(View)`
    width: 100%;
    height: 100%;
    position: absolute;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    z-index: 5;
`
const SkipNextContainer = styled(View)`
    width: 90%;
    left: 5%;
    bottom: 56px;
    position: absolute;
    height: 68px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`
const ButtonContainer = styled(View)`
    height: 68px;
    width: 31%;
`

export default NewUserScreen = ({ navigation }) => {
    return (
        <Container>
            <ReelayBackground source={SplashBackground} />
            <CarouselComponent navigation={navigation}/>
		</Container>
	);
};

const CarouselJsonItems = [
	{
		title: "What everyone's watching",
		description: "Get inspo from your friends on what you want to watch, binge, and explore.",
	},
	{
		title: "What everyone's saying",
		description: "Get a pulse on what's good and what's not. Share your take.",
	},
	{
		title: "What to watch next",
		description: "Hop straight into streaming your friends' favorite flicks.",
	},
];

const { height, width } = Dimensions.get("window");

const DisplayItems = [
	{ source: ReelayLogoText, width: 187 },
	{ source: StockPhotoGroup, width: width },
	{ source: TrailerPhoto, width: 300, marginLeft: 30, marginTop: 15 },
];


const CarouselComponent = ({navigation}) => {
    const [activeDotIndex, setActiveDotIndex] = useState(0);
    const isLastItem = activeDotIndex === (CarouselJsonItems.length - 1) ? true : false;
    const carouselRef = useRef();
    const { setIsReturningUser } = useContext(AuthContext);
    
    const handleFinishedOnboarding = () => {
        AsyncStorage.setItem('isReturningUser', '1');
        setIsReturningUser(true);
        navigation.navigate('SignedOutScreen');
    }

    const handleGoToNextItem = () => {
        if (isLastItem) {
            handleFinishedOnboarding();
            return;
        }
        carouselRef.current.snapToNext();
    }

	const renderCarouselItem = ({ item, index }) => {
        return (
			<>
				<CarouselContainer>
					<CenteredContainer>
						<Image
							source={DisplayItems[index].source}
							style={{
								width: DisplayItems[index].width,
								height: "100%",
								marginLeft: DisplayItems[index].marginLeft ?? 0,
								marginTop: DisplayItems[index].marginTop ?? 0,
							}}
							resizeMode="contain"
						/>
					</CenteredContainer>
				</CarouselContainer>
				<HalfCarouselContainer>
					<CarouselTextContainer>
						<CarouselTitle>{item.title}</CarouselTitle>
						<CarouselBody>{item.description}</CarouselBody>
					</CarouselTextContainer>
				</HalfCarouselContainer>
			</>
		);
    };

    const PaginationContainer = styled(View)`
        position: absolute;
        width: 100%;
        height: 44px;
        flex-direction: column;
        align-items: center;
    `

    return (
		<Container>
			<PaginationContainer style={{ top: height / 2 + 10 }}>
				<View style={{ width: 50, height: 44 }}>
					<Pagination
						dotsLength={CarouselJsonItems.length}
						activeDotIndex={activeDotIndex}
						containerStyle={{
							backgroundColor: "transparent",
							paddingTop: 20,
							paddingBottom: 24,
							zIndex: 10,
						}}
						dotStyle={{
							width: 10,
							height: 10,
							borderRadius: 5,
							marginHorizontal: -5,
							backgroundColor: "rgba(255, 255, 255, 0.92)",
						}}
						inactiveDotStyle={{
							width: 10,
							height: 10,
							borderRadius: 5,
							marginHorizontal: -7,
							backgroundColor: "rgba(255, 255, 255, 0.92)",
						}}
						inactiveDotOpacity={0.4}
						inactiveDotScale={0.8}
					/>
				</View>
			</PaginationContainer>
			<Carousel
				ref={carouselRef}
				renderItem={renderCarouselItem}
				data={CarouselJsonItems}
				sliderWidth={width}
				itemWidth={width}
				onBeforeSnapToItem={(index) => {
					setActiveDotIndex(index);
				}}
            />
            <SkipNextContainer>
                <ButtonContainer>
                    <Button
                        text={"SKIP"}
                        onPress={handleFinishedOnboarding}
                        borderRadius="50px"
                        border="none"
                        backgroundColor={"#000000"}
                        fontColor={"#FFFFFF"}
                        pressedColor={"#0D0D0D"}
                    />
                </ButtonContainer>
                <ButtonContainer>
                    <Button text={"NEXT"} onPress={handleGoToNextItem} borderRadius="50px" />
                </ButtonContainer>
            </SkipNextContainer>
		</Container>
	);
}
