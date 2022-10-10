import React, { Fragment, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, Pressable, Share, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
import * as ReelayText from '../global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// import Share from 'react-native-share';
import styled from 'styled-components/native';
import { createDeeplinkPathToReelay } from '../../api/ReelayDBApi';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCamera, faLink, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ShareOutSVG } from '../global/SVGs';
import { showMessageToast } from '../utils/toasts';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { cacheDirectory, downloadAsync, getInfoAsync, makeDirectoryAsync } from 'expo-file-system';

const CAN_USE_RN_SHARE = (Constants.appOwnership !== 'expo');

const { height, width } = Dimensions.get('window');

const BUTTON_MARGIN_WIDTH = 10;
const BUTTON_WIDTH = (width - (BUTTON_MARGIN_WIDTH * 5)) / 3;
const REELAY_WEB_BASE_URL = Constants.manifest.extra.reelayWebBaseUrl;

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
    background-color: black;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    height: auto;
    margin-top: auto;
    max-height: 70%;
    padding-top: 18px;
    padding-bottom: ${props => props.bottomOffset + 56}px;
    width: 100%;
`
const DrawerHeaderView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding-top: 10px;
    padding-left: 16px;
    padding-right: 16px;
`
const HeaderText = styled(ReelayText.H6)`
    color: white;
`
const LeftSpacer = styled(View)`
    width: 40px;
`
const ShareOptionPressable = styled(TouchableOpacity)`
    align-items: center;
    border-radius: 12px;
    height: ${BUTTON_WIDTH * 0.67}px;
    justify-content: center;
    width: ${BUTTON_WIDTH}px;
`
const ShareOptionText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    margin-top: 10px;
`
const ShareOptionView = styled(View)`
    align-items: center;
`
const ShareOptionsRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    padding: ${BUTTON_MARGIN_WIDTH}px;
`


export default ShareReelayDrawer = ({ closeDrawer, reelay }) => {
    const bottomOffset = useSafeAreaInsets().bottom;
    const [deeplinkObj, setDeeplinkObj] = useState(null);
    const { reelayDBUser } = useContext(AuthContext);

    const url = (deeplinkObj) ? REELAY_WEB_BASE_URL + deeplinkObj?.publicPath : '';

    const createOrLoadDeeplinkObj = async () => {
        const deeplinkObj = await createDeeplinkPathToReelay(reelayDBUser?.sub, reelayDBUser?.username, reelay?.sub);
        setDeeplinkObj(deeplinkObj);
    }

    useEffect(() => {
        createOrLoadDeeplinkObj();
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
            Clipboard.setStringAsync(url).then(onfulfilled => {
                showMessageToast('Shareable link copied to clipboard');
            });
        }

        return (
            <ShareOptionView>
                <ShareOptionPressable onPress={copyLink}>
                    <FontAwesomeIcon icon={faLink} color='white' size={30} />
                </ShareOptionPressable>
                <ShareOptionText>{'Copy link'}</ShareOptionText>
            </ShareOptionView>
        )
    }

    const ShareOutButton = () => {
        const shareReelay = async () => {
            const title = `${reelay?.creator?.username} on ${reelay?.title?.display}`;
            const content = { title, url };
            const options = {};
            const sharedAction = await Share.share(content, options);
            logAmplitudeEventProd('openedShareDrawer', {
                username: reelayDBUser?.username,
                title: reelay.title.display,
                source: 'shareOutButton',
            });    
        }

        return (
            <ShareOptionView>
                <ShareOptionPressable onPress={shareReelay}>
                    <ShareOutSVG />
                </ShareOptionPressable>
                <ShareOptionText>{'Share'}</ShareOptionText>
            </ShareOptionView>
        )
    }

    const ShareToInstaStoryButton = () => {
        const shareToInstagram = async () => {
            if (!CAN_USE_RN_SHARE) return;

            const videoDir = cacheDirectory + 'vid';
            const dirInfo = await getInfoAsync(videoDir);
            if (!dirInfo.exists) {
                console.log("Image directory doesn't exist, creating...");
                await makeDirectoryAsync(videoDir, { intermediates: true });
            }

            console.log('remote uri: ', reelay?.content);
            const localVideoURI = videoDir + '/' + reelay?.sub;
            console.log('local uri: ', localVideoURI);
            const localVideo = await downloadAsync(reelay?.content?.videoURI, localVideoURI);
            console.log(localVideo);

            const RN_SHARE = require('react-native-share');
            const shareResult = await RN_SHARE.default.shareSingle({
                attributionURL: url,
                backgroundVideo: localVideo?.uri,
                url: url,
                social: RN_SHARE.Social.InstagramStories,
                type: 'video/mp4',
            });
            console.log('share result: ', shareResult);
        }

        return (
            <ShareOptionView>
                <ShareOptionPressable onPress={shareToInstagram}>
                    <FontAwesomeIcon icon={faCamera} color='white' size={30} />
                </ShareOptionPressable>
                <ShareOptionText>{'Insta story'}</ShareOptionText>
            </ShareOptionView>
        )
    }


    return (
        <Modal animationType='slide' transparent={true} visible={true}>
            <Backdrop onPress={closeDrawer} />
            <DrawerView bottomOffset={bottomOffset}>
                <DrawerHeader />
                <ShareOptionsRowView>
                    { deeplinkObj && (
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