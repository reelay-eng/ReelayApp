import React, { useContext, useEffect } from 'react';
import { 
    Dimensions, 
    Pressable, 
    SafeAreaView, 
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

import BackButton from '../../components/utils/BackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddToClubsButton from '../../components/clubs/AddToClubsButton';
import SeenOn from '../../components/titlePage/SeenOn';

const BottomBackButtonContainer = styled(View)`
	align-items: center;
	background-color: #1a1a1a;
	border-radius: 24px;
	justify-content: center;
	margin-left: 16px;
	margin-top: 16px;
	height: 48px;
	width: 48px;
`
const HeaderContainer = styled(View)`
	align-items: center;
	flex-direction: row;
	justify-content: space-between;
	padding: 16px;
	position: absolute;
	top: ${props => props.topOffset}px;
	width: 100%;
`
const ScrollBox = styled(ScrollView)`
	position: absolute;
	width: 100%;
	height: 100%;
	background-color: #0d0d0d;
`
const Spacer = styled(View)`
	height: ${(props) => props.height}px;
`

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
	const titleType = (isMovie ? "film" : "tv");

	// hide tab bar
	const justShowMeSignupVisible = useSelector(state => state.justShowMeSignupVisible);
	const dispatch = useDispatch();
	const headerTopOffset = useSafeAreaInsets().top - 10;
	
	useFocusEffect(() => {
		dispatch({ type: 'setTabBarVisible', payload: false });
	});

	const Header = () => {
		return (
			<HeaderContainer topOffset={headerTopOffset}>
				<BackButton navigation={navigation} />
				<AddToClubsButton titleObj={titleObj} />
			</HeaderContainer>
		);
	}

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
			<Header />
			<PopularReelaysRow navigation={navigation} titleObj={titleObj} />
			<SeenOn tmdbTitleID={tmdbTitleID} titleType={titleType} />
			<MovieInformation director={director} actors={actors} description={overview} rating={rating} />
			<Spacer height={20} />
			<BottomBackButton navigation={navigation} />
			<Spacer height={100} />
			{ justShowMeSignupVisible && <JustShowMeSignupDrawer navigation={navigation} /> }
		</ScrollBox>
	);
};

const BottomBackButton = ({ navigation }) => {
	return (
		<BottomBackButtonContainer>
			<Pressable onPress={() => navigation.goBack()}>
				<Icon type="ionicon" name={"arrow-back-outline"} color={"white"} size={25} />
			</Pressable>
		</BottomBackButtonContainer>
	);
}