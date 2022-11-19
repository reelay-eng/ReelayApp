import React, { useContext, useEffect } from 'react';
import { 
    Dimensions, 
    Pressable, 
    SafeAreaView, 
    ScrollView, 
    TouchableOpacity, 
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
import JustShowMeSignupDrawer from '../../components/global/JustShowMeSignupDrawer';
import { changeSize } from '../../api/TMDbApi';

import BackButton from '../../components/utils/BackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddToWatchlistButton from '../../components/watchlist/AddToWatchlistButton';
import TitleDetailHeader from '../../components/titlePage/TitleDetailHeader';
import TitleReactions from '../../components/titlePage/TitleReactions';
import WatchNow from '../../components/titlePage/WatchNow';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../../components/global/Text';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

const { width } = Dimensions.get('window');

const BottomBackButtonContainer = styled(View)`
	align-items: center;
	background-color: #1a1a1a;
	border-radius: 24px;
	justify-content: center;
	margin-left: 16px;
	height: 48px;
	width: 48px;
`
const CreateReelayPressable = styled(TouchableOpacity)`
	align-items: center;
	background-color: ${ReelayColors.reelayBlue};
	border-radius: 20px;
	flex-direction: row;
	height: 40px;
	justify-content: center;
	margin: 16px;
	margin-top: 0px;
	width: ${width - 32}px;
`
const CreateReelayText = styled(ReelayText.CaptionEmphasized)`
	color: white;
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
const WatchTrailerPressable = styled(CreateReelayPressable)`
	background-color: ${ReelayColors.reelayGreen};
`

export default TitleDetailScreen = ({ navigation, route }) => {
	// Parse Title Object
	const { titleObj } = route.params;
	const tmdbTitleID = titleObj?.id;
	const isSeries = titleObj?.isSeries;
	const titleType = (isSeries) ? "tv" : "film";

	const { reelayDBUser } = useContext(AuthContext);
	const dispatch = useDispatch();
	const headerTopOffset = useSafeAreaInsets().top - 10;
	const justShowMeSignupVisible = useSelector(state => state.justShowMeSignupVisible);

	const showMeSignupIfGuest = () => {
		if (reelayDBUser?.username === 'be_our_guest') {
			dispatch({ type: 'setJustShowMeSignupVisible', payload: true })
			return true;
		}
		return false;
	}
	
	useFocusEffect(() => {
		dispatch({ type: 'setTabBarVisible', payload: false });
	});

	const CreateReelayButton = () => {
		const advanceToCreateReelay = () => {
			if (showMeSignupIfGuest()) return;
			navigation.push('VenueSelectScreen', { titleObj: titleObj });
			logAmplitudeEventProd('advanceToCreateReelay', {
				username: reelayDBUser?.username,
				title: titleObj?.title?.display,
				source: 'titlePage',
			});
		}
			
		return (
			<CreateReelayPressable onPress={advanceToCreateReelay}>
				<CreateReelayText>{'Create a reelay'}</CreateReelayText>
			</CreateReelayPressable>
		)
	}

	const NavHeader = () => {
		return (
			<HeaderContainer topOffset={headerTopOffset}>
				<BackButton navigation={navigation} />
				<AddToWatchlistButton navigation={navigation} titleObj={titleObj} />
			</HeaderContainer>
		);
	}

	const WatchTrailerButton = () => {
		const advanceToWatchTrailer = () => {
			navigation.push("TitleTrailerScreen", {
				trailerURI: titleObj?.trailerURI,
			});
			logAmplitudeEventProd("watchTrailer", {
				title: titleObj?.display,
				tmdbTitleID: tmdbTitleID,
				source: 'titlePage',
			});
		}
	
		return (
			<WatchTrailerPressable onPress={advanceToWatchTrailer}>
				<CreateReelayText>{'Watch trailer'}</CreateReelayText>
			</WatchTrailerPressable>
		)
	}

	return (
		<ScrollBox showsVerticalScrollIndicator={false}>
			<TitleDetailHeader navigation={navigation} titleObj={titleObj} />
			<NavHeader />
			<TitleReactions navigation={navigation} titleObj={titleObj} />
			<CreateReelayButton />
			<WatchTrailerButton />
			<MovieInformation titleObj={titleObj} />
			<Spacer height={20} />
			<PopularReelaysRow navigation={navigation} titleObj={titleObj} />
			<WatchNow tmdbTitleID={tmdbTitleID} titleType={titleType} />
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