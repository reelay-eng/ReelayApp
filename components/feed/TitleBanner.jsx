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
import { faArrowRight, faCircle, faDotCircle } from "@fortawesome/free-solid-svg-icons";
import { faForwardStep, faBackwardStep } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import ClubPicture from "../global/ClubPicture";
import ReelayColors from "../../constants/ReelayColors";

const { height, width } = Dimensions.get('window');

const ActivityText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
    font-size: 12px;
`
const ClubActivityPicContainer = styled(View)`
    align-items: center;
    justify-content: center;
    margin: 8px;
`
const ClubTitleContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    width: 100%;
`
const ClubTitleText = styled(ReelayText.Caption)`
    align-items: center;
    color: white;
    display: flex;
    flex-direction: row;
    flex: 1;
    height: 52px;
    padding: 6px;
    padding-left: 0px;
    padding-right: 0px;
`
const DotIconContainer = styled(View)`
    align-items: center;
    margin-bottom: -2px;
    margin-left: 8px;
    margin-right: 8px;
`
const ForwardBackButton = styled(TouchableOpacity)`
    align-items: center;
    border-color: ${props => props.disabled ? '#a8a8a8' : 'white'};
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
    margin-left: -8px;
    margin-top: 8px;
`
const PositionText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
    font-size: 12px;
`
const Spacer = styled(View)`
    height: 10px;
`
const TitleBannerContainer = styled(Pressable)`
    align-self: center;
    background: rgba(0, 0, 0, 0.36);
    border-radius: 8px;
    width: ${width - 20}px;
    justify-content: space-between;
    flex-direction: row;
    position: ${props => props.absolute ? 'absolute' : 'relative'};
    top: ${props => props.topOffset}px;
    zIndex: 3;
`
const TitleInfo = styled(View)`
    align-items: flex-start;
    justify-content: center;
    font-size: 18px;
    display: flex;
    flex: 1;
    padding: 5px;
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

export default TitleBanner = ({ 
    titleObj,
    clubActivity=null,
    donateObj=null, 
    navigation=null, 
    onPress=null,
    onTappedNewest=null,
    onTappedOldest=null,
    posterWidth=60,
    stack=null,
    viewableReelay=null, 
}) => {
    const { reelayDBUser } = useContext(AuthContext);
    const topOffset = useSafeAreaInsets().top;
    const myClubs = useSelector(state => state.myClubs);
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
            reelayID: viewableReelay?.id,
            reelayTitle: titleObj?.display,
            username: reelayDBUser?.username,
            source: 'poster',
        });
    }

    const ActivityPic = () => {
        if (!clubActivity) return <View />;
        
        return (
            <ClubActivityPicContainer>
                <ClubPicture border club={{ id: clubActivity?.clubID }} size={52} />
            </ClubActivityPicContainer>
        )
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
                    <FontAwesomeIcon icon={ faBackwardStep } size={18} color={atOldestReelay ? '#a8a8a8' : 'white'} />
                </ForwardBackButton>
                <PositionText>{positionString}</PositionText>
                <ForwardBackButton onPress={onTappedNewestSafe} disabled={atNewestReelay}>
                    <FontAwesomeIcon icon={ faForwardStep } size={18} color={atNewestReelay ? '#a8a8a8' : 'white'} />
                </ForwardBackButton>
            </ForwardBackContainer>
        );
    }

    const TitleUnderline = () => {
        const showForwardBack = stack?.length > 1 && !clubActivity;
        const showActivity = clubActivity;
        const position = (stack) ? stack.findIndex(reelay => reelay.id === viewableReelay?.id) : -1;

        const matchClubID = (nextClub) => nextClub?.id === clubActivity?.clubID
        const club = (clubActivity) ? myClubs.find(matchClubID) : null;
        const positionString = (stack.length > 1)
                ? `${stack.length} reelays`
                : 'just added';

        return (
            <TitleUnderlineContainer>
                <YearVenueContainer>
                    { viewableReelay?.content?.venue && 
                        <VenueContainer>
                            <VenueIcon venue={viewableReelay?.content?.venue} size={20} border={1} />
                        </VenueContainer>
                    }
                    { displayYear.length > 0 && !clubActivity && <YearText>{displayYear}</YearText> }
                </YearVenueContainer>

                { showActivity && (
                    <ClubTitleContainer>
                        <ClubTitleText numberOfLines={2}>
                            {club?.name}
                            <DotIconContainer>
                                <FontAwesomeIcon icon={faCircle} size={6} color='white' />
                            </DotIconContainer>
                            {positionString}
                        </ClubTitleText>
                    </ClubTitleContainer>
                ) }
                { showForwardBack && <ForwardBack position={position} /> }
            </TitleUnderlineContainer>
        );
    }

    return (
        <TitleBannerContainer 
            absolute={!!viewableReelay} 
            onPress={onPress ?? openTitleDetail}
            topOffset={viewableReelay ? topOffset : 0}>
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
            { !donateObj && !clubActivity && <AddToClubsButton titleObj={titleObj} reelay={viewableReelay} /> }
            { !clubActivity && donateObj && <DonateButton donateObj={donateObj} reelay={viewableReelay} /> }
            { clubActivity && <ActivityPic /> }
        </TitleBannerContainer>    
    );
}