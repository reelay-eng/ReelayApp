import React, { Fragment, memo, useContext, useState } from "react";
import { Dimensions, Pressable, SafeAreaView, TouchableOpacity, View } from "react-native";
import * as ReelayText from '../global/Text';
import { AuthContext } from "../../context/AuthContext";
import Constants from 'expo-constants';

import VenueIcon from '../utils/VenueIcon';
import DonateButton from '../global/DonateButton';

import { logAmplitudeEventProd } from "../utils/EventLogger";
import styled from 'styled-components/native';
import TitlePoster from "../global/TitlePoster";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddToStackButton from "./AddToStackButton";
import { Icon } from "react-native-elements";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronDown, faClapperboard, faPlay, faStar } from "@fortawesome/free-solid-svg-icons";
import { getRuntimeString } from "../utils/TitleRuntime";

const { height, width } = Dimensions.get('window');

// a collapsed (!expanded) banner is 100px in height
// the add to stack button is 45px
const AddToStackButtonContainer = styled(View)`
    top: 27.5px;
`
const ArtistBadgeView = styled(View)`
    align-items: center;
    background-color: rgba(255,255,255,0.25);
    border-radius: 8px;
    justify-content: center;
    margin-left: 8px;
    padding: 8px;
    display: flex;
    flex-direction: row;
`
const ArtistRow = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-left: 8px;
    padding-top: 8px;
`
const ArtistText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
`
const AllArtistsView = styled(Pressable)`
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    padding: 12px;
    padding-top: 0px;
    width: 100%;
`
const ExpandableView = styled(View)`
    align-items: center;
    justify-content: center;
    margin-top: 8px;
    width: 100%;
`
const OverviewSpacer = styled(View)`
    height: 8px;
`
const OverviewText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    padding: 8px;
`
const RuntimeText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
    margin-left: 12px;
`
const TitleBannerRow = styled(View)`
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
`
const TitleBannerBackground = styled(Pressable)`
    background-color: ${props => props.color};
    border-radius: 8px;
    margin-left: 10px;
    top: 20px;
    width: ${width - 20}px;
    zIndex: 3;
`
const TitleInfo = styled(Pressable)`
    align-items: flex-start;
    justify-content: center;
    font-size: 18px;
    display: flex;
    flex: 1;
    padding: 5px;
`
const TitlePosterContainer = styled(View)`
    justify-content: center;
    margin: 5px;
`
const TitleText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
`
const TitleTextContainer = styled(View)`
    margin-top: 10px;
    justify-content: center;
    display: flex;
`
const TitleUnderlineContainer = styled(View)`
    margin-top: 5px;
    margin-right: 8px;
    width: 100%;
`
const VenueContainer = styled(View)`
    margin-right: 5px;
`
const WatchTrailerPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: rgba(4, 189, 108, 0.5);
    border-radius: 8px;
    justify-content: center;
    margin-left: 8px;
    margin-right: 8px;
    padding: 8px;
    display: flex;
    flex-direction: row;
    width: 125px;
`
const YearText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
`
const YearVenueContainer = styled(View)`
    align-items: center;
    flex-direction: row;
