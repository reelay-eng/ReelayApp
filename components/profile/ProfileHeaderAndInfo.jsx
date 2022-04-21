
import React, { useState, useEffect } from 'react';
import { Linking, View } from 'react-native';
import { Autolink } from "react-native-autolink";

import ProfileHeader from '../../components/profile/ProfileHeader';
import * as ReelayText from "../../components/global/Text";
import { VenueIcon } from '../../components/utils/VenueIcon';

import { getStreamingSubscriptions } from '../../api/ReelayDBApi';

import styled from 'styled-components/native';


const UserInfoContainer = styled(View)`
    align-self: center;
    width: 72%;
    padding-top: 10px;
`;
const BioText = styled(Autolink)`
    color: white;
    padding-bottom: 3px;
    font-family: Outfit-Regular;
    font-size: 16px;
    font-style: normal;
    line-height: 20px;
    letter-spacing: 0.1px;
	text-align: left;
`;
const WebsiteText = styled(ReelayText.Subtitle2)`
    color: "rgb(51,102,187)";
    font-size: 14px;
    text-align: left;
    padding-bottom: 5px;
`;
const HeaderContainer = styled(View)`
    width: 100%;
    flex-wrap: wrap;
    flex-direction: row;
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

export default ProfileHeaderAndInfo = ({ creator, bioText, websiteText, streamingSubscriptions }) => {
    const fixLink = (link) => {
        if (link.startsWith('https://') || link.startsWith('http://')) {
            return link;
        } else {
            return 'https://'+link;
        }
    }

    if (bioText !== "" || websiteText !== "") {
        return (
            <HeaderContainer>
                <ProfileHeader creator={creator} />
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
                    <SubscriptionsContainer alignSelf={'flex-start'} marginBottom={'5px'}>
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
    else {
        return (
            <>
                <ProfileHeader creator={creator} shouldCenter={true} />
                <SubscriptionsContainer alignSelf={'center'} marginBottom={'15px'}>
                    {streamingSubscriptions.map((subscription, index) => {
                        return (
                        <VenueContainer key={index}>
                            <VenueIcon venue={subscription.platform} size={24} border={1} />
                        </VenueContainer>
                        );
                    })}
                </SubscriptionsContainer>
            </>
        )
    }
}
