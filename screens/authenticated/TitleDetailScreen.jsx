import React, { useContext, useEffect, useState, useRef } from 'react';
import { 
    ActivityIndicator, 
    Dimensions, 
    Image,
    Pressable, 
    ScrollView, 
    Text, 
    View,
    StyleSheet,
	Linking
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';

// API
import { getPosterURL, getLogoURL, fetchMovieProviders } from '../../api/TMDbApi';
import { getMostRecentReelaysByTitle } from "../../api/ReelayDBApi";

// Context
import { FeedContext } from '../../context/FeedContext';

// Styling
import ReelayColors from "../../constants/ReelayColors";
import styled from 'styled-components/native';
import { LinearGradient } from "expo-linear-gradient";

// Components
import * as ReelayText from "../../components/global/Text";
import { ActionButton, BWButton } from "../../components/global/Buttons";
import { DirectorBadge, ActorBadge } from "../../components/global/Badges";
import * as VideoThumbnails from "expo-video-thumbnails";
import { Icon } from "react-native-elements";
import AppleTVAd from '../../components/titlePage/AppleTVAd';

// Media
import SplashImage from "../../assets/images/reelay-splash.png";
import GRating from "../../assets/images/MPAA_Ratings/GRating.png";
import PGRating from "../../assets/images/MPAA_Ratings/PGRating.png";
import PG13Rating from "../../assets/images/MPAA_Ratings/PG13Rating.png";
import NC17Rating from "../../assets/images/MPAA_Ratings/NC17Rating.png";
import RRating from "../../assets/images/MPAA_Ratings/RRating.png";

// Logging
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

const Spacer = styled(View)`
	height: ${(props) => props.height}px;
`;

const tmdbImageApiBaseUrl = `http://image.tmdb.org/t/p/w500/`;

export default TitleDetailScreen = ({ navigation, route }) => {
	// Screen-wide dimension handling
	const { height, width } = Dimensions.get("window");

	// Parse Title Object
	const { titleObj } = route.params;
	const actors = titleObj?.displayActors;
	const director = titleObj?.director?.name;
	const overview = titleObj?.overview;
	const tmdbTitleID = titleObj?.id;
	const trailerURI = titleObj?.trailerURI;
	const genres = titleObj?.genres;
	const rating = titleObj?.rating;

	// hide tab bar
	const { setTabBarVisible } = useContext(FeedContext);
	useEffect(() => {
		setTabBarVisible(false);
		return () => {
			setTabBarVisible(true);
		};
	});

	const ScrollBox = styled(ScrollView)`
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: #0d0d0d;
	`;
	return (
		<ScrollBox showsVerticalScrollIndicator={false}>
			<PosterWithTrailer
				navigation={navigation}
				height={height * 0.6}
				posterURI={titleObj?.posterURI}
				title={titleObj?.display}
				titleObj={titleObj}
				tmdbTitleID={tmdbTitleID}
				trailerURI={trailerURI}
				genres={genres}
			/>
			<PopularReelaysRow navigation={navigation} titleObj={titleObj} />
			<MovieInformation director={director} actors={actors} description={overview} rating={rating} />
			<Spacer height={20} />
			<AppleTVAd />
			<BottomBackButton navigation={navigation} />
			<Spacer height={100} />
		</ScrollBox>
	);
};

const BottomBackButton = ({ navigation }) => {
	const BackButtonContainer = styled(View)`
		width: 100%;
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		margin-left: 21px;
		margin-top: 20px;
	`
	return (
		<BackButtonContainer>
			<Pressable onPress={() => navigation.goBack()}>
				<Icon type="ionicon" name={"arrow-back-outline"} color={"white"} size={25} />
			</Pressable>
		</BackButtonContainer>
	);
}

const PosterWithTrailer = ({
	navigation,
	height,
	posterURI,
	title,
	tmdbTitleID,
	trailerURI,
	titleObj,
	genres,
}) => {
	const PosterContainer = styled(View)`
		height: ${height}px;
		width: 100%;
	`;

	const { cognitoUser } = useContext(AuthContext);
	const posterURL = getPosterURL(posterURI);
	const PosterWithOverlay = ({ posterURL }) => {
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
				<PosterImage source={{ uri: posterURL }} />
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
		const TaglineText = styled(ReelayText.H6Emphasized)`
			color: #ffffff;
			opacity: 0.6;
		`;

		return (
			<TaglineContainer>
				{topProviderLogo.length > 0 && (
					<ProviderImagesContainer>
						<ProviderImage source={{ uri: getLogoURL(topProviderLogo) }} />
					</ProviderImagesContainer>
				)}
				{genres?.length > 0 && (
					<TaglineTextContainer>
						<TaglineText>{genres?.map((e) => e.name).join(", ")}</TaglineText>
					</TaglineTextContainer>
				)}
			</TaglineContainer>
		);
	};

	const PosterInfoContainer = styled(View)`
		position: absolute;
		left: 4%;
		bottom: 5%;
		width: 92%;
		display: flex;
		flex-direction: column;
	`;

	const PosterTitleContainer = styled(View)`
		width: 90%;
	`;
	const PosterTitle = styled(ReelayText.H4Bold)`
		color: white;
	`;

	const TrailerButtonContainer = styled(View)`
		width: 100%;
		height: 40px;
	`;
	const CreateReelayButtonContainer = styled(View)`
		width: 100%;
		height: 40px;
		margin-top: 10px;
	`;

	const BackButtonContainer = styled(Pressable)`
		position: absolute;
		margin-top: 51px;
		margin-left: 21px;
	`;

	return (
		<PosterContainer>
			<PosterWithOverlay posterURL={posterURL} />
			<BackButtonContainer onPress={() => navigation.goBack()}>
				<Icon type="ionicon" name={"arrow-back-outline"} color={"white"} size={25} />
			</BackButtonContainer>
			<PosterInfoContainer>
				<PosterTitleContainer>
					<PosterTitle>{title}</PosterTitle>
				</PosterTitleContainer>
				<PosterTagline />
				{trailerURI && (
					<TrailerButtonContainer>
						<ActionButton
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
							}}
							borderRadius={"20px"}
						/>
					</TrailerButtonContainer>
				)}
				<CreateReelayButtonContainer>
					<ActionButton
						color="red"
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
								username: cognitoUser?.username,
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

const ReturnButton = ({ navigation }) => {
	const ReturnButtonContainer = styled(View)`
		display: flex;
		align-self: center;
		height: 60px;
		margin-top: 20px;
		margin-bottom: 100px;
		width: 84%;
	`;
	return (
		<ReturnButtonContainer>
			<ActionButton
				onPress={() => navigation.pop()}
				text="Back to Reelay"
				fontSize="24px"
				color="red"
			/>
		</ReturnButtonContainer>
	);
};

const PopularReelaysRow = ({ navigation, titleObj }) => {
	const [topReelays, setTopReelays] = useState([]);
	const componentMounted = useRef(true);

	const byReelayPopularity = (reelay1, reelay2) => {
		const reelay1Score = reelay1.likes.length + reelay1.comments.length;
		const reelay2Score = reelay2.likes.length + reelay2.comments.length;
		return reelay2Score - reelay1Score;
	};

	const fetchTopReelays = async () => {
		const mostRecentReelays = await getMostRecentReelaysByTitle(titleObj.id);
		if (mostRecentReelays?.length && componentMounted.current) {
			const nextTopReelays = mostRecentReelays.sort(byReelayPopularity);
			setTopReelays(nextTopReelays);
		}
	};

	useEffect(() => {
		fetchTopReelays();
		return () => (componentMounted.current = false);
	}, []);

	const goToReelay = (index) => {
		if (topReelays.length === 0) return;
		navigation.push("TitleFeedScreen", {
			initialStackPos: index,
			fixedStackList: [topReelays],
		});
	};

	const ReelayThumbnail = ({ reelay, index }) => {
		const ThumbnailContainer = styled(View)`
			justify-content: center;
			margin: 6px;
			height: 202px;
			width: 107px;
		`;
		const ThumbnailImage = styled(Image)`
			border-radius: 8px;
			height: 200px;
			width: 105px;
		`;
		const [loading, setLoading] = useState(true);
		const [thumbnailURI, setThumbnailURI] = useState("");

		useEffect(() => {
			// Generate thumnbail async
			let isMounted = true;
			(async () => {
				try {
					const { uri } = await VideoThumbnails.getThumbnailAsync(
						reelay.content.videoURI,
						{
							time: 1000,
							quality: 0.4,
						}
					);
					if (isMounted) {
						setThumbnailURI(uri);
						setLoading(false);
					}
				} catch (error) {
					console.warn(error);
					if (isMounted) {
						setLoading(false);
						setThumbnailURI("");
					}
				}
			})();
			return () => (isMounted = false);
		}, []);

		const GradientContainer = styled(View)`
			position: absolute;
			width: 100%;
			height: 65%;
			top: 35%;
			bottom: 0;
			left: 0;
			right: 0;
			justify-content: center;
			align-items: center;
			border-radius: 8px;
		`;
		const UsernameText = styled(ReelayText.Subtitle2)`
			padding: 5px;
			position: absolute;
			bottom: 5%;
			color: white;
		`;


		return (
			<Pressable
				key={reelay.id}
				onPress={() => {
					goToReelay(index);
				}}
			>
				<ThumbnailContainer>
					{loading && <ActivityIndicator />}
					{!loading && (
						<>
							<ThumbnailImage
								source={
									thumbnailURI.length > 0 ? { uri: thumbnailURI } : SplashImage
								}
							/>
							<GradientContainer>
								<LinearGradient
									colors={["transparent", "#0B1424"]}
									style={{
										flex: 1,
										opacity: 1,
										width: "100%",
										height: "100%",
										borderRadius: "8px",
									}}
								/>
								<UsernameText>
									{`@${
										reelay.creator.username.length > 13
											? reelay.creator.username.substring(0, 10) + "..."
											: reelay.creator.username
									}`}
								</UsernameText>
							</GradientContainer>
						</>
					)}
				</ThumbnailContainer>
			</Pressable>
		);
	};

	const TopReelays = () => {
		const TopReelaysContainer = styled(View)`
			width: 95%;
			left: 5%;
		`;
		const ThumbnailScrollContainer = styled(View)`
			align-items: center;
			flex-direction: row;
			justify-content: flex-start;
			height: 220px;
			width: 100%;
		`;
		const TopReelaysHeader = styled(ReelayText.H5Emphasized)`
			padding: 10px;
			color: white;
		`;

		return (
			<TopReelaysContainer>
				<TopReelaysHeader>{`Top Reviews`}</TopReelaysHeader>
				<ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
					<ThumbnailScrollContainer>
						{
							topReelays.map((reelay, index) => {
								return (
									<ReelayThumbnail
										key={reelay.id}
										reelay={reelay}
										index={index}
									/>
								);
							})
						}
					</ThumbnailScrollContainer>
				</ScrollView>
			</TopReelaysContainer>
		);
	};

	const Container = styled(View)`
		width: 100%;
	`;
	const ButtonContainer = styled(View)`
		margin-top: 10px;
		margin-bottom: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
	`;
	const ButtonSizer = styled(View)`
		width: 84%;
		height: 40px;
	`;
	if (topReelays.length > 0) return (
		<Container>
			<TopReelays />
			<ButtonContainer>
				<ButtonSizer>
					<BWButton
						text={"See all reviews"}
						fontSize={"28px"}
						onPress={() => {
							goToReelay(0);
						}}
					/>
				</ButtonSizer>
			</ButtonContainer>
		</Container>
	);
	else return null;
};

const MovieInformation = ({description, director, actors, rating}) => {

    const MIExternalContainer = styled(View)`
		margin-right: 4%;
		margin-left: 4%;
		border-radius: 8px;
		background-color: #191919;
	`;

    const MIInternalContainer = styled(View)`
        display: flex;
        flex-direction: column;
        margin-left: 10px;
		margin-right: 10px;
		margin-bottom: 20px;
		margin-top: 20px;
    `

    const HeadingText = styled(ReelayText.H5Emphasized)`
        color: white;
    `

    const DescriptionCollapsible = ({description}) => {
        const [descriptionIsCut, setDescriptionIsCut] = useState(true);
		const [moreShouldBeVisible, setMoreShouldBeVisible] = useState(true);
		const minCharsToDisplayMore = 215;
        useEffect(() => {
            if (description.length < minCharsToDisplayMore) setMoreShouldBeVisible(false);
        }, [])

        const DescriptionText = styled(ReelayText.Body1)`
            color: white;
			opacity: 1;
        `
        const MoreButton = styled(Pressable)`
            margin-top: -3px;
        `
        const MoreText = styled(ReelayText.Subtitle1Emphasized)`
            color: ${ReelayColors.reelayBlue};
        `

        return (
			<Text>
				<DescriptionText>
					{descriptionIsCut
						? description.length >= minCharsToDisplayMore
							? description.substring(0, minCharsToDisplayMore) + "...  "
							: description + "  "
						: description + "  "}
				</DescriptionText>
				{moreShouldBeVisible && (
					<MoreButton onPress={() => setDescriptionIsCut(!descriptionIsCut)}>
						<MoreText>{descriptionIsCut ? "See More" : "See Less"}</MoreText>
					</MoreButton>
				)}
			</Text>
		);
    }

    const BadgeWrapper = styled(View)`
        align-self: flex-start;
    `

    const ActorBadgesContainer = styled(View)`
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    `
	const RatingContainer = styled(View)`
		display: flex;
		flex-direction: row;
		align-items: flex-start;
	`

	const RatingImage = styled(Image)`
		width: 58px;
		height: 36px;
	`
	let ratingSources = {
		"PG-13": PG13Rating,
		"G": GRating,
		"PG": PGRating,
		"R": RRating,
		"NC-17": NC17Rating
	}
	



    return (
		<MIExternalContainer>
			<MIInternalContainer>
				{description?.length > 0 && (
					<>
						<HeadingText>Description</HeadingText>
						<Spacer height={10} />
						<DescriptionCollapsible description={description} />
						<Spacer height={20} />
					</>
				)}
				{director && (
					<>
						<HeadingText>Director</HeadingText>
						<BadgeWrapper>
							<DirectorBadge text={director} />
						</BadgeWrapper>
						<Spacer height={20} />
					</>
				)}
				{actors?.length > 0 && (
					<>
						<HeadingText>Cast</HeadingText>
						<ActorBadgesContainer>
							{actors.map((e) => (
								<BadgeWrapper key={e.name}>
									<ActorBadge
										text={e.name}
										photoURL={
											e.profile_path
												? `${tmdbImageApiBaseUrl}${e.profile_path}`
												: null
										}
									/>
								</BadgeWrapper>
							))}
						</ActorBadgesContainer>
						<Spacer height={20} />
					</>
				)}
				{rating && Object.keys(ratingSources).includes(rating) && (
					<>
						<HeadingText>Rated</HeadingText>
						<Spacer height={10} />
						<RatingContainer>
							<RatingImage source={ratingSources[rating]} />
						</RatingContainer>
					</>
				)}
				{!rating && !(Object.keys(ratingSources).includes(rating)) && !(actors?.length > 0) && !director && !(description?.length > 0) && (
					<HeadingText>No Information Found</HeadingText>
				)}
			</MIInternalContainer>
		</MIExternalContainer>
	);
}

/** 
 * const PlusReelayThumbnail = () => {
			const Container = styled(View)`
				margin: 4px;
				height: 122px;
				width: 82px;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
			`;
			const PlusIconContainer = styled(View)`
				width: 65px;
				height: 65px;
			`;
			const advanceToCreateReelay = async () => {
				navigation.getParent().push("VenueSelectScreen", {
					titleObj: titleObj,
				});
			};

			return (
				<Container>
					<PlusIconContainer>
						<RedPlusButton onPress={advanceToCreateReelay} />
					</PlusIconContainer>
				</Container>
			);
		};
*/