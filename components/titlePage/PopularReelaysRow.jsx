import React, { useContext, useEffect, useState, useRef } from 'react';
import { 
    ActivityIndicator, 
    Image,
    Pressable, 
    ScrollView, 
    View,
} from 'react-native';

// API
import { getMostRecentReelaysByTitle } from "../../api/ReelayDBApi";

// Styling
import styled from 'styled-components/native';
import { LinearGradient } from "expo-linear-gradient";

// Components
import * as ReelayText from "../../components/global/Text";
import { BWButton } from "../../components/global/Buttons";
import * as VideoThumbnails from "expo-video-thumbnails";

// Context
import { AuthContext } from '../../context/AuthContext';

// Media
import SplashImage from "../../assets/images/reelay-splash.png";

// Logging
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

export default PopularReelaysRow = ({ navigation, titleObj }) => {
    const { cognitoUser } = useContext(AuthContext);
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
		logAmplitudeEventProd('openTitleFeed', {
			username: cognitoUser?.username,
			title: titleObj?.title?.display,
			source: 'titlePage',
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
