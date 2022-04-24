
import React, { useState, useEffect } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { Autolink } from "react-native-autolink";

import ProfileStatsBar from './ProfileStatsBar';
import * as ReelayText from "../../components/global/Text";
import { VenueIcon } from '../../components/utils/VenueIcon';

import styled from 'styled-components/native';

const UserInfoContainer = styled(View)`
    align-self: center;
    justify-content: center;
    width: 90%;
    padding: 20px;
    padding-top: 0px;
`;
const ProfilePictureContainer = styled(Pressable)`
    border-color: white;
    border-radius: 50px;
    border-width: 2px;
    margin: 16px;
    margin-left: 18px;
    height: 84px;
    width: 84px;
    border-width: 2px;
`
const ProfileTopRightContainer = styled(View)`
    align-self: center;
    justify-content: center;
    padding-right: 10px;
    width: 67%;
`;
const BioText = styled(Autolink)`
    color: white;
    font-family: Outfit-Regular;
    font-size: 14px;
    font-style: normal;
    line-height: 20px;
    letter-spacing: 0.1px;
	text-align: left;
`;
const WebsiteText = styled(ReelayText.Subtitle2)`
    color: "rgb(51,102,187)";
    font-size: 14px;
    text-align: left;
    padding-top: 6px;
    padding-bottom: 9px;
`;
const HeaderContainer = styled(View)`
    width: 95%;
    flex-wrap: wrap;
    flex-direction: row;
    align-self: center;
`
const SubscriptionsContainer = styled(View)`
    align-self: ${props => props.alignSelf};
    flex-direction: row;
    margin-bottom: ${props => props.marginBottom};
`
const VenueContainer = styled(View)`
    margin-right: 10px;
    width: 26px;
`

export default ProfileHeaderAndInfo = ({ navigation, creator, bioText, websiteText, streamingSubscriptions, reelayCount, followers, following, prevScreen }) => {
    const fixLink = (link) => {
        if (link.startsWith('https://') || link.startsWith('http://')) {
            return link;
        } else {
            return 'https://'+link;
        }
    }

    const goToWebsiteLink = () => Linking.openURL(fixLink(websiteText))

    return (
        <HeaderContainer>
             <ProfilePictureContainer>
                <ProfilePicture user={creator} size={80} />
            </ProfilePictureContainer>
            <ProfileTopRightContainer>
                <ProfileStatsBar
                    navigation={navigation}
                    reelayCount={reelayCount}
                    creator={creator}
                    followers={followers}
                    following={following}
                    prevScreen={prevScreen}
                />
            </ProfileTopRightContainer>
            <UserInfoContainer>
                {bioText !== "" && (
                    <BioText text={bioText.trim()} linkStyle={{ color: "#3366BB" }} url /> 
                )}
                {websiteText !== "" && (
                    <WebsiteText onPress={goToWebsiteLink}>{websiteText}</WebsiteText>
                )}
                <SubscriptionsContainer alignSelf={'flex-start'} marginBottom={'0px'}>
                    {streamingSubscriptions.map((subscription, index) => {
                        return (
                            <VenueContainer key={index}>
                                <VenueIcon venue={subscription.platform} size={24} border={1} />
                            </VenueContainer>
                        );
                    })}
                </SubscriptionsContainer>
            </UserInfoContainer>
        </HeaderContainer>
    )
}
