import React, { Fragment, memo, useContext, useState } from "react";
import { Dimensions, Pressable, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import Constants from 'expo-constants';

import AddToWatchlistButton from "../watchlist/AddToWatchlistButton";
import DonateButton from '../global/DonateButton';
import ReelayColors from "../../constants/ReelayColors";
import * as ReelayText from '../global/Text';
import TitlePoster from "../global/TitlePoster";
import VenueIcon from '../utils/VenueIcon';

import { logAmplitudeEventProd } from "../utils/EventLogger";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronDown, faChevronUp, faClapperboard, faStar } from "@fortawesome/free-solid-svg-icons";
import { getRuntimeString } from "../utils/TitleRuntime";
import { animate } from "../../hooks/animations";
import styled from 'styled-components/native';

import { BlurView } from 'expo-blur'

const { height, width } = Dimensions.get('window');

// a collapsed (!expanded) banner is 100px in height
// the add to stack button is 45px
const AddToWatchlistButtonContainer = styled(View)`
    justify-content: center;
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
const ExpandArrowView = styled(Pressable)`
    align-items: center;
    padding-bottom: 6px;
    position: ${props => props.expanded ? 'relative' : 'absolute'};
    bottom: 0px;
    width: 100%;
`
const ExpandedInfoView = styled(Pressable)`
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    margin: 6px;
    margin-top: 0px;
    width: ${width - 32}px;
`
const OverviewText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    padding: 8px;
`
const RuntimeText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    text-align: center;
`
const RuntimeView = styled(View)`
    background-color: rgba(10, 10, 10, 0.7);
    border-radius: 8px;
    padding: 4px 8px 4px 8px; 
    position: absolute;
    right: 2px;
    top: 10px;
`
const SeeMorePressable = styled(TouchableOpacity)`
    padding: 0px 8px 0px 8px;
`
const SeeMoreText = styled(ReelayText.H5Bold)`
    color: ${ReelayColors.reelayBlue};
    font-size: 14px;
    line-height: 16px;
    text-shadow-color: rgba(0, 0, 0, 0.4);
    text-shadow-offset: 0px 1px;
    text-shadow-radius: 1px;
`
const TitleBannerRow = styled(Pressable)`
    flex-direction: row;
    justify-content: space-between;
`
const TitleBannerBackground = styled(View)`
    align-items: center;
    border-radius: 8px;
    margin-left: 10px;
    top: 20px;
    width: ${width - 20}px;
    zIndex: 3;
    overflow: hidden;
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
    padding: 5px;
`
const TitleText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    text-shadow-color: rgba(0, 0, 0, 0.5);
    text-shadow-offset: 1px 1px;
    text-shadow-radius: 1px;
`
const TitleTextContainer = styled(View)`
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
    margin-right: 10px;
`
const YearVenueContainer = styled(View)`
    align-items: center;
    flex-direction: row;
`

