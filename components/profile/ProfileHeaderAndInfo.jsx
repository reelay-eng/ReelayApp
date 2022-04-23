
import React, { useState, useEffect } from 'react';
import { Linking, View } from 'react-native';
import { Autolink } from "react-native-autolink";

import ProfileHeader from '../../components/profile/ProfileHeader';
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
    padding-bottom: 3px;
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

        return (
            <HeaderContainer>
                <ProfileHeader creator={creator} />

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
                        <BioText
                        text={bioText.trim()}
                        linkStyle={{ color: "#3366BB" }}
                        url
                        />
                    )}
                    {websiteText !== "" && (
                        <WebsiteText onPress={() => Linking.openURL(fixLink(websiteText))}>
                        {" "}
                        {websiteText}{" "}
                        </WebsiteText>
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
