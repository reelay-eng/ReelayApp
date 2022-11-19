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
import MovieInformation from '../../components/titlePage/MovieInformation';
import PopularReelaysRow from '../../components/titlePage/PopularReelaysRow';
import PosterWithTrailer from '../../components/titlePage/PosterWithTrailer';
import JustShowMeSignupDrawer from '../../components/global/JustShowMeSignupDrawer';
import { changeSize } from '../../api/TMDbApi';

import BackButton from '../../components/utils/BackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddToWatchlistButton from '../../components/watchlist/AddToWatchlistButton';
import SeenOn from '../../components/titlePage/SeenOn';
import TitleDetailHeader from '../../components/titlePage/TitleDetailHeader';
import TitleReactions from '../../components/titlePage/TitleReactions';

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
	background-color: black;
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
	const rating = titleObj?.rating;
	const isSeries = titleObj?.isSeries;
	const titleType = (isSeries) ? "tv" : "film";

	// hide tab bar
	const justShowMeSignupVisible = useSelector(state => state.justShowMeSignupVisible);
	const dispatch = useDispatch();
	const headerTopOffset = useSafeAreaInsets().top - 10;
	
	useFocusEffect(() => {
		dispatch({ type: 'setTabBarVisible', payload: false });
	});

	const NavHeader = () => {
		return (
			<HeaderContainer topOffset={headerTopOffset}>
				<BackButton navigation={navigation} />
				<AddToWatchlistButton navigation={navigation} titleObj={titleObj} />
			</HeaderContainer>
		);
	}

	return (
		<ScrollBox showsVerticalScrollIndicator={false}>
			<TitleDetailHeader navigation={navigation} titleObj={titleObj} />
			<NavHeader />
			<TitleReactions navigation={navigation} titleObj={titleObj} />
			<MovieInformation director={director} actors={actors} description={overview} rating={rating} />
			<Spacer height={20} />
			<PopularReelaysRow navigation={navigation} titleObj={titleObj} />
			<SeenOn tmdbTitleID={tmdbTitleID} titleType={titleType} />
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