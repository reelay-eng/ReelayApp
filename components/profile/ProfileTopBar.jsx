import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, TouchableOpacity, Share } from 'react-native';
import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';
import BackButton from '../utils/BackButton';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowUpFromBracket, faGear } from '@fortawesome/free-solid-svg-icons';
import { fetchOrCreateProfileLink } from '../../api/ProfilesApi';
import { useSelector } from 'react-redux';
import { showErrorToast } from '../../components/utils/toasts';
import { logAmplitudeEventProd } from '../utils/EventLogger';

const REELAY_WEB_PREFIX = `https://on.reelay.app`;

export default ProfileTopBar = ({ creator, navigation, atProfileBase = false }) => {
    const authSession = useSelector(state => state.authSession);
    const creatorName = creator.username ?? 'User not found';
    const validCreatorName = (creator?.username && (creator?.username != "[deleted]"));

    const [profileLink, setProfileLink] = useState("");

    useEffect(() => {
        const fetchProfileLink = async () => {
            const profileLink = await fetchOrCreateProfileLink({ 
                authSession, 
                userSub: creator?.sub, 
                username: creator?.username 
            });
            setProfileLink(profileLink);
        }
        if (validCreatorName) {
            fetchProfileLink();
        }
    }, [])

    const HeadingText = styled(ReelayText.H6Emphasized)`
        color: white;
        padding-left: ${atProfileBase ? 10: 0}px;
    `
    const IconContainer = styled(TouchableOpacity)`
        margin-left: 16px;
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
    const RightCornerButtons = () => {
        const advanceToMyProfileSettings = () => navigation.push('ProfileSettingsScreen');
        const shareProfileLink = async () => {
            try {
                // first, create the profile link if it doesn't exist in useEffect
                // then, copy it to clipboard:
                if (profileLink?.error) {
                    showErrorToast("There was an error creating this profile link. Please try again.");
                }
                else {
                    // now open share out drawer
                    const content = {
                        url: `${REELAY_WEB_PREFIX}/profile/${profileLink?.inviteCode}`,
                        title: `${creator?.username} on Reelay`,
                    };
                    const options = {};
                    const sharedAction = await Share.share(content, options);
                    logAmplitudeEventProd('openedShareDrawer', {
                        username: creator?.username,
                        title: `${creator?.username} on Reelay`,
                        source: 'shareProfileLinkButton',
                    });
                    console.log(sharedAction);
                }
            } catch(e) {
                console.log(e);
                showErrorToast('Ruh roh! Couldn\'t share profile link. Try again!');
                console.log("Error in share profile link. Registered profile link: ", profileLink);
            }
        }

        const ShareProfileLinkButton = () => {
            return (
                <IconContainer onPress={shareProfileLink}>
                    <FontAwesomeIcon icon={faArrowUpFromBracket} size={24} color='white' />
                </IconContainer>
            );
        }

        const SettingsButton = () => {
            return (
                <IconContainer onPress={advanceToMyProfileSettings}>
                    <FontAwesomeIcon icon={faGear} size={24} color='white' />
                </IconContainer>
            );
        }

        return (
            <RightCornerContainer>
                { validCreatorName && <ShareProfileLinkButton />}
                { atProfileBase && <SettingsButton /> }
            </RightCornerContainer>
        );
    }

    return (
        <TopBarContainer>
            { !atProfileBase && <BackButton navigation={navigation} /> }
            <HeadingText>{creatorName}</HeadingText>
            <RightCornerButtons />
        </TopBarContainer>
    );
}
