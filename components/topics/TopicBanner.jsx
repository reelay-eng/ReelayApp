import React, { memo, useContext, useState } from "react";
import { Dimensions, Pressable, View } from "react-native";
import * as ReelayText from '../global/Text';
import { AuthContext } from "../../context/AuthContext";


import { logAmplitudeEventProd } from "../utils/EventLogger";
import styled from 'styled-components/native';
import TitlePoster from "../global/TitlePoster";
import AddToClubsButton from "../clubs/AddToClubsButton";
import AddToStackButton from "../feed/AddToStackButton";
import VenueIcon from '../utils/VenueIcon';

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { getRuntimeString } from "../utils/TitleRuntime";
import { animate } from "../../hooks/animations";
import { TopicsBannerIconSVG, TopicsIconSVG } from "../global/SVGs";

import { BlurView } from 'expo-blur'

const { width } = Dimensions.get('window');

const BannerTopSpacer = styled(View)`
    height: 22px;
`
const ExpandArrowView = styled(Pressable)`
    align-items: center;
    padding-bottom: 6px;
    width: 100%;
`
const ExpandedInfoView = styled(Pressable)`
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
    margin: 6px;
    margin-top: 0px;
    padding: 12px;
    padding-top: 10px;
    padding-bottom: 0px;
    width: ${width}px;
`
const RuntimeText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
    margin-right: 10px;
`
const TopicBannerRow = styled(Pressable)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    height: 60px;
`
const TopicBannerBackground = styled(View)`
    align-items: center;
    border-radius: 8px;
    top: 20px;
    width: ${width - 20}px;
    zIndex: 3;
    overflow: hidden;
`
const TopicIconContainer = styled(View)`
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 10px;
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
    text-shadow-color: rgba(0, 0, 0, 0.4);
    text-shadow-offset: 1px 1px;
    text-shadow-radius: 1px;
`
const TitleTextContainer = styled(View)`
    justify-content: center;
    display: flex;
`
const TopicTitleText = styled(ReelayText.Subtitle1Emphasized)`
    color: white;
    text-shadow-color: rgba(0, 0, 0, 0.5);
    text-shadow-offset: 1px 1px;
    text-shadow-radius: 1px;
`
const TopicTitleView = styled(View)`
    justify-content: center;
    display: flex;
    flex: 1;
    height: 100%;
    padding-right: 10px;
`
const UnderlineContainer = styled(View)`
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

const TopicBanner = ({ 
    club = null,
    navigation=null, 
    onCameraScreen=false,
    reelay=null, 
    titleObj,
    topic=null,
}) => {
    const { reelayDBUser } = useContext(AuthContext);
    const [expanded, setExpanded] = useState(false);
    
    // figure out how to do ellipses for displayTitle
    const displayTitle = (titleObj.display) ? titleObj.display : 'Title not found'; 
	const displayYear = (titleObj.releaseYear) ? titleObj.releaseYear : '';
    const runtime = titleObj?.runtime;
    const venue = reelay?.content?.venue;

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

    const AddToStack = () => {
        return (
            <AddToStackButton 
                navigation={navigation} 
                reelay={reelay} 
                club={club}
                topic={topic}
            />
        );
    }

    const AddToClubs = () => {
        return (
            <AddToClubsButton
                navigation={navigation}
                titleObj={reelay?.title}
                reelay={reelay}
            />
        );
    }

    const ExpandArrow = () => {
        return (
            <ExpandArrowView onPress={onClickExpand}>
                <FontAwesomeIcon icon={expanded ?  faChevronUp : faChevronDown} color='white' size={16} />
            </ExpandArrowView>
        );
    }

    const ExpandedInfo = () => {
        return (
            <Pressable onPress={onClickExpand}>
                <ExpandedInfoView>
                    <Poster />
                    <TitleInfo />
                    { !onCameraScreen && <AddToClubs /> }
                </ExpandedInfoView>
            </Pressable>
        );
    }

    const Poster = () => {
        return (
            <TitlePosterContainer>
                <TitlePoster title={titleObj} onPress={openTitleDetail} width={56} />
            </TitlePosterContainer>
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
                <Underline 
                    displayYear={displayYear} 
                    expanded={expanded}
                    runtime={titleObj?.runtime}
                    venue={venue} 
                />
            </TitleInfoPressable>
        );
    }

    const TopicIcon = () => {
        return (
            <TopicIconContainer>
                <TopicsBannerIconSVG />
            </TopicIconContainer>
        );
    }

    const TopicTitle = () => {
        return (
            <TopicTitleView>
                <TopicTitleText numberOfLines={3}>{topic?.title}</TopicTitleText>
            </TopicTitleView>
        );
    }

    const Underline = () => {
        const runtimeString = runtime ? getRuntimeString(runtime) : '';
        return (
            <UnderlineContainer>
                <YearVenueContainer>
                    { venue && <VenueIndicator venue={venue} /> }
                    { displayYear?.length > 0 && <YearText>{displayYear}</YearText> }
                    { runtimeString?.length > 0 && <RuntimeText>{runtimeString}</RuntimeText> }
                </YearVenueContainer>
            </UnderlineContainer>
        );
    };

    const VenueIndicator = () => {
        return (
            <VenueContainer>
                <VenueIcon venue={venue} size={20} border={1} />
            </VenueContainer>
        )
    }
        

    return (
        <TopicBannerBackground>
            <BlurView intensity={25} tint='dark' style={{ alignItems: 'center', width: '100%'}}>
                <BannerTopSpacer />
                <TopicBannerRow onPress={onClickExpand}>
                    <TopicIcon />
                    <TopicTitle />
                    { !onCameraScreen && <AddToStack /> }
                </TopicBannerRow>    
                { expanded && <ExpandedInfo /> }
                <ExpandArrow />
            </BlurView>
        </TopicBannerBackground>
    );
}

const areEqual = (prevProps, nextProps) => {
    const titlesEqual = (prevProps.titleObj?.id === nextProps.titleObj?.id);
    const reelaysEqual = (prevProps?.reelay?.sub === nextProps?.reelay?.sub);
    return titlesEqual && reelaysEqual ;
}

export default memo(TopicBanner, areEqual);