const TitleBanner = ({ 
    club = null,
    donateObj=null, 
    navigation=null, 
    onCameraScreen=false,
    titleObj,
    reelay=null, 
    venue=null,
}) => {
    const { reelayDBUser } = useContext(AuthContext);
    const [expanded, setExpanded] = useState(false);
    const topOffset = useSafeAreaInsets().top;
    const welcomeReelaySub = Constants.manifest.extra.welcomeReelaySub;
    const howtoReelaySub = Constants.manifest.extra.howtoReelaySub;
    const isWelcomeReelay = reelay && (welcomeReelaySub === reelay?.sub);
    const isHowtoReelay = reelay && (howtoReelaySub === reelay?.creator?.sub);

    // figure out how to do ellipses for displayTitle
    let displayTitle = (titleObj?.display) ? titleObj?.display : 'Title not found'; 
	let displayYear = (titleObj.releaseYear) ? titleObj.releaseYear : '';
    const runtime = titleObj?.runtime;
    const runtimeString = runtime ? getRuntimeString(runtime) : '';

    if (isWelcomeReelay) {
        displayTitle = 'Welcome to Reelay';
        displayYear = '2023';
    }

    if (isHowtoReelay) {
        displayTitle = 'Reelay';
        displayYear = '2023';
    }

    const onClickExpand = () => {
        animate(200);
        setExpanded(!expanded);
    }
    
    const openTitleDetail = async () => {
        if (!titleObj || !navigation) return;
        navigation.push('TitleDetailScreen', { titleObj });

        logAmplitudeEventProd('openTitleScreen', {
            reelayID: reelay?.id,
            reelayTitle: titleObj?.display,
            username: reelayDBUser?.username,
            source: 'poster',
        });
    }

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

    const ExpandArrow = () => {
        return (
            <ExpandArrowView expanded={expanded} onPress={onClickExpand}>
                <FontAwesomeIcon icon={expanded ?  faChevronUp : faChevronDown} color='white' size={16} />
            </ExpandArrowView>
        );
    }

    const ExpandedInfo = () => {
        return (
            <Pressable onPress={onClickExpand}>
                <ExpandedInfoView>
                    <DirectorLine directorName={titleObj?.director?.name} />
                    <ActorLine actorName0={titleObj?.displayActors[0]?.name} actorName1={titleObj?.displayActors[1]?.name} />
                    <OverviewText>{titleObj?.overview}</OverviewText>
                    <SeeMoreButton />
                    <RuntimePill />
                </ExpandedInfoView>
            </Pressable>
        );
    }

    const Poster = () => {
        return (
            <TitlePosterContainer>
                <TitlePoster title={titleObj} onPress={openTitleDetail} width={60} />
            </TitlePosterContainer>
        );
    }

    const RuntimePill = () => {
        if (runtimeString.length > 0) {
            return (
                <RuntimeView>
                    <RuntimeText>{runtimeString}</RuntimeText>
                </RuntimeView>
            )
        } else {
            return <></>
        }
    }

    const SeeMoreButton = () => {
        return (
            <SeeMorePressable onPress={openTitleDetail}>
                <SeeMoreText>{'See more...'}</SeeMoreText>
            </SeeMorePressable>
        );
    }

    const TitleInfo = () => {
        return (
            <TitleInfoPressable onPress={onClickExpand}>
                <TitleTextContainer>
                    <TitleText numberOfLines={2} ellipsizeMode={"tail"}>
                        {displayTitle}
                    </TitleText>
                </TitleTextContainer>
                <TitleUnderline 
                    displayYear={displayYear} 
                    expanded={expanded}
                    runtime={titleObj?.runtime}
                    venue={reelay?.content?.venue ?? venue} 
                />
                { !expanded && <ExpandArrow /> }
            </TitleInfoPressable>
        );
    }

    const AddToWatchlist = () => {
        if (donateObj) return <DonateButton donateObj={donateObj} reelay={reelay} />;

        return (
            <AddToWatchlistButtonContainer>
                <AddToWatchlistButton
                    club={club}
                    navigation={navigation}
                    reelay={reelay}
                    titleObj={reelay?.title}
                />
            </AddToWatchlistButtonContainer>
        );
    }
    
    const TitleUnderline = ({ venue }) => {
        return (
            <TitleUnderlineContainer>
                <YearVenueContainer>
                    { venue && <VenueIndicator venue={venue} /> }
                    { displayYear?.length > 0 && <YearText>{displayYear}</YearText> }
                </YearVenueContainer>
            </TitleUnderlineContainer>
        );
    };    

    const VenueIndicator = ({ venue }) => {
        return (
            <VenueContainer>
                <VenueIcon venue={venue} size={20} border={1} />
            </VenueContainer>
        )
    }

    return (
        <TitleBannerBackground>
            <BlurView intensity={25} tint='dark' style={{ alignItems: 'center', width: '100%'}}>
                <TitleBannerRow onPress={onClickExpand}>
                    <Poster />
                    <TitleInfo />
                    { !onCameraScreen && <AddToWatchlist /> }
                </TitleBannerRow>    
                { expanded && <ExpandedInfo /> }
                { expanded && <ExpandArrow /> }
            </BlurView>
        </TitleBannerBackground>
    );
}

const areEqual = (prevProps, nextProps) => {
    const titlesEqual = (prevProps.titleObj?.id === nextProps.titleObj?.id);
    const reelaysEqual = (prevProps?.reelay?.sub === nextProps?.reelay?.sub);
    return titlesEqual && reelaysEqual ;
}

export default memo(TitleBanner, areEqual);