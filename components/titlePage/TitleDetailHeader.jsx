import React, { useContext } from 'react';
import { Dimensions, Image, SafeAreaView, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

// Styling
import ReelayColors from "../../constants/ReelayColors";
import styled from 'styled-components/native';
import { LinearGradient } from "expo-linear-gradient";

// Components
import * as ReelayText from "../../components/global/Text";
import { ActionButton } from "../../components/global/Buttons";
import { Icon } from "react-native-elements";

// Logging
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

// Screen Orientation
import { getRuntimeString } from '../../components/utils/TitleRuntime';
import { useDispatch } from 'react-redux';
import { changeSize } from '../../api/TMDbApi';

const { height, width } = Dimensions.get('window');

const PosterGradient = styled(LinearGradient)`
    height: ${height * 0.55}px;
    top: ${-0.05 * height}px;
    position: absolute;
    width: 100%;
`
const GradientView = styled(View)`
	width: 100%;
	height: 100%;
	flex: 1;
`
const InfoBarView = styled(View)`
	align-items: center;
	flex-direction: row;
	justify-content: space-between;
	display: flex;
`
const PosterView = styled(View)`
    height: ${height * 0.5}px;
    width: 100%;
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
const PosterInfoView = styled(View)`
	position: absolute;
	align-self: center;
	bottom: 0px;
    padding-left: 16px;
	width: 100%;
`
const PosterTitleView = styled(View)`
	justify-content: flex-end;
	flex: 1;
`
const PosterTitle = styled(ReelayText.H4Bold)`
	color: white;
`
const TaglineView = styled(View)`
	width: 90%;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	margin-bottom: 15px;
	margin-top: 5px;
`
const TaglineTextView = styled(View)`
	display: flex;
	align-items: center;
	justify-content: center;
`
const TaglineText = styled(ReelayText.Body1)`
	color: #ffffff;
	opacity: 0.6;
`
const TrailerButtonView = styled(View)`
	width: 100%;
	height: 40px;
`

export default TitleDetailHeader = ({ navigation, titleObj }) => {
	const { reelayDBUser } = useContext(AuthContext);
    const posterSource = changeSize(titleObj.posterSource, 'w500');
    const title = titleObj?.display;
    const tmdbTitleID = titleObj?.id;
	const trailerURI = titleObj?.trailerURI;
	const genres = titleObj?.genres;
	const releaseYear = titleObj?.releaseYear;
	const runtime = titleObj?.runtime;
	const isSeries = titleObj?.isSeries;

	const dispatch = useDispatch();
	
	const PosterWithOverlay = () => {
		return (
			<View style={{height: "100%", width: "100%"}}>
				<PosterImage source={posterSource} />
				<PosterOverlay color={ReelayColors.reelayBlack} opacity={0.2} />
                <PosterGradient colors={['transparent', 'black']} />
				{/* <GradientView>
					<LinearGradient
						colors={["transparent", ReelayColors.reelayBlack]}
						style={{
							opacity: 1,
							width: '100%', 
							height: '100%'
						}}
					/>
				</GradientView> */}
			</View>
		);
	};

	const PosterTagline = () => {
		// Quick fix in order to fit runtime and release year
		const ReducedGenres = genres?.slice(0, 2);

		//Conversion from minutes to hours and minutes
		const runtimeString = getRuntimeString(runtime);

		return (
			<TaglineView>
				<TaglineTextView>
					<TaglineText>{ReducedGenres?.map((e) => e.name).join(", ")}    {releaseYear}    {isSeries ? null : runtimeString} </TaglineText>
				</TaglineTextView>
			</TaglineView>
		);
	};

	const showMeSignupIfGuest = () => {
		if (reelayDBUser?.username === 'be_our_guest') {
			dispatch({ type: 'setJustShowMeSignupVisible', payload: true })
			return true;
		}
		return false;
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

    const WatchTrailerButton = () => {
		const watchTrailerIcon = <Icon color={"white"} type="ionicon" name="play-circle-outline" size={20} />;
		return (
			<TrailerButtonView>
				<ActionButton
					color='green'
					text={"Watch Trailer"}
					leftIcon={watchTrailerIcon}
					onPress={advanceToWatchTrailer}
					borderRadius={"20px"}
				/>
			</TrailerButtonView>
		);
	}

	return (
		<PosterView>
			<PosterWithOverlay />
			<PosterInfoView>
				<InfoBarView>
					<PosterTitleView>
						<PosterTitle>{title}</PosterTitle>
						<PosterTagline />
					</PosterTitleView>
				</InfoBarView>
			</PosterInfoView>
		</PosterView>
	);
};
