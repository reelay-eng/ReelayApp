import React, { useContext } from "react";
import { Dimensions, Pressable, View } from "react-native";
import * as ReelayText from '../global/Text';
import { AuthContext } from "../../context/AuthContext";
import Constants from 'expo-constants';

import AddToWatchlistButton from '../titlePage/AddToWatchlistButton';
import { VenueIcon } from '../utils/VenueIcon';
import DonateButton from '../global/DonateButton';

import { logAmplitudeEventProd } from "../utils/EventLogger";
import styled from 'styled-components/native';
import TitlePoster from "../global/TitlePoster";
import { useSelector } from "react-redux";

const { height, width } = Dimensions.get('window');

const TitleTextContainer = styled(View)`
    width: 210px;
`
const TitleDetailContainer = styled(Pressable)`
    background: rgba(0, 0, 0, 0.36);
    border-radius: 8px;
    width: ${width - 20}px;
    justify-content: space-between;
    flex-direction: row;
`
const TitleInfoContainer = styled(View)`
    flex-direction: column;
    justify-content: center;
    padding: 5px;
    font-size: 18px;
`
const TitlePosterContainer = styled(View)`
    margin: 5px;
`
const TitleText = styled(ReelayText.H6Emphasized)`
    color: white;
    font-size: 16px;
`
const VenueContainer = styled(View)`
    margin-top: -4px;
    margin-right: 5px;
`
const YearText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    font-size: 14px;
    margin-bottom: 4px;
`
const YearVenueContainer = styled(View)`
    flex-direction: row;
    margin-top: 0px;
`

export default TopicTitleBanner = ({ navigation, reelay }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const welcomeReelaySub = Constants.manifest.extra.welcomeReelaySub;
    const isWelcomeReelay = reelay && (welcomeReelaySub === reelay?.sub);

    const donateLinks = useSelector(state => state.donateLinks);
    const donateObj = donateLinks?.find((donateLinkObj) => {
        const { tmdbTitleID, titleType } = donateLinkObj;
        const viewableTitleID = reelay.title.id;
        const viewableTitleType = (reelay.title.isSeries) ? 'tv' : 'film';
        return ((tmdbTitleID === viewableTitleID) && titleType === viewableTitleType);
    });
    
    // figure out how to do ellipses for displayTitle
    let displayTitle = (reelay.title.display) ? reelay.title.display : 'Title not found'; 
	let displayYear = (reelay.title.releaseYear) ? reelay.title.releaseYear : '';

    if (isWelcomeReelay) {
        displayTitle = 'Welcome to Reelay';
        displayYear = '2022';
    }
    
    const openTitleDetail = async () => {
        if (!reelay?.title?.display) {
            return;
        }
        navigation.push('TitleDetailScreen', { titleObj: reelay.title });

        logAmplitudeEventProd('openTitleScreen', {
            reelayID: reelay.id,
            reelayTitle: reelay.title.display,
            username: reelayDBUser?.username,
            source: 'poster',
        });
    }

    const TitleInfo = () => {
        return (
            <TitleInfoContainer>
                <TitleTextContainer>
                    <TitleText numberOfLines={2} ellipsizeMode={"tail"}>
                        {displayTitle}
                    </TitleText>
                </TitleTextContainer>
                <YearAndVenue />
            </TitleInfoContainer>
        );
    }

    const YearAndVenue = () => {
        return (
            <View style={{ marginTop: 5 }}>
                <YearVenueContainer>
                    { reelay?.content?.venue && (
                        <VenueContainer>
                            <VenueIcon venue={reelay.content.venue} size={20} border={1} />
                        </VenueContainer>
                    )}
                    { displayYear.length > 0 && <YearText>{displayYear}</YearText> }
                </YearVenueContainer>
            </View>
        );
    }

    return (
        <TitleDetailContainer onPress={openTitleDetail}>
            <TitlePosterContainer>
                <TitlePoster title={reelay.title} onPress={openTitleDetail} width={48} />
            </TitlePosterContainer>
            <TitleInfo />
            { !donateObj && <AddToWatchlistButton titleObj={reelay.title} reelay={reelay}/> }
            { donateObj && <DonateButton donateObj={donateObj} reelay={reelay} /> }
        </TitleDetailContainer>    
    );
}