import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';
import BackButton from '../utils/BackButton';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faListCheck } from '@fortawesome/free-solid-svg-icons';
import { fetchOrCreateProfileLink } from '../../api/ProfilesApi';
import { useSelector } from 'react-redux';
import { showErrorToast, showMessageToast } from '../../components/utils/toasts';
import * as Clipboard from 'expo-clipboard';

const REELAY_WEB_PREFIX = `https://on.reelay.app`;

export default ProfileTopBar = ({ creator, navigation, atProfileBase = false }) => {
    const authSession = useSelector(state => state.authSession);
    const creatorName = creator.username ?? 'User not found';

    const validCreatorName = (creator?.username && (creator?.username != "[deleted]"));

    const HeadingText = styled(ReelayText.H6Emphasized)`
        color: white;
        padding-left: ${atProfileBase ? 10: 0}px;
    `
    const IconContainer = styled(TouchableOpacity)`
        margin-left: 12px;
    `
    // should line up with home header
    const RightCornerContainer = styled(View)`
        align-items: center;
        top: 6px;
        flex-direction: row;
        position: absolute;
        right: 5px;
    `
    const TopBarContainer = styled(SafeAreaView)`
        align-items: center;
        flex-direction: row;
        height: 40px;
        margin-left: 4px;
        margin-right: 10px;
        margin-bottom: 8px;
        shadow-color: white;
        shadow-offset: 8px;
        shadow-radius: 2px;
    `
    const SettingsButtons = () => {
        const advanceToMyWatchlist = () => navigation.push('WatchlistScreen');
        const advanceToMyProfileSettings = () => navigation.push('ProfileSettingsScreen');

        return (
            <RightCornerContainer>
                <IconContainer onPress={advanceToMyWatchlist}>
                    <FontAwesomeIcon icon={ faListCheck } size={27} color='white' />
                </IconContainer>
                <IconContainer onPress={advanceToMyProfileSettings}>
                    <Icon type='ionicon' size={27} color={'white'} name='settings-outline' />
                </IconContainer>
            </RightCornerContainer>
        );
    }

    const CopyProfileLinkButton = () => {
        const copyProfileLink = async () => {
            try {
                // first, create the profile link if it doesn't exist in useEffect
                // then, copy it to clipboard:
                const profileLink = await fetchOrCreateProfileLink({ 
                    authSession, 
                    userSub: creator?.sub, 
                    username: creator?.username 
                });
                console.log("PROFILE LINK: ", profileLink);
                if (profileLink?.error) {
                    showErrorToast("There was an error creating this profile link. Please try again.");
                }
                else {
                    const profilePublicURL = `${REELAY_WEB_PREFIX}/profile/${profileLink?.inviteCode}`;
                    Clipboard.setString(profilePublicURL);
                    showMessageToast('Profile link copied to clipboard');
                }
            } catch(e) {
                console.log(e);
                showErrorToast('Ruh roh! Couldn\'t copy profile link. Try again!');
            }
        }

        return (
            <Icon onPress={copyProfileLink} type="ionicon" name="link-outline" color="white" size={25} containerStyle={{marginLeft: 15, transform: [{ rotate: '-45deg' }]}} />
        )
    }

    return (
        <TopBarContainer>
            { !atProfileBase && <BackButton navigation={navigation} /> }
            <HeadingText>{creatorName}</HeadingText>
            { validCreatorName && <CopyProfileLinkButton />}
            { atProfileBase && <SettingsButtons /> }
        </TopBarContainer>
    );
}
