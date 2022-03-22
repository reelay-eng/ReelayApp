import React, { useContext, useEffect, useState, useRef } from 'react';
import { 
    Image,
    Pressable, 
    View,
    StyleSheet,
} from 'react-native';

import { AuthContext } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';

// API
import { getLogoURL, fetchMovieProviders } from '../../api/TMDbApi';

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
import AddToWatchlistButton from './AddToWatchlistButton';
import SendRecButton from '../watchlist/SendRecButton';

const Spacer = styled(View)`
	height: ${(props) => props.height}px;
`;

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
	isMovie,
}) => {
	const PosterContainer = styled(View)`
		height: ${height}px;
		width: 100%;
	`;

	const { reelayDBUser } = useContext(AuthContext);
	const { setJustShowMeSignupVisible } = useContext(FeedContext);
	
	const PosterWithOverlay = () => {
		const PosterImage = styled(Image)`
			height: 100%;
			width: 100%;
			position: absolute;
		`;
		const PosterOverlay = styled(View)`
			height: 100%;
			width: 100%;
			background-color: ${(props) => props.color};
			opacity: ${(props) => props.opacity};
			position: absolute;
		`;
		const GradientContainer = styled(View)`
 			width: 100%;
 			height: 100%;
			flex: 1;
 		`;

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
		const [topProviderLogo, setTopProviderLogo] = useState("");
		const componentMounted = useRef(true);
		useEffect(() => {
			(async () => {
				var providers = await fetchMovieProviders(tmdbTitleID);
				if (!providers || !providers.US) return;
				providers = providers.US; // change this for when we want multi country support
				if (providers.rent?.length > 0 && componentMounted.current) {
					setTopProviderLogo(providers.rent[0].logo_path);
				}
			})();
			return () => {
				componentMounted.current = false;
			};
		}, []);

		const TaglineContainer = styled(View)`
            width: 90%;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: flex-start;
			margin-bottom: 15px;
			margin-top: 5px;
		`;
		// in case we want to have multiple provider images

		const ProviderImagesContainer = styled(View)`
			display: flex;
			flex-direction: row;
			align-items: flex-start;
			justify-content: space-between;
		`;
		const ProviderImage = styled(Image)`
			width: 30px;
			height: 30px;
			border-width: 1px;
			border-color: #ffffff;
			border-radius: 15px;
			margin-left: 0px;
		`;
		const TaglineTextContainer = styled(View)`
			margin-left: ${topProviderLogo.length > 0 ? "7px" : "0px"};
			display: flex;
			align-items: center;
			justify-content: center;
		`;
		const TaglineText = styled(ReelayText.Body1)`
			color: #ffffff;
			opacity: 0.6;
		`;

		// Quick fix in order to fit runtime and release year
		const ReducedGenres = genres.slice(0, 2);

		//Conversion from minutes to hours and minutes
		const runtimeString = getRuntimeString(runtime);

		return (
			<TaglineContainer>
				{topProviderLogo.length > 0 && (
					<ProviderImagesContainer>
						<ProviderImage source={{ uri: getLogoURL(topProviderLogo) }} />
					</ProviderImagesContainer>
				)}
				{isMovie === true && (
					<TaglineTextContainer>
						<TaglineText>{ReducedGenres?.map((e) => e.name).join(", ")}    {releaseYear}    {runtimeString}</TaglineText>
					</TaglineTextContainer>
				)} 
				{isMovie === false && (
					<TaglineTextContainer>
						<TaglineText>{ReducedGenres?.map((e) => e.name).join(", ")}    {releaseYear}</TaglineText>
					</TaglineTextContainer>
				)}
			</TaglineContainer>
		);
	};

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
	const InfoBarContainer = styled(View)`
		align-items: center;
		flex-direction: row;
		justify-content: space-between;
		display: flex;
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
	const SendRecButtonContainer = styled(View)`
		align-items: center;
		background-color: rgba(255, 255, 255, 0.40);
		border-radius: 30px;
		justify-content: center;
		height: 45px;
		margin: 10px;
		width: 45px;
	`
	const TrailerButtonContainer = styled(View)`
		width: 100%;
		height: 40px;
	`
	const WatchlistButtonsContainer = styled(View)`
		align-items: flex-end;
		flex: 0.1;
		justify-content: center;
		left: 10px;
		margin-bottom: 15px;
	`

	const showMeSignupIfGuest = () => {
		if (reelayDBUser?.username === 'be_our_guest') {
			setJustShowMeSignupVisible(true);
			return true;
		}
		return false;
	}

	const advanceToCreateReelay = () => {
		if (showMeSignupIfGuest()) return;
		navigation.getParent().push("VenueSelectScreen", {
			titleObj: titleObj,
		});
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
			<BackButtonContainer onPress={() => navigation.goBack()}>
				<Icon type="ionicon" name={"arrow-back-outline"} color={"white"} size={25} />
			</BackButtonContainer>
			<PosterInfoContainer>
				<InfoBarContainer>
					<PosterTitleContainer>
						<PosterTitle>{title}</PosterTitle>
						<PosterTagline />
					</PosterTitleContainer>
					<WatchlistButtonsContainer>
						<SendRecButtonContainer>
							<SendRecButton navigation={navigation} titleObj={titleObj} />
						</SendRecButtonContainer>
						<AddToWatchlistButton titleObj={titleObj} />
					</WatchlistButtonsContainer>
				</InfoBarContainer>
				{ trailerURI && <WatchTrailerButton /> }
				<CreateReelayButton />
			</PosterInfoContainer>
		</PosterContainer>
	);
};
