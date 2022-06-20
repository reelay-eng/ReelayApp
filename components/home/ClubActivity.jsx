import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Dimensions, Pressable, TouchableOpacity, View } from 'react-native';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../global/Text';
import { useSelector } from 'react-redux';
import ProfilePicture from '../global/ProfilePicture';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faAsterisk, faCertificate, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import ClubPicture from '../global/ClubPicture';
import { VenueIcon } from '../utils/VenueIcon';

const { width } = Dimensions.get('window');

const ClubPictureContainer = styled(View)`
    justify-content: center;
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
    top: 0px;
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

export default ClubActivity = ({ navigation, activity }) => {

    const { activityType, title, reelays } = activity;
    const displayTitle = (title?.display) ? title.display : 'Title not found'; 
	const displayYear = (title?.releaseYear) ? title.releaseYear : '';
    const posterWidth = 60;

    const openTitleDetail = async () => {
        if (!viewableReelay?.title?.display) {
            return;
        }
        navigation.push('TitleDetailScreen', { titleObj: title });

        // logAmplitudeEventProd('openTitleScreen', {
        //     reelayID: viewableReelay?.id,
        //     reelayTitle: titleObj?.display,
        //     username: reelayDBUser?.username,
        //     source: 'poster',
        // });
    }

    const TitleUnderline = () => {
        const showReelayCount = reelays?.length > 1;
        const positionString = `1/${reelays.length}`;
        const topReelay = reelays?.[0];

        return (
            <TitleUnderlineContainer>
                <YearVenueContainer>
                    { topReelay && topReelay?.content?.venue && 
                        <VenueContainer>
                            <VenueIcon venue={reelays[0]?.content?.venue} size={20} border={1} />
                        </VenueContainer>
                    }
                    { displayYear.length > 0 && <YearText>{displayYear}</YearText> }
                    { showReelayCount && <StackLengthText>{positionString}</StackLengthText> }
                </YearVenueContainer>
            </TitleUnderlineContainer>
        );
    }

    if (activityType !== 'title') return <View />;

    return (
        <TitleBannerContainer>
            <TitlePosterContainer>
                <TitlePoster title={title} onPress={openTitleDetail} width={posterWidth} />
            </TitlePosterContainer>
            <TitleInfo>
                <TitleTextContainer>
                    <TitleText numberOfLines={2} ellipsizeMode={"tail"}>
                        {displayTitle}
                    </TitleText>
                </TitleTextContainer>
                <TitleUnderline />
            </TitleInfo>
            <ClubPictureContainer>
            <ClubPicture club={{ id: activity?.clubID }} size={45} />
            </ClubPictureContainer>
        </TitleBannerContainer>
    );
}