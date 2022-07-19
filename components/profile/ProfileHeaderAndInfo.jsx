
import React, { useState, useEffect } from 'react';
import { Dimensions, Linking, Pressable, View } from 'react-native';
import { Autolink } from "react-native-autolink";

import ProfileStatsBar from './ProfileStatsBar';
import * as ReelayText from "../../components/global/Text";
import { VenueIcon } from '../../components/utils/VenueIcon';

import styled from 'styled-components/native';

const UserInfoContainer = styled(View)`
    padding: 16px;
    padding-top: 0px;
    width: 100%;
`;
const ProfilePictureContainer = styled(Pressable)`
    border-color: white;
    border-radius: 50px;
    border-width: 2px;
    height: 84px;
    width: 84px;
    border-width: 2px;
`
const StatsBarContainer = styled(View)`
    justify-content: center;
    width: 75%;
    align-items: center;
`;
const BioText = styled(Autolink)`
    color: white;
    font-family: Outfit-Regular;
    font-size: 14px;
    font-style: normal;
    line-height: 20px;
    letter-spacing: 0.1px;
    padding-bottom: 8px;
	text-align: left;
`;
const WebsiteText = styled(ReelayText.Subtitle2)`
    color: "rgb(51,102,187)";
    font-size: 14px;
    padding-bottom: 12px;
    text-align: left;
`;
const HeaderContainer = styled(View)`
    flex-direction: row;
    padding: 16px;
    justify-content: space-around;
`
const SubscriptionsContainer = styled(View)`
    flex-direction: row;
`
const VenueContainer = styled(View)`
    margin-right: 4px;
    width: 26px;
`

export default ProfileHeaderAndInfo = ({ 
    navigation, 
    creator, 
    streamingSubscriptions, 
    reelayCount, 
    followers, 
    following, 
}) => {
    const bioText = creator?.bio ?? '';
    const websiteText = creator?.website ?? '';
    const watchlistAddCount = creator?.watchlistAddCount ?? 0;

    const fixLink = (link) => {
        if (link.startsWith('https://') || link.startsWith('http://')) {
            return link;
        } else {
            return 'https://'+link;
        }
    }

    const goToWebsiteLink = () => Linking.openURL(fixLink(websiteText))

    return (
        <React.Fragment>
            <HeaderContainer>
                <ProfilePictureContainer>
                    <ProfilePicture user={creator} size={80} />
                </ProfilePictureContainer>
                <StatsBarContainer>
                    <ProfileStatsBar
                        navigation={navigation}
                        reelayCount={reelayCount}
                        creator={creator}
                        followers={followers}
                        following={following}
                        watchlistAddCount={watchlistAddCount}
                    />
                </StatsBarContainer>
            </HeaderContainer>
            <UserInfoContainer>
                {bioText !== "" && (
                    <BioText text={bioText.trim()} linkStyle={{ color: "#3366BB" }} url /> 
                )}
                {websiteText !== "" && (
                    <WebsiteText onPress={goToWebsiteLink}>{websiteText}</WebsiteText>
                )}
                <SubscriptionsContainer>
                    {streamingSubscriptions.map((subscription, index) => {
                        return (
                            <VenueContainer key={index}>
                                <VenueIcon venue={subscription.platform} size={24} border={1} />
                            </VenueContainer>
                        );
                    })}
                </SubscriptionsContainer>
            </UserInfoContainer>    
        </React.Fragment>
    )
}
