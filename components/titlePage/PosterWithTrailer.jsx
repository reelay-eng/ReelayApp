import React, { useContext, useEffect, useState, useRef } from 'react';
import { 
    Image,
    Pressable, 
    View,
    StyleSheet,
} from 'react-native';

import { AuthContext } from '../../context/AuthContext';

// API
import { getLogoURL, changeSize, fetchMovieProviders } from '../../api/TMDbApi';
import { streamingVenues } from '../utils/VenueIcon'

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
import { useDispatch, useSelector } from 'react-redux';

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
	const dispatch = useDispatch();
	
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
		const [topProviders, setTopProviders] = useState([]);
		const componentMounted = useRef(true);
		const myStreamingSubscriptions = useSelector(state => state.myStreamingSubscriptions);
		useEffect(() => {
			const fetchAndConfigureProviders = async () => {
				var providers = await fetchMovieProviders(tmdbTitleID);
				if (!providers || !providers.US) return;
				providers = providers.US;
				if (providers.flatrate?.length > 0 && componentMounted.current) {
					const ReelayStreamingProviderIDs = streamingVenues.map(venue => venue.tmdbProviderID);
					const isReelayProvider = (provider) => (ReelayStreamingProviderIDs.includes(provider.provider_id));
					const providersOnReelay = providers.flatrate.filter(isReelayProvider);

					// check providers to return the first one that is in my streaming subscriptions
					const providerIsInMyStreaming = (provider) => (myStreamingSubscriptions.some(subscription => subscription.tmdbProviderID == provider.provider_id))
					// sort the providersOnReelay by those who satisfy providerIsInMyStreaming. For each of those, place an 'isInMyStreaming' boolean field on the resulting object.
					const providersOnReelayWithIsInMyStreaming = providersOnReelay.map(provider => ({
						...provider,
						isInMyStreaming: providerIsInMyStreaming(provider)
					}));
					// sort the providersOnReelayWithIsInMyStreaming by the isInMyStreaming boolean field.
					const providersOnReelaySorted = providersOnReelayWithIsInMyStreaming.sort((a, b) => (a.isInMyStreaming ? -1 : 1));
					console.log("Providers sorted by my streaming", providersOnReelaySorted);
					if (componentMounted.current) setTopProviders(providersOnReelaySorted);
				}
			}

			fetchAndConfigureProviders();
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
		const ProviderImage = ({ source, highlight }) => {
			const ProviderImageBase = styled(Image)`
				width: 30px;
				height: 30px;
				border-width: 1px;
				border-color: ${props => props.highlight ? ReelayColors.reelayBlue : "#ffffff"};
				border-radius: 15px;
				margin-left: 0px;
				margin-right: 10px;
			`;

			const CheckmarkCircle = styled(View)`
				position: absolute;
				align-items: center;
				justify-content: center;
				align-self: flex-end;
				border-radius: 50px;
			`

			const CheckmarkCircleContainer = styled(View)`
				position: absolute;
				width: 32px;
				height: 32px;
				flex-direction: column;
				align-items: flex-end;
				justify-content: flex-end;
			`
			return (
				<>
					<ProviderImageBase source={source} highlight={highlight} />
					{ highlight && (
						<CheckmarkCircleContainer>
							<CheckmarkCircle>
								<Icon style={{background: "white"}}type="ionicon" name="checkmark-circle" size={15} color={ReelayColors.reelayBlue} />
							</CheckmarkCircle>
						</CheckmarkCircleContainer>
					)}
				</>
			)
		}
		const TaglineTextContainer = styled(View)`
			display: flex;
			align-items: center;
			justify-content: center;
		`;
		const TaglineText = styled(ReelayText.Body1)`
			color: #ffffff;
			opacity: 0.6;
		`;

		// Quick fix in order to fit runtime and release year
		const ReducedGenres = genres?.slice(0, 2);

		//Conversion from minutes to hours and minutes
		const runtimeString = getRuntimeString(runtime);

		return (
			<TaglineContainer>
				<ProviderImagesContainer>
				{ topProviders.length > 0 && topProviders.map((provider, index) => {
					const completeLogoURI = { uri: getLogoURL(provider.logo_path)};
					const sizeCorrectedLogoURI = changeSize(completeLogoURI, "w92");
					return (
						<ProviderImage key={index} source={sizeCorrectedLogoURI} highlight={!!provider.isInMyStreaming}/>
					);
				})}
				</ProviderImagesContainer>
				<TaglineTextContainer>
					<TaglineText>{ReducedGenres?.map((e) => e.name).join(", ")}    {releaseYear}    {isMovie ? runtimeString : null} </TaglineText>
				</TaglineTextContainer>
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
			dispatch({ type: 'setJustShowMeSignupVisible', payload: true })
			return true;
		}
		return false;
	}

	const advanceToCreateReelay = () => {
		if (showMeSignupIfGuest()) return;
		console.log("go to venue select")
		navigation.reset({
			index: 0,
			routes: [{ name: 'BottomTab' }, { name: 'VenueSelectScreen', params: { titleObj: titleObj } }]
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
