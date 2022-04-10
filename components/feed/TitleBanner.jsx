import React, { useContext } from "react";
import { Dimensions, Pressable, View } from "react-native";
import * as ReelayText from '../global/Text';
import { AuthContext } from "../../context/AuthContext";
import Constants from 'expo-constants';

import Poster from './Poster';
import AddToWatchlistButton from '../titlePage/AddToWatchlistButton';
import { VenueIcon } from '../utils/VenueIcon';
import DonateButton from '../global/DonateButton';

import { logAmplitudeEventProd } from "../utils/EventLogger";
import styled from 'styled-components/native';

const { height, width } = Dimensions.get('window');

const StackLengthText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
    font-size: 12px;
`
const TitleContainer = styled(View)`
    width: 210px;
`
const TitleDetailContainer = styled(Pressable)`
    align-self: center;
    background: rgba(0, 0, 0, 0.36);
    border-radius: 8px;
    height: 100px;
    width: ${width - 20}px;
    justify-content: space-between;
    flex-direction: row;
    position: absolute;
    top: 47px;
    zIndex: 3;
`
const TitleInfo = styled(View)`
    flex-direction: column;
    justify-content: center;
    padding: 5px;
    font-size: 18px;
`
const TitleText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
`
const VenueContainer = styled(View)`
    margin-top: -4px;
    margin-right: 5px;
`
const YearText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
    margin-bottom: 4px;
`
const YearVenueContainer = styled(View)`
    flex-direction: row;
    margin-top: 0px;
`

export default TitleBanner = ({ 
    titleObj,
    navigation=null, 
    viewableReelay=null, 
    stack=null,
    donateObj=null, 
}) => {
    const { reelayDBUser } = useContext(AuthContext);
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

    return (
        <TitleDetailContainer onPress={openTitleDetail}>
            <Poster title={titleObj} />
            <TitleInfo>
                <TitleContainer>
                    <TitleText numberOfLines={2} ellipsizeMode={"tail"}>
                        {displayTitle}
                    </TitleText>
                </TitleContainer>
                <View style={{ flexDirection: "column", marginTop: 5 }}>
                    <YearVenueContainer>
                        { viewableReelay?.content?.venue && 
                            <VenueContainer>
                                <VenueIcon venue={viewableReelay.content.venue} size={20} border={1} />
                            </VenueContainer>
                        }
                        { displayYear.length > 0 && <YearText>{displayYear}</YearText> }
                    </YearVenueContainer>
                    <StackLengthText>
                        {(stack.length > 1) 
                            ? `${stack.length} Reelays  << swipe >>` 
                            : `${stack.length} Reelay`
                        }
                    </StackLengthText>
                </View>
            </TitleInfo>
            { !donateObj && <AddToWatchlistButton titleObj={viewableReelay.title} reelay={viewableReelay}/> }
            { donateObj && <DonateButton donateObj={donateObj} reelay={viewableReelay} /> }
        </TitleDetailContainer>    
    );
}