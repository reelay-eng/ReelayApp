import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, TouchableOpacity, Share } from 'react-native';
import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';
import BackButton from '../utils/BackButton';
import SimpleLineIcons from '@expo/vector-icons/Octicons';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faShare, faAdd, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import {  fetchOrCreateProfileLink } from '../../api/ProfilesApi';
import { useSelector } from 'react-redux';
import { showErrorToast } from '../../components/utils/toasts';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { ShareOutSVG } from '../global/SVGs';
import ShareOutTopicButton from '../feed/ShareOutTopicButton';

const REELAY_WEB_PREFIX = `https://on.reelay.app`;

export default ProfileTopBar = ({ creator,displayItems,selectedFilters, navigation, atProfileBase = false ,route}) => {
    const authSession = useSelector(state => state.authSession);

    const myWatchlistItems = useSelector(state => state.myWatchlistItems);
    const myWatchlistRecs = useSelector(state => state.myWatchlistRecs);
    const advanceToWatchlistScreen = () => navigation.push('WatchlistScreen', { myWatchlistItems, myWatchlistRecs, Redirect:1});
    const listData = useSelector(state => state.listData);

    const [profileLink, setProfileLink] = useState("");
    const Redirect = route?.params?.Redirect ?? 0;
    const validCreatorName = (creator?.username && (creator?.username != "[deleted]"));

    const [customLink, setCustomLink] = useState("");
    

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


    const HeadingText = styled(ReelayText.H5Bold)`
        color: #b4b4b4;
        padding-left: ${atProfileBase ? 10: 0}px;
        font-size:14px;
        font-weight:normal;
    `
    const IconContainer = styled(TouchableOpacity)`
        margin-left: 12px;
        opacity:${selectedFilters == "Reelays" ?1:0.3}
    `
    const IconContainer2 = styled(TouchableOpacity)`
        margin-left: 12px;
        opacity:${selectedFilters == "All" || selectedFilters == "Reelays" || selectedFilters == "Custom" ?1:0.3}
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
        justify-content:space-between;
        flex-direction: row;
        height: 40px;
        margin-left: 3px;
        margin-botttom: 3px;
        margin-right: 10px;
        shadow-color: white;
        shadow-offset: 8px;
        shadow-radius: 2px;
    `

    const ShareProfileLinkButton = () => {
        return (
            <IconContainer >
                <FontAwesomeIcon icon={faShare} color='white' size={24} />
            </IconContainer>
        );
    }

    const RightCornerButtons = () => {
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
                <IconContainer onPress={()=>selectedFilters == "Reelays"  ? shareProfileLink():{}}>
                    <FontAwesomeIcon icon={faShare} color={selectedFilters == "Reelays"  ? 'white':'#b8b8b8'} size={24} />
                </IconContainer>
            );
        }


        return (
            <>
                { validCreatorName && 
                <>
                {selectedFilters == "Reelays" ?
                <ShareProfileLinkButton />:<View/>}
                </>}
            </>
        );
    }

    const AddButton = () => {
        const onPress = () => {
            if(selectedFilters == "All"){
                advanceToWatchlistScreen()
            }else if(selectedFilters == "Reelays"){
                navigation.push('SelectTitleScreen')
            }else{
                navigation.push('CreateListScreen')
            }
            // navigation.push('SearchScreen', { addCustomWatchlist: true, Redirect, checkMark:true });

        }
        return (
            <IconContainer2  onPress={()=>selectedFilters == "All" || selectedFilters == "Reelays" || selectedFilters == "Custom"  ? onPress():{}}>
                <SimpleLineIcons name={"plus-circle"} size={24} color={selectedFilters == "All" || selectedFilters == "Reelays" || selectedFilters == "Custom"  ? 'white':'#b8b8b8'} />
            </IconContainer2>
        );
    }


    return (
        <TopBarContainer>
            <View> 
                {selectedFilters == "All" || selectedFilters == "Reelays" || selectedFilters == "Custom" ?
                <AddButton />:<View/>}
            {/* <AddButton /> */}
            </View>
            <HeadingText>{ selectedFilters == "Custom"  ? listData?.length:selectedFilters == "Reelays"  ? displayItems :displayItems?.length} {selectedFilters == "Custom"  ? "Lists":"Titles"}</HeadingText>
            <RightCornerButtons />
        </TopBarContainer>
    );
}
