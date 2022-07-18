import React, { memo, useContext } from "react";
import { Dimensions, Pressable, SafeAreaView, View } from "react-native";
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
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import ClubPicture from "../global/ClubPicture";
import BackButton from "../utils/BackButton";

const { height, width } = Dimensions.get('window');

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
const TitleBannerOuterContainer = styled(SafeAreaView)`
    margin-left: 10px;
    position: ${props => props.absolute ? 'absolute' : 'relative'};
    top: 20px;
`
const TitleBannerContainer = styled(Pressable)`
    align-self: center;
    background-color: ${props => props.color};
    border-radius: 8px;
    width: ${width - 20}px;
    justify-content: space-between;
    flex-direction: row;
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
    justify-content: center;
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

const DEFAULT_BGCOLOR = 'rgba(0, 0, 0, 0.36)';

const TitleBanner = ({ 
    titleObj,
    backgroundColor=DEFAULT_BGCOLOR,
    clubActivity=null,
    donateObj=null, 
    navigation=null, 
    onPress=null,
    posterWidth=60,
    showBackButton=false,
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

    const TitleUnderline = () => {
        const showActivity = clubActivity;
        const matchClubID = (nextClub) => nextClub?.id === clubActivity?.clubID
        const club = (clubActivity) ? myClubs.find(matchClubID) : null;
        const positionString = (stack.length > 1)
                ? `${stack.length} reelays`
                : 'just added';

        return (
            <TitleUnderlineContainer>
                <YearVenueLine />
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
            </TitleUnderlineContainer>
        );
    }

    const YearVenueLine = memo(() => {
        return (
            <YearVenueContainer>
                { viewableReelay?.content?.venue && 
                    <VenueContainer>
                        <VenueIcon venue={viewableReelay?.content?.venue} size={20} border={1} />
                    </VenueContainer>
                }
                { displayYear.length > 0 && !clubActivity && <YearText>{displayYear}</YearText> }
            </YearVenueContainer>
        );
    }, (prevProps, nextProps) => {
        return prevProps.venue === nextProps.venue;
    });

    return (
        <TitleBannerOuterContainer absolute={!!viewableReelay} topOffset={viewableReelay ? topOffset : 0}>
            <TitleBannerContainer color={backgroundColor} onPress={onPress ?? openTitleDetail}>
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
                { !donateObj && !clubActivity && <AddToClubsButton navigation={navigation} titleObj={titleObj} reelay={viewableReelay} /> }
                { !clubActivity && donateObj && <DonateButton donateObj={donateObj} reelay={viewableReelay} /> }
                { clubActivity && <ActivityPic /> }
            </TitleBannerContainer>    
            { showBackButton && <BackButton navigation={navigation} /> }
        </TitleBannerOuterContainer>
    );
}

export default memo(TitleBanner, (prevProps, nextProps) => {
    return prevProps.titleObj === nextProps.titleObj && prevProps.viewableReelay === nextProps.viewableReelay;
})