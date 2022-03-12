import React, { useContext, useEffect, useState, useRef } from 'react';
import { 
    Image,
    Pressable, 
    View,
    StyleSheet,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';

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
		const s = StyleSheet.create({
			gradient: {
				flex: 1,
				opacity: 1,
			},
		});
		return (
			<>
				<PosterImage source={posterSource} />
				<PosterOverlay color={ReelayColors.reelayBlack} opacity={0.2} />
				<LinearGradient
					colors={["transparent", ReelayColors.reelayBlack]}
					style={s.gradient}
				/>
			</>
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
	`
	const PosterInfoContainer = styled(View)`
		position: absolute;
		left: 4%;
		bottom: 5%;
		width: 92%;
		display: flex;
		flex-direction: column;
	`
	const PosterTitleContainer = styled(View)`
		justify-content: flex-end;
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
		width: 45px;
	`
	const TrailerButtonContainer = styled(View)`
		width: 100%;
		height: 40px;
	`
	const WatchlistButtonsContainer = styled(View)`
		flex-direction: row;
	`

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
						<AddToWatchlistButton titleObj={titleObj} />
						<SendRecButtonContainer>
							<SendRecButton navigation={navigation} titleObj={titleObj} />
						</SendRecButtonContainer>
					</WatchlistButtonsContainer>
				</InfoBarContainer>
				{trailerURI && (
					<TrailerButtonContainer>
						<ActionButton
							color='green'
							text={"Watch Trailer"}
							leftIcon={
								<Icon
									color={"white"}
									type="ionicon"
									name="play-circle-outline"
									size={20}
								/>
							}
							onPress={() => {
								navigation.push("TitleTrailerScreen", {
									trailerURI: trailerURI,
								});
								logAmplitudeEventProd("watchTrailer", {
									title: title,
									tmdbTitleID: tmdbTitleID,
									source: "poster",
								});
							}}
							borderRadius={"20px"}
						/>
					</TrailerButtonContainer>
				)}
				<CreateReelayButtonContainer>
					<ActionButton
						color='blue'
						text={"Create a Reelay"}
						leftIcon={
							<Icon
								color={"white"}
								type="ionicon"
								name="add-circle-outline"
								size={20}
							/>
						}
						onPress={() => {
							navigation.getParent().push("VenueSelectScreen", {
								titleObj: titleObj,
							});
							logAmplitudeEventProd('advanceToCreateReelay', {
								username: reelayDBUser?.username,
								title: titleObj?.title?.display,
								source: 'titlePage',
							});
						}}
						borderRadius={"20px"}
					/>
				</CreateReelayButtonContainer>
			</PosterInfoContainer>
		</PosterContainer>
	);
};
