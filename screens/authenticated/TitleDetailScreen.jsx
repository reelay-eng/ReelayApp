import React, { useContext, useEffect } from 'react';
import { 
    Dimensions, 
    Pressable, 
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
import * as Haptics from 'expo-haptics';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlay, faPlusCircle, faVideo } from '@fortawesome/free-solid-svg-icons';

const { width } = Dimensions.get('window');

const BackButtonCircleView = styled(View)`
	align-items: center;
	border-radius: 24px;
	justify-content: center;
	height: 24px;
`
const BackButtonPressable = styled(TouchableOpacity)`
	align-items: center;
	height: 100%;
	justify-content: center;
	margin-bottom: 2px;
	width: 100%;
`
const CreateReelayPressable = styled(TouchableOpacity)`
	align-items: center;
	background-color: ${ReelayColors.reelayBlue};
	border-radius: 26px;
	flex-direction: row;
	height: 52px;
	justify-content: center;
	margin: 16px;
	margin-top: 0px;
	width: ${width - 32}px;
`
const CreateReelayText = styled(ReelayText.CaptionEmphasized)`
	color: white;
	font-size: 16px;
	line-height: 20px;
	margin-left: 8px;
`
const HeaderText = styled(ReelayText.Body1)`
	color: white;
	display: flex;
	flex: 1;
	font-size: 18px;
	margin-top: 4px;
	padding-left: 8px;
	padding-right: 8px;
	text-align: center;
`
const HeaderView = styled(View)`
	align-items: center;
	background-color: black;
	flex-direction: row;
	justify-content: space-between;
	padding: 12px;
	padding-top: ${props => props.topOffset + 16}px;
	padding-bottom: 8px;
	width: 100%;
	z-index: 100;
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
	const fromWatchlist = route.params?.fromWatchlist ?? false;

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
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
				<FontAwesomeIcon icon={faVideo} color='white' size={24} />
				<CreateReelayText>{'Create reelay'}</CreateReelayText>
			</CreateReelayPressable>
		)
	}

	const NavHeader = () => {
		const myWatchlistItems = useSelector(state => state.myWatchlistItems);
		const myWatchlistRecs = useSelector(state => state.myWatchlistRecs);
		const goBack = () => {
			if (fromWatchlist) {
				navigation.navigate('WatchlistScreen', {
					myWatchlistItems,
					myWatchlistRecs,
				})
			} else {
				navigation.goBack();
			}
		}


		return (
			<HeaderView topOffset={headerTopOffset}>
				<BackButtonCircleView>
					<BackButtonPressable onPress={() => goBack()} hitSlop={10}>
						<Icon type="ionicon" name={"arrow-back-outline"} color={"white"} size={24} />
					</BackButtonPressable>
				</BackButtonCircleView>
				<HeaderText numberOfLines={1}>{titleObj?.display}</HeaderText>
				<AddToWatchlistButton 
					buttonSize={32}
					iconSize={18}
					navigation={navigation} 
					shouldGoToWatchlist={true} 
					titleObj={titleObj} 
				/>
			</HeaderView>
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
				<FontAwesomeIcon icon={faPlay} color='white' size={16} />
				<CreateReelayText>{'Watch trailer'}</CreateReelayText>
			</WatchTrailerPressable>
		)
	}

	return (
		<ScrollBox showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]} >
			<NavHeader />
			<TitleDetailHeader navigation={navigation} titleObj={titleObj} />
			<TitleReactions navigation={navigation} titleObj={titleObj} />
			<CreateReelayButton />
			{/* <WatchTrailerButton /> */}
			<MovieInformation titleObj={titleObj} />
			<Spacer height={20} />
			<PopularReelaysRow navigation={navigation} titleObj={titleObj} />
			<WatchNow tmdbTitleID={tmdbTitleID} titleType={titleType} />
			<Spacer height={100} />
			{ justShowMeSignupVisible && <JustShowMeSignupDrawer navigation={navigation} /> }
		</ScrollBox>
	);
};
