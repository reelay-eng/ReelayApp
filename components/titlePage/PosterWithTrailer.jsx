import React, { useContext } from 'react';
import { Image, Pressable, SafeAreaView, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

// Styling
import ReelayColors from "../../constants/ReelayColors";
import styled from 'styled-components/native';
import { LinearGradient } from "expo-linear-gradient";

// Components
import * as ReelayText from "../../components/global/Text";
import { ActionButton, BWButton } from "../../components/global/Buttons";
import { Icon } from "react-native-elements";

// Logging
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

// Screen Orientation
import { getRuntimeString } from '../../components/utils/TitleRuntime';
import { useDispatch } from 'react-redux';
import AddToClubsButton from '../clubs/AddToClubsButton';

const BackButtonContainer = styled(Pressable)`
	position: absolute;
	margin-top: 51px;
	margin-left: 21px;
`
const CreateReelayButtonContainer = styled(View)`
	width: 100%;
	height: 40px;
	margin-top: 10px;
`
const GradientContainer = styled(View)`
	width: 100%;
	height: 100%;
	flex: 1;
`
const InfoBarContainer = styled(View)`
	align-items: center;
	flex-direction: row;
	justify-content: space-between;
	display: flex;
`
const PosterImage = styled(Image)`
	height: 100%;
	width: 100%;
	position: absolute;
`
const PosterOverlay = styled(View)`
	height: 100%;
	width: 100%;
	background-color: ${(props) => props.color};
	opacity: ${(props) => props.opacity};
	position: absolute;
`
const PosterInfoContainer = styled(View)`
	position: absolute;
	align-self: center;
	bottom: 5%;
	width: 92%;
`
const PosterTitleContainer = styled(View)`
	justify-content: flex-end;
	flex: 1;
`
const PosterTitle = styled(ReelayText.H4Bold)`
	color: white;
`
const ShareButtonsContainer = styled(SafeAreaView)`
	align-items: flex-end;
	justify-content: center;
	right: 10px;
	position: absolute;
`
const TaglineContainer = styled(View)`
	width: 90%;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	margin-bottom: 15px;
	margin-top: 5px;
`
const TaglineTextContainer = styled(View)`
	display: flex;
	align-items: center;
	justify-content: center;
`
const TaglineText = styled(ReelayText.Body1)`
	color: #ffffff;
	opacity: 0.6;
`
const TrailerButtonContainer = styled(View)`
	width: 100%;
	height: 40px;
`

export default PosterWithTrailer = ({
	navigation,
	height,
	posterSource,
	title,
	tmdbTitleID,
	trailerURI,
	titleObj,
	genres,
	releaseYear,
	runtime,
	isSeries,
}) => {
	const PosterContainer = styled(View)`
		height: ${height}px;
		width: 100%;
	`;

	const { reelayDBUser } = useContext(AuthContext);
	const dispatch = useDispatch();
	
	const PosterWithOverlay = () => {
		return (
			<View style={{height: "100%", width: "100%"}}>
				<PosterImage source={posterSource} />
				<PosterOverlay color={ReelayColors.reelayBlack} opacity={0.2} />
				<GradientContainer>
					<LinearGradient
						colors={["transparent", ReelayColors.reelayBlack]}
						style={{
							opacity: 1,
							width: '100%', 
							height: '100%'
						}}
					/>
				</GradientContainer>
			</View>
		);
	};

	const PosterTagline = () => {
		// Quick fix in order to fit runtime and release year
		const ReducedGenres = genres?.slice(0, 2);

		//Conversion from minutes to hours and minutes
		const runtimeString = getRuntimeString(runtime);

		return (
			<TaglineContainer>
				<TaglineTextContainer>
					<TaglineText>{ReducedGenres?.map((e) => e.name).join(", ")}    {releaseYear}    {isSeries ? null : runtimeString} </TaglineText>
				</TaglineTextContainer>
			</TaglineContainer>
		);
	};

	const showMeSignupIfGuest = () => {
		if (reelayDBUser?.username === 'be_our_guest') {
			dispatch({ type: 'setJustShowMeSignupVisible', payload: true })
			return true;
		}
		return false;
	}

	const advanceToCreateReelay = () => {
		if (showMeSignupIfGuest()) return;
		console.log("go to venue select")
		navigation.push('VenueSelectScreen', { titleObj: titleObj });
		logAmplitudeEventProd('advanceToCreateReelay', {
			username: reelayDBUser?.username,
			title: titleObj?.title?.display,
			source: 'titlePage',
		});
	}

	const advanceToWatchTrailer = () => {
		navigation.push("TitleTrailerScreen", {
			trailerURI: trailerURI,
		});
		logAmplitudeEventProd("watchTrailer", {
			title: title,
			tmdbTitleID: tmdbTitleID,
			source: "poster",
		});
	}

	const CreateReelayButton = () => {
		const createReelayIcon = <Icon color={"white"} type="ionicon" name="add-circle-outline" size={20} />;
		return (
			<CreateReelayButtonContainer>
				<ActionButton
					color='blue'
					text={"Create a Reelay"}
					leftIcon={createReelayIcon}
					onPress={advanceToCreateReelay}
					borderRadius={"20px"}
				/>
			</CreateReelayButtonContainer>
		);
	}

	const WatchTrailerButton = () => {
		const watchTrailerIcon = <Icon color={"white"} type="ionicon" name="play-circle-outline" size={20} />;
		return (
			<TrailerButtonContainer>
				<ActionButton
					color='green'
					text={"Watch Trailer"}
					leftIcon={watchTrailerIcon}
					onPress={advanceToWatchTrailer}
					borderRadius={"20px"}
				/>
			</TrailerButtonContainer>
		);
	}

	return (
		<PosterContainer>
			<PosterWithOverlay />
			<PosterInfoContainer>
				<InfoBarContainer>
					<PosterTitleContainer>
						<PosterTitle>{title}</PosterTitle>
						<PosterTagline />
					</PosterTitleContainer>
				</InfoBarContainer>
				{ trailerURI && <WatchTrailerButton /> }
				<CreateReelayButton />
			</PosterInfoContainer>
		</PosterContainer>
	);
};
