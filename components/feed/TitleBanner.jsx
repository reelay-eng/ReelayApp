import React, { memo, useContext } from "react";
import { Dimensions, Pressable, SafeAreaView, View } from "react-native";
import * as ReelayText from '../global/Text';
import { AuthContext } from "../../context/AuthContext";
import Constants from 'expo-constants';

import { VenueIcon } from '../utils/VenueIcon';
import DonateButton from '../global/DonateButton';

import { logAmplitudeEventProd } from "../utils/EventLogger";
import styled from 'styled-components/native';
import TitlePoster from "../global/TitlePoster";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddToStackButton from "./AddToStackButton";

const { height, width } = Dimensions.get('window');

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
    club = null,
    titleObj,
    backgroundColor=DEFAULT_BGCOLOR,
    donateObj=null, 
    navigation=null, 
    onPress=null,
    posterWidth=60,
    topic=null,
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
            reelayID: viewableReelay?.id,
            reelayTitle: titleObj?.display,
            username: reelayDBUser?.username,
            source: 'poster',
        });
    }

    const TitleUnderline = () => {
        return (
            <TitleUnderlineContainer>
                <YearVenueLine />
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
                { displayYear.length > 0 && <YearText>{displayYear}</YearText> }
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
                { !donateObj && (
                    <AddToStackButton 
                        navigation={navigation} 
                        reelay={viewableReelay} 
                        club={club}
                        topic={topic}
                    />
                )}
                { donateObj && <DonateButton donateObj={donateObj} reelay={viewableReelay} /> }
            </TitleBannerContainer>    
        </TitleBannerOuterContainer>
    );
}

export default memo(TitleBanner, (prevProps, nextProps) => {
    return prevProps.titleObj === nextProps.titleObj && prevProps.viewableReelay === nextProps.viewableReelay;
})