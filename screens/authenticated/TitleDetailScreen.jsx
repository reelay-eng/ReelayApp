import React, { useContext, useEffect } from 'react';
import { 
    Dimensions, 
    Pressable, 
    ScrollView, 
    View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from "react-redux";

// Styling
import styled from 'styled-components/native';

// Components
import { Icon } from "react-native-elements";
import AppleTVAd from '../../components/titlePage/AppleTVAd';
import MovieInformation from '../../components/titlePage/MovieInformation';
import PopularReelaysRow from '../../components/titlePage/PopularReelaysRow';
import PosterWithTrailer from '../../components/titlePage/PosterWithTrailer';
import JustShowMeSignupDrawer from '../../components/global/JustShowMeSignupDrawer';
import { changeSize } from '../../api/TMDbApi';

const Spacer = styled(View)`
	height: ${(props) => props.height}px;
`;

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
	const releaseYear = titleObj?.releaseYear;
	const runtime = titleObj?.runtime;
	const isMovie = titleObj?.isMovie;

	// hide tab bar
	const justShowMeSignupVisible = useSelector(state => state.justShowMeSignupVisible);
	const dispatch = useDispatch();
	useFocusEffect(React.useCallback(() => {
		dispatch({ type: 'setTabBarVisible', payload: false });
        return () => {
			dispatch({ type: 'setTabBarVisible', payload: true });
		}
    }));
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
				posterSource={changeSize(titleObj.posterSource, 'w500')}
				title={titleObj?.display}
				titleObj={titleObj}
				tmdbTitleID={tmdbTitleID}
				trailerURI={trailerURI}
				genres={genres}
				releaseYear={releaseYear}
				runtime={runtime}
				isMovie={isMovie}
			/>
			<PopularReelaysRow navigation={navigation} titleObj={titleObj} />
			<MovieInformation director={director} actors={actors} description={overview} rating={rating} />
			<Spacer height={20} />
			{/* <AppleTVAd /> */}
			<BottomBackButton navigation={navigation} />
			<Spacer height={100} />
			{ justShowMeSignupVisible && <JustShowMeSignupDrawer navigation={navigation} /> }
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