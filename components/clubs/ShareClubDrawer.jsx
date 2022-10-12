import React, { Fragment, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, Pressable, Share, TouchableOpacity, View } from 'react-native';

import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
import * as ReelayText from '../global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// import Share from 'react-native-share';
import styled from 'styled-components/native';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCamera, faLink, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ShareOutSVG } from '../global/SVGs';
import { showMessageToast } from '../utils/toasts';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { createDeeplinkPathToClub } from '../../api/ClubsApi';
import { useSelector } from 'react-redux';

const { height, width } = Dimensions.get('window');

const BUTTON_MARGIN_WIDTH = 10;
const BUTTON_WIDTH = (width - (BUTTON_MARGIN_WIDTH * 5)) / 3;
const INVITE_BASE_URL = Constants.manifest.extra.reelayWebInviteUrl;

const Backdrop = styled(Pressable)`
    background-color: transparent;
    bottom: 0px;
    height: 100%;
    position: absolute;
    width: 100%;
`
const CloseDrawerButton = styled(TouchableOpacity)`
    padding: 10px;
`
const DrawerView = styled(View)`
    background-color: #1a1a1a;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    height: auto;
    margin-top: auto;
    max-height: 70%;
    padding-top: 8px;
    padding-bottom: ${props => props.bottomOffset + 12}px;
    width: 100%;
`
const DrawerHeaderView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding-left: 16px;
    padding-right: 16px;
`
const HeaderText = styled(ReelayText.H6)`
    color: white;
    font-size: 18px;
`
const LeftSpacer = styled(View)`
    width: 40px;
`
const ShareOptionPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: #222529;
    border-radius: 12px;
    height: ${BUTTON_WIDTH}px;
    justify-content: center;
    margin: ${BUTTON_MARGIN_WIDTH / 2}px;
    width: ${BUTTON_WIDTH}px;
`
const ShareOptionText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    font-size: 14px;
    margin-top: 10px;
    margin-bottom: 12px;
`
const ShareOptionTextView = styled(View)`
    align-items: center;
    height: 100%;
    justify-content: flex-end;
    position: absolute;
    width: 100%;
`
const ShareOptionView = styled(View)`
    align-items: center;
`
const ShareOptionsRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    padding-left: ${BUTTON_MARGIN_WIDTH}px;
    padding-right: ${BUTTON_MARGIN_WIDTH}px;
`
const ShareOptionIconPad = styled(View)`
    height: 25px;
`

export default ShareClubDrawer = ({ closeDrawer, club, navigation }) => {
    const authSession = useSelector(state => state.authSession);
    const bottomOffset = useSafeAreaInsets().bottom;
    const [clubLink, setClubLink] = useState(null);
    const { reelayDBUser } = useContext(AuthContext);

    const createOrLoadClubLink = async () => {
        const clubLinkObj = await createDeeplinkPathToClub({
            authSession,
            clubID: club.id,
            invitedByUserSub: reelayDBUser?.sub,
            invitedByUsername: reelayDBUser?.username,
        });

        if (clubLinkObj?.inviteCode && !clubLinkObj?.error) {
            const clubLink = INVITE_BASE_URL + clubLinkObj.inviteCode;
            setClubLink(clubLink);
        }

    }

    useEffect(() => {
        createOrLoadClubLink();
    }, []);

    const DrawerHeader = () => {
        return (
            <DrawerHeaderView>
                <LeftSpacer />
                <HeaderText>{'Share'}</HeaderText>
                <CloseDrawerButton onPress={closeDrawer}>
                    <FontAwesomeIcon icon={faXmark} size={20} color='white' />
                </CloseDrawerButton>
            </DrawerHeaderView>
        )
    }

    const CopyLinkButton = () => {
        const copyLink = () => {
            Clipboard.setStringAsync(clubLink).then(onfulfilled => {
                showMessageToast('Invite link copied to clipboard');
            });
        }

        return (
            <ShareOptionView>
                <ShareOptionPressable onPress={copyLink}>
                    <FontAwesomeIcon icon={faLink} color='white' size={30} />
                    <ShareOptionIconPad />
                    <ShareOptionTextView>
                        <ShareOptionText>{'Copy link'}</ShareOptionText>
                    </ShareOptionTextView>
                </ShareOptionPressable>
            </ShareOptionView>
        )
    }

    const ShareOutButton = () => {
        const shareClub = async () => {
            const title = `Join ${club?.name} on Reelay`;
            const content = { title, url: clubLink };
            const options = {};
            const sharedAction = await Share.share(content, options);
            logAmplitudeEventProd('openedShareDrawer', {
                username: reelayDBUser?.username,
                club: club?.name,
                source: 'shareOutButton',
            });    
        }

        return (
            <ShareOptionView>
                <ShareOptionPressable onPress={shareClub}>
                    <ShareOutSVG />
                    <ShareOptionIconPad />
                    <ShareOptionTextView>
                        <ShareOptionText>{'Share'}</ShareOptionText>
                    </ShareOptionTextView>
                </ShareOptionPressable>
            </ShareOptionView>
        )
    }

    const ShareToInstaStoryButton = () => {
        const openShareInstaStoryScreen = () => {
            closeDrawer();
            navigation.push('InstaStoryClubScreen', { club, url: clubLink });
        }

        return (
            <ShareOptionView>
                <ShareOptionPressable onPress={openShareInstaStoryScreen}>
                    <FontAwesomeIcon icon={faCamera} color='white' size={30} />
                    <ShareOptionIconPad />
                    <ShareOptionTextView>
                        <ShareOptionText>{'Insta story'}</ShareOptionText>
                    </ShareOptionTextView>
                </ShareOptionPressable>
            </ShareOptionView>
        )
    }


    return (
        <Modal animationType='slide' transparent={true} visible={true}>
            <Backdrop onPress={closeDrawer} />
            <DrawerView bottomOffset={bottomOffset}>
                <DrawerHeader />
                <ShareOptionsRowView>
                    { clubLink && (
                        <Fragment>
                            <CopyLinkButton />
                            <ShareOutButton />
                            <ShareToInstaStoryButton />
                        </Fragment>
                    )}
                </ShareOptionsRowView>
            </DrawerView>
        </Modal>
    )
}