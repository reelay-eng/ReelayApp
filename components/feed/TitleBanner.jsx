import React, { useContext } from "react";
import { Dimensions, Pressable, View } from "react-native";
import * as ReelayText from '../global/Text';
import { AuthContext } from "../../context/AuthContext";
import Constants from 'expo-constants';

import AddToClubsButton from "../clubs/AddToClubsButton";
import { VenueIcon } from '../utils/VenueIcon';
import DonateButton from '../global/DonateButton';

import { logAmplitudeEventProd } from "../utils/EventLogger";
import styled from 'styled-components/native';
import TitlePoster from "../global/TitlePoster";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native-gesture-handler";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faForwardStep, faBackwardStep } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";

const { height, width } = Dimensions.get('window');

const ForwardBackButton = styled(TouchableOpacity)`
    align-items: center;
    border-color: ${props => props.disabled ? 'gray' : 'white'};
    border-radius: 80px;
    border-width: 1px;
    justify-content: center;
    margin-left: 8px;
    margin-right: 8px;
    padding: 4px;
`
const ForwardBackContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-left: 8px;
`
const StackLengthText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
    font-size: 12px;
`
const TitleBannerContainer = styled(Pressable)`
    align-self: center;
    background: rgba(0, 0, 0, 0.36);
    border-radius: 8px;
    width: ${width - 20}px;
    justify-content: space-between;
    flex-direction: row;
    position: absolute;
    top: ${props => props.topOffset}px;
    zIndex: 3;
`
const TitleInfo = styled(View)`
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    padding: 5px;
    font-size: 18px;
    display: flex;
    flex: 1;
`
const TitlePosterContainer = styled(View)`
    margin: 5px;
`
const TitleText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
`
const TitleTextContainer = styled(View)`
    justify-content: center;
    display: flex;
`
const TitleUnderlineContainer = styled(View)`
    flex-direction: column;
    margin-top: 5px;
    height: 30px;
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
    height: 100%;
`

export default TitleBanner = ({ 
    donateObj=null, 
    navigation=null, 
    onTappedNewest=null,
    onTappedOldest=null,
    posterWidth=60,
    stack=null,
    titleObj,
    viewableReelay=null, 
}) => {
    const { reelayDBUser } = useContext(AuthContext);
    const topOffset = useSafeAreaInsets().top;
    const welcomeReelaySub = Constants.manifest.extra.welcomeReelaySub;
    const isWelcomeReelay = viewableReelay && (welcomeReelaySub === viewableReelay?.sub);
    
    // figure out how to do ellipses for displayTitle
    let displayTitle = (titleObj.display) ? titleObj.display : 'Title not found'; 
	let displayYear = (titleObj.releaseYear) ? titleObj.releaseYear : '';

    if (isWelcomeReelay) {
        displayTitle = 'Welcome to Reelay';
        displayYear = '2022';
    }
    
    const openTitleDetail = async () => {
        if (!viewableReelay?.title?.display) {
            return;
        }
        navigation.push('TitleDetailScreen', { titleObj });

        logAmplitudeEventProd('openTitleScreen', {
            reelayID: viewableReelay.id,
            reelayTitle: viewableReelay.title.display,
            username: reelayDBUser?.username,
            source: 'poster',
        });
    }

    const ForwardBack = ({ position }) => {
        const atOldestReelay = (position === 0);
        const atNewestReelay = (position === stack.length - 1);
        const positionString = `${position + 1}/${stack.length}`;

        const onTappedOldestSafe = () => (onTappedOldest) ? onTappedOldest() : {};
        const onTappedNewestSafe = () => (onTappedNewest) ? onTappedNewest() : {};

        return (
            <ForwardBackContainer>
                <ForwardBackButton onPress={onTappedOldestSafe} disabled={atOldestReelay}>
                    <FontAwesomeIcon icon={ faBackwardStep } size={18} color={atOldestReelay ? 'gray' : 'white'} />
                </ForwardBackButton>
                <StackLengthText>{positionString}</StackLengthText>
                <ForwardBackButton onPress={onTappedNewestSafe} disabled={atNewestReelay}>
                    <FontAwesomeIcon icon={ faForwardStep } size={18} color={atNewestReelay ? 'gray' : 'white'} />
                </ForwardBackButton>
            </ForwardBackContainer>
        );
    }

    const TitleUnderline = () => {
        const showReelayCount = stack?.length > 1;
        const stackIndex = (stack) ? stack.findIndex(reelay => reelay.id === viewableReelay.id) : -1;
        return (
            <TitleUnderlineContainer>
                <YearVenueContainer>
                    { viewableReelay?.content?.venue && 
                        <VenueContainer>
                            <VenueIcon venue={viewableReelay.content.venue} size={20} border={1} />
                        </VenueContainer>
                    }
                    { displayYear.length > 0 && <YearText>{displayYear}</YearText> }
                    { showReelayCount && <ForwardBack position={stackIndex} /> }
                </YearVenueContainer>
            </TitleUnderlineContainer>
        );
    }

    return (
        <TitleBannerContainer topOffset={topOffset}>
            <TitlePosterContainer>
                <TitlePoster title={titleObj} onPress={openTitleDetail} width={posterWidth} />
            </TitlePosterContainer>
            <TitleInfo>
                <TitleTextContainer>
                    <TitleText numberOfLines={2} ellipsizeMode={"tail"}>
                        {displayTitle}
                    </TitleText>
                </TitleTextContainer>
                <TitleUnderline />
            </TitleInfo>
            { !donateObj && <AddToClubsButton titleObj={viewableReelay.title} reelay={viewableReelay} /> }
            { donateObj && <DonateButton donateObj={donateObj} reelay={viewableReelay} /> }
        </TitleBannerContainer>    
    );
}