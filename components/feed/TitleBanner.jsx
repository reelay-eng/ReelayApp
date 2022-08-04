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
import { faChevronDown, faChevronUp, faClapperboard, faPlay, faStar } from "@fortawesome/free-solid-svg-icons";
import { getRuntimeString } from "../utils/TitleRuntime";
import { LinearGradient } from 'expo-linear-gradient';
import ReelayColors from "../../constants/ReelayColors";

const { height, width } = Dimensions.get('window');

// a collapsed (!expanded) banner is 100px in height
// the add to stack button is 45px
const AddToStackButtonContainer = styled(View)`
    top: 27.5px;
`
const ArtistBadgeView = styled(View)`
    align-items: center;
    border-radius: 8px;
    justify-content: center;
    margin-right: 8px;
    padding: 4px;
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
const ExpandedGradient = styled(LinearGradient)`
    border-radius: 8px;
    height: 100%;
    position: absolute;
    width: 100%;
`
const ExpandedInfoView = styled(Pressable)`
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    margin: 6px;
    margin-top: 0px;
    padding: 12px;
    padding-top: 0px;
    width: ${width - 32}px;
`
const ExpandableView = styled(View)`
    align-items: center;
    justify-content: center;
    margin-top: 8px;
    width: 100%;
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
const SeeMorePressable = styled(TouchableOpacity)`
    padding-left: 8px;
`
const SeeMoreText = styled(ReelayText.CaptionEmphasized)`
    color: ${ReelayColors.reelayBlue};
    font-size: 14px;
    line-height: 16px;
`
const TitleBannerRow = styled(Pressable)`
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
`
const TitleBannerBackground = styled(View)`
    align-items: center;
    background-color: ${props => props.color};
    border-radius: 8px;
    margin-left: 10px;
    top: 20px;
    width: ${width - 20}px;
    zIndex: 3;
`
const TitleInfoPressable = styled(Pressable)`
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
const YearText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
`
const YearVenueContainer = styled(View)`
    align-items: center;
    flex-direction: row;
`

const DEFAULT_BGCOLOR = 'rgba(0, 0, 0, 0.36)';

const ActorLine = ({ actorName0, actorName1 }) => {
    if (!actorName0) return <View />;
    return (
        <ArtistRow>
            <FontAwesomeIcon icon={faStar} color='white' size={18} />
            <ArtistBadgeView>
                <ArtistText>{actorName0}</ArtistText>
            </ArtistBadgeView>
            { actorName1 && (
                <Fragment>
                    <FontAwesomeIcon icon={faStar} color='white' size={18} />
                    <ArtistBadgeView>
                        <ArtistText>{actorName1}</ArtistText>
                    </ArtistBadgeView>
                </Fragment>
            )}
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
        return (
            <ExpandableView>
                <FontAwesomeIcon icon={expanded ?  faChevronUp : faChevronDown} color='white' size={16} />
            </ExpandableView>
        );
    }

    const ExpandedInfo = () => {
        return (
            <Pressable onPress={() => setExpanded(false)}>
                <ExpandedGradient 
                    colors={['transparent', '#000000']} 
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 2 }}
                />
                <ExpandedInfoView>
                    <DirectorLine directorName={titleObj?.director?.name} />
                    <ActorLine actorName0={titleObj?.displayActors[0]?.name} actorName1={titleObj?.displayActors[1]?.name} />
                    <OverviewText>{titleObj?.overview}</OverviewText>
                    <SeeMoreButton />
                </ExpandedInfoView>
            </Pressable>
        );
    }

    const Poster = () => {
        return (
            <TitlePosterContainer>
                <TitlePoster title={titleObj} onPress={openTitleDetail} width={posterWidth} />
            </TitlePosterContainer>
        );
    }

    const SeeMoreButton = () => {
        return (
            <SeeMorePressable onPress={openTitleDetail}>
                <SeeMoreText>{'See more'}</SeeMoreText>
            </SeeMorePressable>
        );
    }

    const TitleInfo = () => {
        return (
            <TitleInfoPressable onPress={() => setExpanded(!expanded)}>
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
            </TitleInfoPressable>
        );
    }

    const RightCTAButton = () => {
        if (donateObj) return <DonateButton donateObj={donateObj} reelay={reelay} />;

        return (
            <AddToStackButtonContainer>
                <AddToStackButton 
                    navigation={navigation} 
                    reelay={reelay} 
                    club={club}
                    topic={topic}
                />
            </AddToStackButtonContainer>
        );
    }

    return (
        <TitleBannerBackground color={backgroundColor}>
            <TitleBannerRow onPress={() => setExpanded(!expanded)}>
                <Poster />
                <TitleInfo />
                <RightCTAButton />
            </TitleBannerRow>    
            { expanded && <ExpandedInfo /> }
        </TitleBannerBackground>
    );
}

const areEqual = (prevProps, nextProps) => {
    const titlesEqual = (prevProps.titleObj?.id === nextProps.titleObj?.id);
    const reelaysEqual = (prevProps?.reelay?.sub === nextProps?.reelay?.sub);
    return titlesEqual && reelaysEqual;
}

export default memo(TitleBanner, areEqual);