`

const DEFAULT_BGCOLOR = 'rgba(0, 0, 0, 0.36)';

const ActorLine = ({ actorName }) => {
    if (!actorName) return <View />;
    return (
        <ArtistRow>
            <FontAwesomeIcon icon={faStar} color='white' size={18} />
            <ArtistBadgeView>
                <ArtistText>{actorName}</ArtistText>
            </ArtistBadgeView>
        </ArtistRow>
    );
}

const DirectorLine = ({ directorName }) => {
    if (!directorName) return <View />;
    return (
        <ArtistRow>
            <FontAwesomeIcon icon={faClapperboard} color='white' size={18} />
            <ArtistBadgeView>
                <ArtistText>{directorName}</ArtistText>
            </ArtistBadgeView>
        </ArtistRow>
    );
}

const WatchTrailerButton = ({ navigation, title }) => {
    if (!title?.trailerURI) return <View />;
    
    const advanceToWatchTrailer = () => {
        navigation.push("TitleTrailerScreen", {
			trailerURI: title?.trailerURI,
		});
		logAmplitudeEventProd("watchTrailer", {
			title: title?.display,
			source: "poster",
		});
    }

    return (
        <ArtistRow>
            <FontAwesomeIcon icon={faPlay} color='white' size={18} />
            <WatchTrailerPressable onPress={advanceToWatchTrailer}>
                <ArtistText>{'Watch Trailer'}</ArtistText>
            </WatchTrailerPressable>
        </ArtistRow>
    );
}

const venuesEqual = (prevProps, nextProps) => {
    return prevProps.venue === nextProps.venue;
}

const TitleUnderline = memo(({ venue, displayYear, runtime }) => {
    const runtimeString = runtime ? getRuntimeString(runtime) : '';
    return (
        <TitleUnderlineContainer>
            <YearVenueContainer>
                { venue && 
                    <VenueContainer>
                        <VenueIcon venue={venue} size={20} border={1} />
                    </VenueContainer>
                }
                { displayYear?.length > 0 && <YearText>{displayYear}</YearText> }
                <RuntimeText>{runtimeString}</RuntimeText>
            </YearVenueContainer>
        </TitleUnderlineContainer>
    );
}, venuesEqual);

const TitleBanner = ({ 
    club = null,
    titleObj,
    backgroundColor=DEFAULT_BGCOLOR,
    donateObj=null, 
    navigation=null, 
    onPress=null,
    posterWidth=60,
    topic=null,
    reelay=null, 
}) => {
    const { reelayDBUser } = useContext(AuthContext);
    const [expanded, setExpanded] = useState(false);
    const topOffset = useSafeAreaInsets().top;
    const welcomeReelaySub = Constants.manifest.extra.welcomeReelaySub;
    const isWelcomeReelay = reelay && (welcomeReelaySub === reelay?.sub);
    
    // figure out how to do ellipses for displayTitle
    let displayTitle = (titleObj.display) ? titleObj.display : 'Title not found'; 
	let displayYear = (titleObj.releaseYear) ? titleObj.releaseYear : '';

    if (isWelcomeReelay) {
        displayTitle = 'Welcome to Reelay';
        displayYear = '2022';
    }
    
    const openTitleDetail = async () => {
        if (!titleObj) {
            return;
        }
        navigation.push('TitleDetailScreen', { titleObj });

        logAmplitudeEventProd('openTitleScreen', {
            reelayID: reelay?.id,
            reelayTitle: titleObj?.display,
            username: reelayDBUser?.username,
            source: 'poster',
        });
    }

    const ExpandableInfo = () => {
        if (!expanded) {
            return (
                <ExpandableView>
                    <FontAwesomeIcon icon={faChevronDown} color='white' size={16} />
                </ExpandableView>
            );
        } else {
            return <View />
        }
    }

    return (
        <TitleBannerBackground color={backgroundColor} onPress={onPress ?? openTitleDetail}>
            <TitleBannerRow>
                <TitlePosterContainer>
                    <TitlePoster title={titleObj} onPress={openTitleDetail} width={posterWidth} />
                </TitlePosterContainer>
                <TitleInfo onPress={() => setExpanded(!expanded)}>
                    <TitleTextContainer>
                        <TitleText numberOfLines={2} ellipsizeMode={"tail"}>
                            {displayTitle}
                        </TitleText>
                    </TitleTextContainer>
                    <TitleUnderline 
                        displayYear={displayYear} 
                        runtime={titleObj?.runtime}
                        venue={reelay?.content?.venue} 
                    />
                    <ExpandableInfo />
                </TitleInfo>
                { !donateObj && (
                    <AddToStackButtonContainer>
                        <AddToStackButton 
                            navigation={navigation} 
                            reelay={reelay} 
                            club={club}
                            topic={topic}
                        />
                    </AddToStackButtonContainer>
                )}
                { donateObj && <DonateButton donateObj={donateObj} reelay={reelay} /> }
            </TitleBannerRow>    
            { expanded && (
                <AllArtistsView onPress={() => setExpanded(false)}>
                    <OverviewText>{titleObj?.overview}</OverviewText>
                    <ActorLine actorName={titleObj?.displayActors[0]?.name} />
                    <ActorLine actorName={titleObj?.displayActors[1]?.name} />
                    <DirectorLine directorName={titleObj?.director?.name} />
                    <WatchTrailerButton navigation={navigation} title={titleObj} />
                </AllArtistsView>
            )}
        </TitleBannerBackground>
    );
}

const areEqual = (prevProps, nextProps) => {
    const titlesEqual = (prevProps.titleObj?.id === nextProps.titleObj?.id);
    const reelaysEqual = (prevProps?.reelay?.sub === nextProps?.reelay?.sub);
    return titlesEqual && reelaysEqual;
}

export default memo(TitleBanner, areEqual);